import { Disclosure, DisclosurePanel } from '@headlessui/react';
import { Bug } from 'lucide-react';
import { useApp } from '../AppProvider';
import { TaskSection } from './TaskSection';
import { StyleCheckerSettings } from './StyleCheckerSettings';
import { scrollToParagraph } from '../utils/scrollTo';
import { ResultHeader } from './ResultHeader';

export const StyleChecker = () => {
  const { allParagraphs, styleErrors } = useApp();

  return (
    <TaskSection title="Style Rules">
      <StyleCheckerSettings />

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <ResultHeader open={open} text={"Style Errors"} count={styleErrors.length} />

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {styleErrors.map(({id, errorText}) => (
                  <div 
                    key={id} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => scrollToParagraph(id)}
                  >
                    <p className="truncate text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      "{allParagraphs[id].text}"
                    </p>

                    <div className="flex items-center gap-1">
                      <Bug size={12} className="text-slate-400" />
                      <p className="truncate line-clamp-1 text-[9px] font-medium text-red-500">{errorText}</p>
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
