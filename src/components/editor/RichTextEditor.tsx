import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading2, 
  Heading3, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Undo2, 
  Redo2, 
  Maximize2, 
  Minimize2,
  Minus
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isDistractionFree?: boolean;
  onToggleDistractionFree?: () => void;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'ఇక్కడ మీ కథను రాయడం ప్రారంభించండి... (Start writing your Telugu story here...)',
  isDistractionFree = false,
  onToggleDistractionFree,
  minHeight = '320px'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef<number>(0);

  // Compute live statistics
  const wordCount = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const characterCount = value.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 160));

  // Save history on change if significantly different
  const handleTextChange = (newVal: string) => {
    onChange(newVal);
    
    // Throttle history saves
    const currentHist = historyRef.current;
    const currIdx = historyIndexRef.current;
    if (newVal !== currentHist[currIdx]) {
      const newHist = currentHist.slice(0, currIdx + 1);
      newHist.push(newVal);
      if (newHist.length > 50) newHist.shift();
      historyRef.current = newHist;
      historyIndexRef.current = newHist.length - 1;
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevVal = historyRef.current[historyIndexRef.current];
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextVal = historyRef.current[historyIndexRef.current];
      onChange(nextVal);
    }
  };

  // Helper to wrap selected text or insert markdown/unicode formatting safely
  const formatSelection = (prefix: string, suffix: string = prefix, defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultPlaceholder;

    const before = currentText.substring(0, start);
    const after = currentText.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = `${before}${replacement}${after}`;

    handleTextChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const insertBlockPrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    // Find start of current line
    const lastNewline = currentText.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const beforeLine = currentText.substring(0, lineStart);
    const afterLine = currentText.substring(lineStart);

    const newText = `${beforeLine}${prefix} ${afterLine}`;
    handleTextChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length + 1, end + prefix.length + 1);
    }, 10);
  };

  return (
    <div className={`flex flex-col border border-[#E8E1DA] dark:border-[#2E2D36] rounded-2xl bg-white dark:bg-[#18181D] overflow-hidden shadow-sm transition-all duration-300 ${
      isDistractionFree ? 'fixed inset-0 z-50 rounded-none border-none p-6 sm:p-12 bg-[#FAF7F2] dark:bg-[#121216]' : ''
    }`}>
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 sm:p-3 bg-[#FAF7F2] dark:bg-[#202027] border-b border-[#E8E1DA] dark:border-[#2E2D36]">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndexRef.current <= 0}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="వెనక్కి (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="ముందుకు (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-[#E8E1DA] dark:bg-[#2E2D36] mx-1" />

          {/* Text Style Controls */}
          <button
            type="button"
            onClick={() => formatSelection('**', '**', 'బోల్డ్ టెక్స్ట్')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="బోల్డ్ (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatSelection('*', '*', 'ఇటాలిక్ టెక్స్ట్')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="ఇటాలిక్ (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatSelection('<u>', '</u>', 'అండర్‌లైన్ టెక్స్ట్')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="అండర్‌లైన్ (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-[#E8E1DA] dark:bg-[#2E2D36] mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => insertBlockPrefix('##')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="ప్రధాన ఉప శీర్షిక (Heading 2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlockPrefix('###')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="చిన్న ఉప శీర్షిక (Heading 3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          {/* Quotes & Lists */}
          <button
            type="button"
            onClick={() => insertBlockPrefix('>')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="కొటేషన్ / సూక్తి (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlockPrefix('•')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="బుల్లెట్ జాబితా (Bullet List)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlockPrefix('1.')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="క్రమ సంఖ్య జాబితా (Numbered List)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatSelection('\n---\n', '', '')}
            className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#7A284B] dark:hover:text-[#D87591] hover:bg-[#7A284B]/10 cursor-pointer"
            title="విభాజకం (Divider)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Zen Mode & Live Stats */}
        <div className="flex items-center gap-3 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <span className="hidden sm:inline font-medium">
            {wordCount} పదాలు • {characterCount} అక్షరాలు • ~{readingTimeMinutes} నిమి
          </span>
          {onToggleDistractionFree && (
            <button
              type="button"
              onClick={onToggleDistractionFree}
              className="p-1.5 rounded-lg text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title={isDistractionFree ? 'సాధారణ వీక్షణ (Exit Zen Mode)' : 'సాహిత్య ఏకాగ్రత వీక్షణ (Distraction-Free Zen Mode)'}
            >
              {isDistractionFree ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className={`flex-1 relative ${isDistractionFree ? 'max-w-3xl mx-auto w-full' : ''}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight: isDistractionFree ? '70vh' : minHeight }}
          className="w-full p-4 sm:p-6 bg-transparent text-[#17151A] dark:text-[#F7F3EE] font-serif-telugu text-base sm:text-lg leading-relaxed resize-y focus:outline-none placeholder:text-[#9B959E] dark:placeholder:text-[#6F6970]"
          spellCheck="false"
        />
      </div>

      {/* Bottom Footer Info Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] text-[#6F6970] dark:text-[#AAA4AC] bg-[#FAF7F2]/50 dark:bg-[#18181D]/50 border-t border-[#E8E1DA]/60 dark:border-[#2E2D36]/60">
        <span>తెలుగు యూనికోడ్ సపోర్ట్ (Telugu Unicode Enabled)</span>
        <span>పేరా విభజన కోసం Enter రెండుసార్లు నొక్కండి</span>
      </div>
    </div>
  );
};
