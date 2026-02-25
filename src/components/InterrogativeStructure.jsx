import { useMemo } from 'react';
import { Disclosure, DisclosurePanel } from '@headlessui/react';
import clsx from 'clsx';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { scrollToTextInParagraph } from '../utils/scrollTo';
import { ResultHeader } from './ResultHeader';

export const InterrogativeStructure = () => {
  const { allParagraphs } = useApp();

  const questionSentences = useMemo(() => {
    return Object.entries(allParagraphs)
      .flatMap(([id, paragraphCache]) => paragraphCache.interrogativeStructures.map((cache, i) => [id, i, cache]));
  }, [allParagraphs]);

  return (
    <TaskSection title="Interrogative Structures">
      <p className="pl-3 pb-2 text-xs italic text-slate-500 bg-slate-100/50">
        (Does not mean they all need question marks!)
      </p>

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <ResultHeader open={open} text={"Missing Question Marks?"} count={questionSentences.length} />

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {questionSentences.map(([id, i, sentenceCache]) => (
                  <div 
                    key={id+i} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToTextInParagraph(id, sentenceCache.text)}
                  >
                    <p className={clsx(
                      "truncate text-xs text-slate-600 italic mb-2 line-clamp-1",
                      "group-hover:text-slate-900 transition-colors"
                      )}
                    >
                      "{sentenceCache.text}"
                    </p>
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
