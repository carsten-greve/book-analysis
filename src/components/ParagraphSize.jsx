import { useState, useMemo } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, ChevronUp, ArrowUpDown, FileText, Hash, AlignLeft, Loader2 } from 'lucide-react';
import { useApp } from './AppProvider';
import TaskSection from './TaskSection';
import ParagraphSizeSettings from './ParagraphSizeSettings';

function ParagraphSize() {
  const [sortConfig, setSortConfig] = useState({ key: 'sentenceCount', direction: 'desc' });

  const { allParagraphs, isProcessing, sentenceThreshold, wordThreshold } = useApp();

  const isLongParagraph = (paragraphCache) => {
    return paragraphCache.sentenceCount > sentenceThreshold || paragraphCache.wordCount > wordThreshold;
  };

  const longParagraphs = useMemo(() => {
    return Object.entries(allParagraphs)
      .filter(([, paragraph]) => isLongParagraph(paragraph))
      .sort((a, b) => {
        const aVal = a[1][sortConfig.key];
        const bVal = b[1][sortConfig.key];
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [allParagraphs, sentenceThreshold, wordThreshold, sortConfig]);

  async function scrollToParagraph(targetId) {
    await Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load("uniqueLocalId");
      await context.sync();

      const targetParagraph = paragraphs.items.find((paragraph) => paragraph.uniqueLocalId === targetId);
      if (targetParagraph) {
        targetParagraph.select(Word.SelectionMode.select);
      } else {
        console.warn("Paragraph with ID not found in this session.");
      }

      await context.sync();
    });
  }

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <TaskSection title="Paragraph Size">
      <ParagraphSizeSettings>
      </ParagraphSizeSettings>

      <p className="pl-3 pb-2 text-xs text-slate-500 bg-slate-100/50">
        Paragraphs exceeding {sentenceThreshold} sentences or {wordThreshold} words.
      </p>

      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        <span>Sort by:</span>
        <div className="flex gap-2">
          {['sentenceCount', 'wordCount'].map((key) => {
            const isActive = sortConfig.key === key;
            const isAsc = sortConfig.direction === 'asc';
            const label = key === 'sentenceCount' ? 'Sentences' : 'Words';
            const Icon = key === 'sentenceCount' ? AlignLeft : Hash;

            return (
              <button 
                key={key}
                onClick={() => requestSort(key)}
                className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 ring-1 ${
                  isActive 
                    ? 'bg-blue-600 text-white ring-blue-600 shadow-sm' 
                    : 'bg-white text-slate-600 ring-slate-200 hover:ring-blue-400 hover:text-blue-600'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-blue-100' : 'text-slate-400'} />
                <span>{label}</span>
                
                <div className="relative flex items-center justify-center w-3 h-3">
                  {isActive ? (
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ease-in-out ${isAsc ? 'rotate-180' : 'rotate-0'} group-hover:scale-175`} 
                    />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40 group-hover:opacity-100" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100  transition-colors border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Long Paragraphs</span>
                  {isProcessing ? (
                    <Loader2 size={14} className="ml-3 animate-spin text-slate-400" />
                  ) : (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                      {longParagraphs.length}
                    </span>
                  )}
                </div>
                <ChevronUp
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                />
              </DisclosureButton>

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {longParagraphs.map(([id, para]) => (
                  <div 
                    key={id} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToParagraph(id)}
                  >
                    <p className="truncate text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      "{para.text}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-medium">
                      <div className={"flex items-center gap-1 " + (para.sentenceCount > sentenceThreshold ? "text-red-500" : "text-slate-500")}>
                        <AlignLeft size={12} className="text-slate-400" />
                        <span>{para.sentenceCount} sentences</span>
                      </div>
                      <div className={"flex items-center gap-1 border-l border-slate-200 pl-4 " + (para.wordCount > wordThreshold ? "text-red-500" : "text-slate-500")}>
                        <Hash size={12} className="text-slate-400" />
                        <span>{para.wordCount} words</span>
                      </div>
                    </div>
                  </div>
                ))}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
    </TaskSection>
  );
}

export default ParagraphSize
