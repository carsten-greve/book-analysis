import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, FileText, Hash, AlignLeft } from 'lucide-react';

function ParagraphSizeItems({ paragraphs }) {
  return (
    <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Long Paragraphs</span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                  {Object.keys(paragraphs).length}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
              />
            </DisclosureButton>

            <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {Object.entries(paragraphs).map(([index, para]) => (
                <div 
                  key={index} 
                  className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  onClick={() => /* logic to scroll Word to this paragraph */ {}}
                >
                  {/* Lead Text */}
                  <p className="text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                    "{para.lead}..."
                  </p>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-[11px] font-medium">
                    <div className="flex items-center gap-1 text-slate-500">
                      <AlignLeft size={12} className="text-slate-400" />
                      <span>{para.sentenceCount} sentences</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 border-l border-slate-200 pl-4">
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
  );
}

export default ParagraphSizeItems
