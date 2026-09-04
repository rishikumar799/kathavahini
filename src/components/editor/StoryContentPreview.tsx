import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Tag, 
  FileText,
  Quote
} from 'lucide-react';
import { StoryContentType, ContentBlock, StoryImagePage, SourceDocumentInfo, StoryCategory } from '../../types';

interface StoryContentPreviewProps {
  title: string;
  teluguTitle: string;
  subtitle?: string;
  category: StoryCategory;
  tags: string[];
  coverImageUrl?: string;
  authorName: string;
  contentType: StoryContentType;
  textContent: string;
  contentBlocks: ContentBlock[];
  imagePages: StoryImagePage[];
  sourceDocument?: SourceDocumentInfo;
}

export const StoryContentPreview: React.FC<StoryContentPreviewProps> = ({
  title,
  teluguTitle,
  subtitle,
  category,
  tags,
  coverImageUrl,
  authorName,
  contentType,
  textContent,
  contentBlocks,
  imagePages,
  sourceDocument
}) => {
  const [activeImagePageIndex, setActiveImagePageIndex] = useState(0);

  const displayTitle = teluguTitle || title || 'శీర్షిక లేని కథ';
  const paragraphs = textContent.split('\n\n').filter(p => p.trim());
  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 160));

  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-[#18181D] p-6 sm:p-10 rounded-3xl border border-[#E8E1DA] dark:border-[#2E2D36] shadow-sm font-serif-telugu">
      {/* Category Badge & Read Time */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#E8E1DA] dark:border-[#2E2D36] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] font-bold">
            {category}
          </span>
          <span className="text-[#6F6970] dark:text-[#AAA4AC]">
            రూపకల్పన: <strong>{contentType === 'rich_text' ? 'సాహిత్యం' : contentType === 'document_import' ? 'పత్రం' : contentType === 'image_pages' ? 'చిత్ర పేజీలు' : 'మిశ్రమ బ్లాకులు'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6F6970] dark:text-[#AAA4AC]">
          <Clock className="w-3.5 h-3.5" />
          <span>~{readingTime} నిమిషాల పఠనం</span>
        </div>
      </div>

      {/* Story Title & Subtitle */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-4xl font-bold text-[#17151A] dark:text-[#F7F3EE] leading-tight">
          {displayTitle}
        </h1>
        {title && teluguTitle && title !== teluguTitle && (
          <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] font-sans">
            {title}
          </p>
        )}
        {subtitle && (
          <p className="text-base text-[#6F6970] dark:text-[#AAA4AC] italic">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-2 pt-2 text-xs text-[#6F6970] dark:text-[#AAA4AC]">
          <span>రచయిత: <strong className="text-[#17151A] dark:text-[#F7F3EE]">{authorName}</strong></span>
          <span>•</span>
          <span>తేదీ: {new Date().toLocaleDateString('te-IN')}</span>
        </div>
      </div>

      {/* Cover Image */}
      {coverImageUrl && (
        <div className="rounded-2xl overflow-hidden shadow-md max-h-96 w-full bg-[#FAF7F2] dark:bg-[#222229]">
          <img
            src={coverImageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Story Body Renderer based on Content Type */}
      <div className="space-y-6 text-[#17151A] dark:text-[#F7F3EE] text-lg leading-relaxed pt-2">
        {/* Mode 1 & 2: Rich Text & Document Import */}
        {(contentType === 'rich_text' || contentType === 'document_import') && (
          <div className="space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <p key={idx} className="leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-[#9B959E] italic text-center py-8">
                కథలో ఇంకా ఎలాంటి కంటెంట్ లేదు...
              </p>
            )}

            {/* If there's an attached source document */}
            {sourceDocument && (
              <div className="mt-8 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#7A284B] dark:text-[#D87591]" />
                  <span>జతచేయబడిన మూల పత్రం: <strong>{sourceDocument.name}</strong></span>
                </div>
                {sourceDocument.storageUrl && (
                  <a
                    href={sourceDocument.storageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7A284B] dark:text-[#D87591] font-bold hover:underline"
                  >
                    పత్రాన్ని చూడండి
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mode 3: Image-Based Story Pages */}
        {contentType === 'image_pages' && (
          <div className="space-y-4">
            {imagePages.length > 0 ? (
              <div className="space-y-4">
                {/* Active Page Display */}
                <div className="relative bg-[#FAF7F2] dark:bg-[#202027] rounded-2xl overflow-hidden border border-[#E8E1DA] dark:border-[#2E2D36] flex flex-col items-center p-4">
                  <div className="w-full flex items-center justify-between text-xs text-[#6F6970] dark:text-[#AAA4AC] mb-2 px-2">
                    <span className="font-bold">పేజీ {activeImagePageIndex + 1} / {imagePages.length}</span>
                    <span>చిత్ర కథా దర్శిని</span>
                  </div>

                  <img
                    src={imagePages[activeImagePageIndex]?.imageUrl}
                    alt={`పేజీ ${activeImagePageIndex + 1}`}
                    className="max-h-[70vh] w-auto object-contain rounded-xl shadow-sm"
                  />

                  {imagePages[activeImagePageIndex]?.caption && (
                    <p className="mt-3 text-xs text-center text-[#6F6970] dark:text-[#AAA4AC] max-w-lg">
                      {imagePages[activeImagePageIndex]?.caption}
                    </p>
                  )}
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveImagePageIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeImagePageIndex === 0}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-bold disabled:opacity-30 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>మునుపటి పేజీ</span>
                  </button>

                  <div className="flex items-center gap-1 overflow-x-auto max-w-xs py-1">
                    {imagePages.map((_, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setActiveImagePageIndex(pIdx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          pIdx === activeImagePageIndex
                            ? 'bg-[#7A284B] text-white'
                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#6F6970]'
                        }`}
                      >
                        {pIdx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveImagePageIndex(prev => Math.min(imagePages.length - 1, prev + 1))}
                    disabled={activeImagePageIndex === imagePages.length - 1}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-bold disabled:opacity-30 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>తదుపరి పేజీ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[#9B959E] italic text-center py-8">
                చిత్ర కథా పేజీలు ఇంకా జోడించలేదు...
              </p>
            )}
          </div>
        )}

        {/* Mode 4: Mixed Content Blocks */}
        {contentType === 'mixed' && (
          <div className="space-y-6">
            {contentBlocks.length > 0 ? (
              contentBlocks.map((block) => (
                <div key={block.id}>
                  {block.type === 'paragraph' && (
                    <p className="leading-relaxed">{block.content}</p>
                  )}

                  {block.type === 'heading' && (
                    <h2 className={`font-bold text-[#7A284B] dark:text-[#D87591] ${block.level === 3 ? 'text-xl mt-4' : 'text-2xl mt-6'}`}>
                      {block.content}
                    </h2>
                  )}

                  {block.type === 'quote' && (
                    <blockquote className="p-4 my-4 rounded-xl bg-[#7A284B]/5 border-l-4 border-[#7A284B] italic">
                      <p className="text-lg">"{block.content}"</p>
                      {block.caption && (
                        <footer className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-2 not-italic">
                          — {block.caption}
                        </footer>
                      )}
                    </blockquote>
                  )}

                  {block.type === 'image' && block.imageUrl && (
                    <figure className="my-6 space-y-2">
                      <img
                        src={block.imageUrl}
                        alt={block.caption || 'కథ చిత్రం'}
                        className="rounded-2xl max-h-96 w-auto mx-auto object-contain shadow-sm"
                      />
                      {block.caption && (
                        <figcaption className="text-center text-xs text-[#6F6970] dark:text-[#AAA4AC] italic">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {block.type === 'list' && (
                    <ul className={`my-4 pl-6 space-y-1.5 ${block.listStyle === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
                      {(block.listItems || []).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {block.type === 'divider' && (
                    <div className="py-6 flex items-center justify-center">
                      <div className="w-24 h-[1px] bg-[#7A284B]/30" />
                      <span className="px-3 text-[#7A284B] text-xs">✦ ✦ ✦</span>
                      <div className="w-24 h-[1px] bg-[#7A284B]/30" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[#9B959E] italic text-center py-8">
                కథలో ఇంకా ఎలాంటి బ్లాకులు లేవు...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tags Footer */}
      {tags.length > 0 && (
        <div className="pt-6 border-t border-[#E8E1DA] dark:border-[#2E2D36] flex flex-wrap items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-[#6F6970]" />
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#6F6970] dark:text-[#AAA4AC]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
