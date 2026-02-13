import { useState, useMemo } from 'react';
import { Disclosure, DisclosurePanel } from '@headlessui/react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { UnmatchedQuoteSettings } from './UnmatchedQuoteSettings';
import { scrollToParagraph } from '../utils/scrollTo'
import { ResultHeader } from './ResultHeader';

export const UnmatchedQuote = () => {
  const { allParagraphs, quoteExceptions } = useApp();

  const [showSingle, setShowSingle] = useState(true);
  const [showDouble, setShowDouble] = useState(true);

  const unmatchedQuotes = (text) => {
    // Normalize curly single quotes to straight ones for easier matching
    let normalized = text.replace(/[‘’]/g, "'");

    // Prepare the text by removing all global exceptions
    // Escape special characters to prevent regex errors (e.g., the quote itself)
    const escapedExceptions = quoteExceptions.map(ex => 
      ex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    // Create a regex to match any of these words globally
    const exceptionRegex = new RegExp(`(^|[^a-zA-Z0-9'])(${escapedExceptions.join('|')})([^a-zA-Z0-9]|$)`, 'gi');

    // This 'cleanText' won't contain the troublesome quotes
    const cleanText = normalized.replace(exceptionRegex, "$1$3");

    // Double Quotes: Count both straight (") and curly (“ ”)
    const doubleQuoteCount = (cleanText.match(/"|“|”/g) || []).length;

    // Single Quotes: Use regex to ignore contractions
    // This regex looks for ' or ‘ or ’ ONLY when they are NOT 
    // surrounded by letters on both sides (disregarding "don't").
    const singleQuotePattern = /(^|[^a-zA-Z])['‘]|['’]([^a-zA-Z]|$)/g;
    const singleQuoteMatches = cleanText.match(singleQuotePattern) || [];
    const singleQuoteCount = singleQuoteMatches.length;

    return { singleQuoteCount, doubleQuoteCount };
  };

  const paragraphsWithUnmatchedQuote = useMemo(() => {
    return Object.entries(allParagraphs)
      .map(([id, paragraphCache]) => [id, { ...paragraphCache, ...unmatchedQuotes(paragraphCache.text) }])
      .filter(([, paragraph]) => paragraph.singleQuoteCount % 2 || paragraph.doubleQuoteCount % 2);
  }, [allParagraphs, quoteExceptions]);

  const filteredParagraphsWithUnmatchedQuote = paragraphsWithUnmatchedQuote.filter(([, para]) =>
    (showSingle && para.singleQuoteCount % 2 === 1) || (showDouble && para.doubleQuoteCount % 2 === 1));

  return (
    <TaskSection title="Unmatched Quotes">
      <UnmatchedQuoteSettings
        showSingle={showSingle}
        setShowSingle={setShowSingle}
        showDouble={showDouble}
        setShowDouble={setShowDouble}
      />

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <ResultHeader open={open} text={"Unmatched Quotes"} count={filteredParagraphsWithUnmatchedQuote.length} />

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredParagraphsWithUnmatchedQuote.map(([id, para]) => (
                  <div 
                    key={id} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToParagraph(id)}
                  >
                    <p className={clsx(
                      "truncate text-xs text-slate-600 italic mb-2 line-clamp-1",
                      "group-hover:text-slate-900 transition-colors")}
                    >
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
