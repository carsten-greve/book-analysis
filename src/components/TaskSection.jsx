import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronRight } from 'lucide-react';

function TaskSection({ title, children }) {
  return (
      <Disclosure as="div" className="w-full border-b border-slate-200">
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ChevronRight className={`${open ? 'rotate-90' : ''} h-5 w-5 text-slate-500 transition-transform duration-200`}/>
              {title}
            </DisclosureButton>
            <DisclosurePanel className="px-4 pb-4 pt-2 text-sm text-slate-600">
              {children}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
  );
}

export default TaskSection
