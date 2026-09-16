import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download, 
  Heart, 
  Share2, 
  BookOpen, 
  Sparkles,
  Type
} from 'lucide-react';
import { BalavinodhiniItem } from '../../types';

interface BalavinodhiniBookReaderModalProps {
  book: BalavinodhiniItem;
  onClose: () => void;
  onLikeToggle: (id: string) => void;
  onShare: (item: BalavinodhiniItem) => void;
}

export const BalavinodhiniBookReaderModal: React.FC<BalavinodhiniBookReaderModalProps> = ({
  book,
  onClose,
  onLikeToggle,
  onShare,
}) => {
  const pages = book.bookPages && book.bookPages.length > 0 ? book.bookPages : [
    { pageNumber: 1, title: book.teluguTitle || book.title, content: book.content, imageUrl: book.coverImage }
  ];

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  // Escape & Arrow keys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(pages.length - 1, p + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, pages.length]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'huge': return 'text-xl sm:text-2xl leading-loose';
      case 'large': return 'text-lg sm:text-xl leading-relaxed';
      default: return 'text-base sm:text-lg leading-relaxed';
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${book.teluguTitle || book.title}</title>
            <style>
              body { font-family: 'Mandali', 'Suranna', sans-serif; padding: 40px; color: #17151A; }
              .page { page-break-after: always; margin-bottom: 50px; text-align: center; }
              img { max-width: 80%; max-height: 350px; object-fit: cover; border-radius: 12px; margin: 20px 0; }
              h1 { color: #7A284B; }
              h3 { color: #555; }
              p { font-size: 20px; line-height: 1.8; max-width: 700px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="page">
              <h1>${book.teluguTitle || book.title}</h1>
              <h3>రచన: ${book.authorName || 'కథావాహిని'}</h3>
              ${book.coverImage ? `<img src="${book.coverImage}" />` : ''}
              <p>${book.teluguDescription || book.description || ''}</p>
            </div>
            ${pages.map((p, idx) => `
              <div class="page">
                <h2>${p.title || `పేజీ ${idx + 1}`}</h2>
                ${p.imageUrl ? `<img src="${p.imageUrl}" />` : ''}
                <p>${p.content.replace(/\n/g, '<br/>')}</p>
              </div>
            `).join('')}
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleDownload = () => {
    const text = `${book.teluguTitle || book.title}\nరచయిత: ${book.authorName || 'కథావాహిని'}\n\n` +
      pages.map(p => `--- ${p.title || `పేజీ ${p.pageNumber}`} ---\n${p.content}`).join('\n\n') +
      `\n\n© కథావాహిని బాలవినోదిని`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(book.teluguTitle || book.title).replace(/\s+/g, '_')}_పుస్తకం.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const current = pages[currentPage];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#FFFDF9] dark:bg-[#151419] rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-2xl overflow-hidden">
        
        {/* Top Navigation Bar - Sticky with Prominent Close Button */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-[#18181D]/95 backdrop-blur-md border-b border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">📚</span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] truncate">
                {book.teluguTitle || book.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6F6970] dark:text-[#AAA4AC] font-serif-telugu truncate">
                రచన: {book.authorName || 'కథావాహిని'} • పేజీ {currentPage + 1} / {pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Font Size Toggle */}
            <button
              onClick={() => setFontSize(f => f === 'normal' ? 'large' : f === 'large' ? 'huge' : 'normal')}
              className="p-2 rounded-xl text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] transition-colors cursor-pointer"
              title="అక్షరాల పరిమాణం మార్చండి"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] transition-colors cursor-pointer"
              title="పుస్తకం ప్రింట్ చేసుకోండి"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl text-[#6F6970] dark:text-[#AAA4AC] hover:text-[#17151A] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#23222A] transition-colors cursor-pointer"
              title="పుస్తకం డౌన్‌లోడ్ చేసుకోండి"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* PROMINENT CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs sm:text-sm font-serif-telugu shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-rose-300 dark:ring-rose-900"
              title="మూసివేయి (Close)"
              aria-label="మూసివేయి"
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">మూసివేయి</span>
            </button>
          </div>
        </div>

        {/* Page Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-5">
            {/* Page Header */}
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#7A284B]/10 dark:bg-[#D87591]/20 text-[#7A284B] dark:text-[#D87591] font-bold text-xs font-serif-telugu">
              {current?.title || `పేజీ ${currentPage + 1}`}
            </div>

            {/* Page Illustration */}
            {current?.imageUrl && (
              <div className="w-full max-h-72 overflow-hidden rounded-2xl shadow-sm border border-[#E8E1DA] dark:border-[#2E2D36]">
                <img
                  src={current.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Page Text */}
            <div className={`font-serif-telugu font-medium text-[#17151A] dark:text-[#F7F3EE] whitespace-pre-wrap ${getFontSizeClass()}`}>
              {current?.content}
            </div>
          </div>
        </div>

        {/* Bottom Page Navigation & Interactive Bar */}
        <div className="px-6 py-4 border-t border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between bg-white dark:bg-[#18181D]">
          <button
            disabled={currentPage <= 0}
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#23222A] hover:bg-[#E8E1DA] dark:hover:bg-[#2E2D36] text-xs sm:text-sm font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] disabled:opacity-30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>మునుపటి పేజీ</span>
          </button>

          {/* Page Indicators Dots */}
          <div className="flex items-center gap-1.5">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentPage === idx
                    ? 'w-6 bg-[#7A284B] dark:bg-[#D87591]'
                    : 'bg-[#E8E1DA] dark:bg-[#2E2D36] hover:bg-[#6F6970]'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentPage >= pages.length - 1}
            onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
            className="px-4 py-2 rounded-xl bg-[#7A284B] text-white dark:bg-[#D87591] text-xs sm:text-sm font-bold font-serif-telugu disabled:opacity-30 hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>తరువాతి పేజీ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
