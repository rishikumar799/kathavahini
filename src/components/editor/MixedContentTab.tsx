import React, { useState } from 'react';
import { 
  Type, 
  Heading2, 
  Quote, 
  Image as ImageIcon, 
  List as ListIcon, 
  Minus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Plus, 
  UploadCloud, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { ContentBlock, ContentBlockType } from '../../types';
import { storageService } from '../../services/storageService';

interface MixedContentTabProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  storyId?: string;
}

export const MixedContentTab: React.FC<MixedContentTabProps> = ({
  blocks,
  onChange,
  storyId = `story-${Date.now()}`
}) => {
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      listItems: type === 'list' ? [''] : undefined,
      listStyle: 'bullet',
      align: 'left'
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeBlock = (index: number) => {
    const target = blocks[index];
    const next = blocks.filter((_, idx) => idx !== index);
    onChange(next);

    if (target?.imagePath) {
      storageService.deleteFileByPath(target.imagePath).catch(() => {});
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const duplicateBlock = (index: number) => {
    const source = blocks[index];
    const cloned: ContentBlock = {
      ...source,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    const next = [...blocks];
    next.splice(index + 1, 0, cloned);
    onChange(next);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const block = blocks[index];
    setUploadingBlockId(block.id);

    try {
      const uploadRes = await storageService.uploadStoryContentImage(storyId, file);
      updateBlock(index, {
        imageUrl: uploadRes.downloadUrl,
        imagePath: uploadRes.storagePath,
        imageMetadata: uploadRes.metadata
      });
    } catch (err: any) {
      alert(`చిత్రం అప్‌లోడ్ చేయడంలో విఫలమైంది: ${err.message || 'Error'}`);
    } finally {
      setUploadingBlockId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Header */}
      <div className="p-4 rounded-2xl bg-[#7A284B]/5 dark:bg-[#7A284B]/10 border border-[#7A284B]/20 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-[#7A284B] text-white shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE]">
            మిశ్రమ కంటెంట్ బిల్డర్ (Mixed Content Story Builder)
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mt-0.5 leading-relaxed">
            మీ కథను టెక్స్ట్ పేరాలు, ఉప శీర్షికలు, కొటేషన్లు, సందర్భోచిత చిత్రాలు మరియు జాబితా బ్లాకులతో ఆకర్షణీయమైన పద్ధతిలో నిర్మించండి.
          </p>
        </div>
      </div>

      {/* Top Add Block Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FAF7F2] dark:bg-[#202027] rounded-2xl border border-[#E8E1DA] dark:border-[#2E2D36]">
        <span className="text-xs font-bold text-[#17151A] dark:text-[#F7F3EE] mr-2">బ్లాక్ జోడించండి:</span>
        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Type className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
          <span>+ పేరా</span>
        </button>
        <button
          type="button"
          onClick={() => addBlock('heading')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Heading2 className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
          <span>+ శీర్షిక</span>
        </button>
        <button
          type="button"
          onClick={() => addBlock('quote')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Quote className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
          <span>+ కొటేషన్</span>
        </button>
        <button
          type="button"
          onClick={() => addBlock('image')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
          <span>+ చిత్రం</span>
        </button>
        <button
          type="button"
          onClick={() => addBlock('list')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ListIcon className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
          <span>+ జాబితా</span>
        </button>
        <button
          type="button"
          onClick={() => addBlock('divider')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5 text-[#7A284B] dark:text-[#D87591]" />
          <span>+ విభాజకం</span>
        </button>
      </div>

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#18181D] text-center">
          <div className="p-4 rounded-full bg-[#7A284B]/10 text-[#7A284B] dark:text-[#D87591] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#17151A] dark:text-[#F7F3EE] mb-1">
            ఇంకా ఎలాంటి బ్లాకులు జోడించలేదు
          </h4>
          <p className="text-xs text-[#6F6970] dark:text-[#AAA4AC] mb-4">
            మొదటి పేరా లేదా శీర్షిక బ్లాక్‌ను జోడించి కథను ప్రారంభించండి.
          </p>
          <button
            type="button"
            onClick={() => addBlock('paragraph')}
            className="px-5 py-2 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>మొదటి పేరా బ్లాక్ జోడించండి</span>
          </button>
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="group rounded-2xl bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] overflow-hidden shadow-sm hover:border-[#7A284B]/40 transition-all"
          >
            {/* Block Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF7F2] dark:bg-[#202027] border-b border-[#E8E1DA]/80 dark:border-[#2E2D36]/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#7A284B] dark:text-[#D87591]">
                {block.type === 'paragraph' && <><Type className="w-3.5 h-3.5" /> <span>పేరా #{index + 1}</span></>}
                {block.type === 'heading' && <><Heading2 className="w-3.5 h-3.5" /> <span>ఉప శీర్షిక (H{block.level || 2})</span></>}
                {block.type === 'quote' && <><Quote className="w-3.5 h-3.5" /> <span>కొటేషన్ / సూక్తి</span></>}
                {block.type === 'image' && <><ImageIcon className="w-3.5 h-3.5" /> <span>కథా చిత్రం</span></>}
                {block.type === 'list' && <><ListIcon className="w-3.5 h-3.5" /> <span>జాబితా</span></>}
                {block.type === 'divider' && <><Minus className="w-3.5 h-3.5" /> <span>విభాజకం</span></>}
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                  title="పైకి జరపండి"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-[#6F6970] dark:text-[#AAA4AC]" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                  title="కిందికి జరపండి"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-[#6F6970] dark:text-[#AAA4AC]" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicateBlock(index)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  title="నకలు (Duplicate)"
                >
                  <Copy className="w-3.5 h-3.5 text-[#6F6970] dark:text-[#AAA4AC]" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 cursor-pointer"
                  title="తొలగించు"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Block Body Content */}
            <div className="p-4">
              {block.type === 'paragraph' && (
                <textarea
                  value={block.content || ''}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="ఈ పేరాలో తెలుగు సాహిత్యాన్ని రాయండి..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-1 focus:ring-[#7A284B]"
                />
              )}

              {block.type === 'heading' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={block.content || ''}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="ఉప శీర్షిక రాయండి..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-base font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-1 focus:ring-[#7A284B]"
                    />
                    <select
                      value={block.level || 2}
                      onChange={(e) => updateBlock(index, { level: Number(e.target.value) as 2 | 3 })}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs font-semibold text-[#17151A] dark:text-[#F7F3EE]"
                    >
                      <option value={2}>Heading 2 (పెద్దది)</option>
                      <option value={3}>Heading 3 (చిన్నది)</option>
                    </select>
                  </div>
                </div>
              )}

              {block.type === 'quote' && (
                <div className="space-y-3 p-4 rounded-xl bg-[#7A284B]/5 border-l-4 border-[#7A284B]">
                  <textarea
                    value={block.content || ''}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="కొటేషన్ లేదా సూక్తిని ఇక్కడ రాయండి..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-white dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-sm font-serif-telugu italic text-[#17151A] dark:text-[#F7F3EE] focus:outline-none focus:ring-1 focus:ring-[#7A284B]"
                  />
                  <input
                    type="text"
                    value={block.caption || ''}
                    onChange={(e) => updateBlock(index, { caption: e.target.value })}
                    placeholder="రచయిత లేదా మూలం (Attribution / Source)..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE]"
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-3">
                  {block.imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#E8E1DA] dark:border-[#2E2D36] max-h-80 bg-[#FAF7F2] dark:bg-[#222229] flex justify-center">
                      <img
                        src={block.imageUrl}
                        alt={block.caption || 'Story Image'}
                        className="max-h-72 w-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => updateBlock(index, { imageUrl: '', imagePath: undefined })}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-colors cursor-pointer"
                        title="చిత్రం మార్చండి"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border-2 border-dashed border-[#E8E1DA] dark:border-[#2E2D36] bg-[#FAF7F2] dark:bg-[#222229] text-center space-y-3">
                      {uploadingBlockId === block.id ? (
                        <div className="flex flex-col items-center justify-center py-4 space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#7A284B]" />
                          <span className="text-xs font-semibold">చిత్రం అప్‌లోడ్ అవుతోంది...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center gap-3">
                            <label className="px-4 py-2 rounded-xl bg-[#7A284B] hover:bg-[#631F3C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                              <UploadCloud className="w-4 h-4" />
                              <span>డివైజ్ నుండి అప్‌లోడ్ చేయండి</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleImageUpload(index, f);
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div className="text-xs text-[#6F6970] dark:text-[#AAA4AC]">లేదా URL పేస్ట్ చేయండి:</div>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                updateBlock(index, { imageUrl: e.target.value.trim() });
                              }
                            }}
                            className="w-full max-w-md mx-auto px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs"
                          />
                        </>
                      )}
                    </div>
                  )}

                  <input
                    type="text"
                    value={block.caption || ''}
                    onChange={(e) => updateBlock(index, { caption: e.target.value })}
                    placeholder="చిత్రం యొక్క వివరణ / క్యాప్షన్ (ఐచ్ఛికం)..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE]"
                  />
                </div>
              )}

              {block.type === 'list' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => updateBlock(index, { listStyle: 'bullet' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        block.listStyle !== 'ordered' ? 'bg-[#7A284B] text-white' : 'bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      • బుల్లెట్ జాబితా
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock(index, { listStyle: 'ordered' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        block.listStyle === 'ordered' ? 'bg-[#7A284B] text-white' : 'bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      1. సంఖ్యల జాబితా
                    </button>
                  </div>
                  {(block.listItems || ['']).map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center gap-2">
                      <span className="text-xs text-[#6F6970] font-bold w-5 text-right">
                        {block.listStyle === 'ordered' ? `${itemIdx + 1}.` : '•'}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updatedItems = [...(block.listItems || [''])];
                          updatedItems[itemIdx] = e.target.value;
                          updateBlock(index, { listItems: updatedItems });
                        }}
                        placeholder={`అంశం ${itemIdx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] text-xs text-[#17151A] dark:text-[#F7F3EE]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedItems = (block.listItems || ['']).filter((_, idx) => idx !== itemIdx);
                          updateBlock(index, { listItems: updatedItems.length > 0 ? updatedItems : [''] });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedItems = [...(block.listItems || ['']), ''];
                      updateBlock(index, { listItems: updatedItems });
                    }}
                    className="mt-1 px-3 py-1 text-xs font-bold text-[#7A284B] dark:text-[#D87591] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>మరో అంశాన్ని చేర్చండి</span>
                  </button>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-3 flex items-center justify-center">
                  <div className="w-24 h-[1px] bg-[#7A284B]/40" />
                  <span className="px-3 text-[#7A284B] text-xs">✦ ✦ ✦</span>
                  <div className="w-24 h-[1px] bg-[#7A284B]/40" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Add Block Toolbar for easy continuation */}
      {blocks.length > 0 && (
        <div className="pt-3 flex justify-center">
          <button
            type="button"
            onClick={() => addBlock('paragraph')}
            className="px-5 py-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#202027] border border-[#E8E1DA] dark:border-[#2E2D36] hover:border-[#7A284B] text-xs font-bold text-[#7A284B] dark:text-[#D87591] shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>మరో పేరా బ్లాక్‌ను జోడించండి</span>
          </button>
        </div>
      )}
    </div>
  );
};
