import { useMemo } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronUp, FileText, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { UnmatchedQuoteSettings } from './UnmatchedQuoteSettings';
import { scrollToParagraph } from '../utils/scrollTo'

export const UnmatchedQuote = () => {
  const { allParagraphs, isProcessing, quoteExceptions } = useApp();

  const unmatchedQuotes = (text) => {
    // Double Quotes: Count both straight (") and curly (“ ”)
    const doubleQuoteCount = (text.match(/"|“|”/g) || []).length;

    // Single Quotes: Use regex to ignore contractions
    // This regex looks for ' or ‘ or ’ ONLY when they are NOT 
    // surrounded by letters on both sides (disregarding "don't").
    const singleQuotePattern = /(^|[^a-zA-Z])['‘]|['’]([^a-zA-Z]|$)/g;
    const singleQuoteMatches = text.match(singleQuotePattern) || [];
    const singleQuoteCount = singleQuoteMatches.length;

    return { singleQuoteCount, doubleQuoteCount };
  };

  const paragraphsWithUnmatchedQuote = useMemo(() => {
    return Object.entries(allParagraphs)
      .map(([id, paragraphCache]) => [id, { ...paragraphCache, ...unmatchedQuotes(paragraphCache.text) }])
      .filter(([, paragraph]) => paragraph.singleQuoteCount || paragraph.doubleQuoteCount);
  }, [allParagraphs, quoteExceptions]);

  return (
    <TaskSection title="Unmatched Quotes">
      <UnmatchedQuoteSettings />

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100  transition-colors border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Unmatched Quotes</span>
                  {isProcessing ? (
                    <Loader2 size={14} className="ml-3 animate-spin text-slate-400" />
                  ) : (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                      {paragraphsWithUnmatchedQuote.length}
                    </span>
                  )}
                </div>
                <ChevronUp
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                />
              </DisclosureButton>

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {paragraphsWithUnmatchedQuote.map(([id, para]) => (
                  <div 
                    key={id} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToParagraph(id)}
                  >
                    <p className="truncate text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      "{para.text}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-medium">
                      <div className={"flex items-center gap-1 " + (para.singleQuoteCount % 2 ? "text-red-500" : "text-slate-500")}>
                        {para.singleQuoteCount % 2 === 1 && <ThumbsDown size={12} className="text-slate-400" />}
                        {para.singleQuoteCount % 2 === 0 && <ThumbsUp size={12} className="text-slate-400" />}
                        <span>{`${para.singleQuoteCount} single quote${para.singleQuoteCount === 1 ? '' : 's'}`}</span>
                      </div>
                      <div className={"flex items-center gap-1 border-l border-slate-200 pl-4 " + (para.doubleQuoteCount % 2 ? "text-red-500" : "text-slate-500")}>
                        {para.doubleQuoteCount % 2 === 1 && <ThumbsDown size={12} className="text-slate-400" />}
                        {para.doubleQuoteCount % 2 === 0 && <ThumbsUp size={12} className="text-slate-400" />}
                        <span>{`${para.doubleQuoteCount} double quote${para.doubleQuoteCount === 1 ? '' : 's'}`}</span>
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
