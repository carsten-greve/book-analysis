import { useMemo } from 'react';
import { Disclosure, DisclosurePanel } from '@headlessui/react';
import clsx from 'clsx';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { CommonMisspellingSettings } from './CommonMisspellingSettings';
import { scrollToTextInParagraph } from '../utils/scrollTo'
import { ResultHeader } from './ResultHeader';

export const CommonMisspelling = () => {
  const { allParagraphs, commonMisspellings } = useApp();

  const uniqueWords = [...new Set(commonMisspellings.filter(cm => cm.isActive).map(cm => cm.words).flat())];

  const getFoundWords = (text) => uniqueWords.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(text);
  });

  const paragraphsWithCommonMisspelling = useMemo(() => {
    return Object.entries(allParagraphs)
      .map(([id, paragraphCache]) => [
        id,
        paragraphCache,
        getFoundWords(paragraphCache.text.replace(/[‘’]/g, "'").toLowerCase())
      ])
      .filter(([,,foundWords]) => foundWords.length > 0);
  }, [allParagraphs, commonMisspellings]);

  return (
    <TaskSection title="Common Misspellings">
      <CommonMisspellingSettings />

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <ResultHeader open={open} text={"Paragraphs"} count={paragraphsWithCommonMisspelling.length} />

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {paragraphsWithCommonMisspelling.map(([id, para, foundWords]) => (
                  <div 
                    key={id} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group flex flex-row gap-2"
                    onClick={() => scrollToTextInParagraph(id, foundWords[0])}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={clsx(
                        "text-xs text-slate-600 italic mb-2 line-clamp-1",
                        "group-hover:text-slate-900 transition-colors")}
                      >
                        "{para.text}"
                      </p>

                      <div className="flex items-center gap-4 text-[11px] font-medium">
                        <div className={"flex items-center gap-1 text-slate-500"}>
                          <span>{`Words: ${foundWords.join(", ")}`}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {e.stopPropagation()}}
                      className={clsx(
                        "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold",
                        "rounded-md transition-colors shadow-sm"
                      )}
                    >
                      Ignore
                    </button>
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
