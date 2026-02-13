import { useState, useMemo } from 'react';
import { Disclosure, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, ArrowUpDown, Hash, AlignLeft } from 'lucide-react';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { SentenceSizeSettings } from './SentenceSizeSettings';
import { scrollToTextInParagraph } from '../utils/scrollTo';
import { ResultHeader } from './ResultHeader';

export const SentenceSize = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'sentenceWordCount', direction: 'desc' });

  const { allParagraphs, sentenceWordThreshold, sentenceCharacterThreshold } = useApp();

  const isLongSentence = (sentenceCache) => {
    return sentenceCache.sentenceWordCount > sentenceWordThreshold || sentenceCache.sentenceCharacterCount > sentenceCharacterThreshold;
  };

  const longSentences = useMemo(() => {
    return Object.entries(allParagraphs)
      .flatMap(([id, paragraphCache]) => paragraphCache.sentences.map((sentenceCache, i) => [id, i, sentenceCache]))
      .filter(([,, sentenceCache]) => isLongSentence(sentenceCache))
      .sort((a, b) => {
        const aVal = a[2][sortConfig.key];
        const bVal = b[2][sortConfig.key];
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [allParagraphs, sentenceWordThreshold, sentenceCharacterThreshold, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <TaskSection title="Long Sentences">
      <SentenceSizeSettings />

      <p className="pl-3 pb-2 text-xs text-slate-500 bg-slate-100/50">
        Sentences exceeding {sentenceWordThreshold} words or {sentenceCharacterThreshold} characters.
      </p>

      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        <span>Sort by:</span>
        <div className="flex gap-2">
          {['sentenceWordCount', 'sentenceCharacterCount'].map((key) => {
            const isActive = sortConfig.key === key;
            const isAsc = sortConfig.direction === 'asc';
            const label = key === 'sentenceWordCount' ? 'Words' : 'Characters';
            const Icon = key === 'sentenceWordCount' ? AlignLeft : Hash;

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
              <ResultHeader open={open} text={"Long Sentences"} count={longSentences.length} />

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {longSentences.map(([id, i, sentenceCache]) => (
                  <div 
                    key={id+i} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToTextInParagraph(id, sentenceCache.text)}
                  >
                    <p className="truncate text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      "{sentenceCache.text}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-medium">
                      <div className={"flex items-center gap-1 " + (sentenceCache.sentenceWordCount > sentenceWordThreshold ? "text-red-500" : "text-slate-500")}>
                        <AlignLeft size={12} className="text-slate-400" />
                        <span>{sentenceCache.sentenceWordCount} words</span>
                      </div>
                      <div className={"flex items-center gap-1 border-l border-slate-200 pl-4 " + (sentenceCache.sentenceCharacterCount > sentenceCharacterThreshold ? "text-red-500" : "text-slate-500")}>
                        <Hash size={12} className="text-slate-400" />
                        <span>{sentenceCache.sentenceCharacterCount} characters</span>
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
