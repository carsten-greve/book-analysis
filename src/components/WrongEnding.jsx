import { useMemo } from 'react';
import { Disclosure, DisclosurePanel } from '@headlessui/react';
import clsx from 'clsx';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { scrollToParagraph } from '../utils/scrollTo';
import { ResultHeader } from './ResultHeader';

export const WrongEnding = () => {
  const { allParagraphs } = useApp();

  const wrongEndings = useMemo(() => {
    return Object.entries(allParagraphs)
      .filter(([, paragraphCache]) => paragraphCache.text.length > 1 && paragraphCache.hasWrongEnding);
  }, [allParagraphs]);

  const truncateStart = str => str.length <= 40 ? str : '...' + str.slice(-40);

  return (
    <TaskSection title="Paragraph Wrong Endings">
      <p className="pl-3 pb-2 text-xs italic text-slate-500 bg-slate-100/50">
        (or at least unusual endings...)
      </p>

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <ResultHeader open={open} text={"Wrong Endings"} count={wrongEndings.length} />

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {wrongEndings.map(([id, paragraphCache], i) => (
                  <div 
                    key={id+i} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToParagraph(id)}
                  >
                    <p className={clsx(
                      "truncate text-xs text-slate-600 italic mb-2 line-clamp-1",
                      "group-hover:text-slate-900 transition-colors"
                      )}
                    >
                      {truncateStart(paragraphCache.text)}
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
