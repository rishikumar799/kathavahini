import React, { useRef, useState, useEffect } from 'react';
import { 
  Palette, 
  Eraser, 
  Paintbrush, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Upload, 
  Printer, 
  Send, 
  CheckCircle,
  Sparkles,
  User
} from 'lucide-react';
import { balavinodhiniService } from '../../services/balavinodhiniService';
import { BalavinodhiniAgeGroup } from '../../types';

interface BalavinodhiniDrawingEditorProps {
  currentUserId?: string;
  currentUserName?: string;
  onSuccessSubmit?: () => void;
  onClose?: () => void;
}

const PALETTE_COLORS = [
  '#E63946', // Red
  '#F4A261', // Orange
  '#E76F51', // Terracotta
  '#E9C46A', // Yellow
  '#2A9D8F', // Teal
  '#4CAF50', // Green
  '#0077B6', // Blue
  '#7A284B', // Burgundy
  '#9D4EDD', // Purple
  '#FF70A6', // Pink
  '#795548', // Brown
  '#17151A', // Black
];

export const BalavinodhiniDrawingEditor: React.FC<BalavinodhiniDrawingEditorProps> = ({
  currentUserId,
  currentUserName,
  onSuccessSubmit,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState<string>('#E63946');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Form submission state
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState(currentUserName || '');
  const [artistAge, setArtistAge] = useState<BalavinodhiniAgeGroup>('7-9');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryIndex(0);
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prevIndex = historyIndex - 1;
      ctx.putImageData(history[prevIndex], 0, 0);
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nextIndex = historyIndex + 1;
      ctx.putImageData(history[nextIndex], 0, 0);
      setHistoryIndex(nextIndex);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.trim() || 'balavinodhini-drawing'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>${title || 'బాలవినోదిని చిత్రం'}</title></head>
          <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:sans-serif;">
            <h2>${title || 'చిన్నారి వర్ణచిత్రం'}</h2>
            <p>రచన / చిత్రకళ: ${artistName || 'బాల సృజనకారుడు'} (${artistAge} సం.) | కథావాహిని బాలవినోదిని</p>
            <img src="${dataUrl}" style="max-width:90%;border:2px solid #ccc;border-radius:12px;" />
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveHistoryState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitToCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !title.trim()) return;

    setIsSubmitting(true);
    const dataUrl = canvas.toDataURL('image/png');

    try {
      await balavinodhiniService.submitCreation({
        title: title.trim(),
        teluguTitle: title.trim(),
        description: `చిన్నారి ${artistName || 'సృజనకారుడు'} గీసిన అందమైన వర్ణచిత్రం.`,
        teluguDescription: `చిన్నారి ${artistName || 'సృజనకారుడు'} గీసిన అందమైన వర్ణచిత్రం.`,
        content: 'సృజనాత్మక ప్రపంచం డ్రాయింగ్ బోర్డులో రూపొందించిన వర్ణచిత్రం.',
        contentType: 'drawing',
        section: 'balavinodhini',
        categoryId: 'creations',
        subcategoryId: 'డ్రాయింగ్స్ & ఆర్ట్',
        ageGroup: artistAge,
        coverImage: dataUrl,
        drawingDataUrl: dataUrl,
        authorId: currentUserId || 'guest-creator',
        authorName: artistName.trim() || 'చిరు చిత్రకారుడు',
        authorBio: `${artistAge} సం. చిరు సృజనకారుడు`,
        status: 'published',
        moderationStatus: 'approved',
      });

      setSubmitted(true);
      setTimeout(() => {
        if (onSuccessSubmit) onSuccessSubmit();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Sub-header */}
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🎨</span>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold font-serif-telugu text-rose-900 dark:text-rose-200">
            రంగుల బొమ్మల వేదిక (Drawing Studio)
          </h4>
          <p className="text-xs text-rose-800/80 dark:text-rose-300/80 font-serif-telugu">
            మీ ఊహా ప్రపంచానికి రంగులు అద్దండి, సేవ్ చేయండి, లేదా నేరుగా పంచుకోండి!
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36]">
        {/* Tool Selectors */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('brush')}
            className={`p-2 rounded-xl text-xs font-bold font-serif-telugu flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === 'brush'
                ? 'bg-[#7A284B] text-white dark:bg-[#D87591] shadow-xs'
                : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36]'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>బ్రష్</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl text-xs font-bold font-serif-telugu flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === 'eraser'
                ? 'bg-[#7A284B] text-white dark:bg-[#D87591] shadow-xs'
                : 'bg-white dark:bg-[#18181D] text-[#17151A] dark:text-[#F7F3EE] border border-[#E8E1DA] dark:border-[#2E2D36]'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>ఎరేజర్</span>
          </button>

          {/* Brush Size */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#18181D] rounded-xl border border-[#E8E1DA] dark:border-[#2E2D36]">
            <span className="text-[11px] font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">పరిమాణం:</span>
            <input
              type="range"
              min="2"
              max="28"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-[#7A284B] dark:accent-[#D87591] cursor-pointer"
            />
            <span className="text-[11px] font-bold">{brushSize}px</span>
          </div>
        </div>

        {/* Action Buttons: Undo, Redo, Clear, Upload */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] disabled:opacity-30 cursor-pointer"
            title="వెనుకకు (Undo)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] disabled:opacity-30 cursor-pointer"
            title="ముందుకు (Redo)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            title="పూర్తిగా తుడవండి"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <label className="p-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2] cursor-pointer" title="చిత్రం అప్‌లోడ్ చేయండి">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleDownloadPNG}
            className="p-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
            title="చిత్రం డౌన్‌లోడ్ చేసుకోండి (PNG)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
            title="ప్రింట్ చేయండి"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC] mr-1">
          రంగులు:
        </span>
        {PALETTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              setTool('brush');
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer border-2 ${
              color === c && tool === 'brush' ? 'scale-120 border-white ring-2 ring-[#7A284B] shadow-sm' : 'border-transparent hover:scale-110'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Drawing Canvas Board */}
      <div className="w-full flex justify-center bg-[#EDE8E1] dark:bg-[#101014] p-3 sm:p-5 rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36] overflow-auto">
        <canvas
          ref={canvasRef}
          width={700}
          height={480}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white rounded-xl shadow-md cursor-crosshair touch-none max-w-full"
        />
      </div>

      {/* Community Submission Form */}
      <form onSubmit={handleSubmitToCommunity} className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#23222A] border border-[#E8E1DA] dark:border-[#2E2D36] space-y-4">
        <h4 className="text-sm sm:text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>సృజనాత్మక ప్రపంచంలో మీ బొమ్మను ప్రచురించండి!</span>
        </h4>

        {submitted ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-sm font-serif-telugu animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>మీ అందమైన చిత్రం విజయవంతంగా ప్రచురించబడింది! ధన్యవాదాలు చిరు సృజనకారుడా! 🎉</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                  చిత్రం పేరు *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ఉదా: అందమైన నెమలి"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                  చిన్నారి పేరు *
                </label>
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="మీ పేరు"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold font-serif-telugu text-[#6F6970] dark:text-[#AAA4AC]">
                  వయస్సు విభాగం
                </label>
                <select
                  value={artistAge}
                  onChange={(e) => setArtistAge(e.target.value as BalavinodhiniAgeGroup)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs sm:text-sm font-serif-telugu focus:ring-2 focus:ring-[#7A284B] focus:outline-none cursor-pointer"
                >
                  <option value="4-6">4–6 సంవత్సరాలు</option>
                  <option value="7-9">7–9 సంవత్సరాలు</option>
                  <option value="10-12">10–12 సంవత్సరాలు</option>
                  <option value="13-15">13–15 సంవత్సరాలు</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#7A284B] text-white dark:bg-[#D87591] font-bold font-serif-telugu text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'ప్రచురించబడుతోంది...' : 'సృజనాత్మక ప్రపంచంలో ప్రచురించండి 🚀'}</span>
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
