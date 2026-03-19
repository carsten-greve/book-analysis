import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { Settings, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../AppProvider';

export const StyleCheckerSettings = () => {
  const [selectedStyle, setSelectedStyle] = useState("");
  const { allStyles, styleOrder, setStyleOrder } = useApp();

  const toggleAllowedStyle = (styleToToggle) => {
    const currentAllowed = styleOrder[selectedStyle] || allStyles;
    const newAllowed = currentAllowed.includes(styleToToggle)
      ? currentAllowed.filter(s => s !== styleToToggle)
      : [...currentAllowed, styleToToggle];

    setStyleOrder({ ...styleOrder, [selectedStyle]: newAllowed });
  };

  return (
    <div className="p-3 space-y-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
        <Settings size={16} />
        <span className="text-sm">Style Orders</span>
      </div>

      <div className="">
        <header className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Style Sequence Rules</h1>
          <p className="text-slate-500">Define which paragraph styles are allowed to follow each other.</p>
        </header>

        <div className={clsx(
          "grid grid-cols-2 gap-2 rounded-lg bg-slate-200 p-2 mb-2",
          "text-center text-xs font-semibold uppercase tracking-wider text-slate-800"
        )}>
          <div>
            1. Select Style
          </div>

          <div>
            2. Allowed to Follow "{selectedStyle}"
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Left Column: Source Style (Radio) */}
          <section>
            <RadioGroup value={selectedStyle} onChange={setSelectedStyle} className="space-y-2">
              {allStyles.map((style) => (
                <RadioGroup.Option
                  key={style}
                  value={style}
                  className={({ checked }) => `
                    flex items-center justify-between text-xs p-2 cursor-pointer rounded-lg border transition-all
                    ${checked ? 'bg-white border-blue-600 shadow-md' : 'bg-slate-100 border-transparent hover:bg-slate-200'}
                  `}
                >
                  {({ checked }) => (
                    <>
                      <span className={`font-medium ${checked ? 'text-blue-600' : 'text-slate-700'}`}>{style}</span>
                      {checked ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </section>

          {/* Right Column: Allowed Followers (Checkboxes) */}
          <section>
            <div className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm space-y-1">
              {allStyles.map((style) => {
                const isChecked = (styleOrder[selectedStyle] || allStyles).includes(style);
                return (
                  <div
                    key={style}
                    onClick={() => toggleAllowedStyle(style)}
                    className="flex items-center p-3 rounded-md hover:bg-slate-50 cursor-pointer group"
                  >
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                      ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}
                    `}>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`flex-1 text-xs ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                      {style}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3">
          <div className="p-1 bg-blue-600 rounded text-white mt-1">
            <ChevronRight size={16} />
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            When a user writes in <strong>{selectedStyle}</strong>, the next paragraph can only be one of the checked styles above.
          </p>
        </div>
      </div>
    </div>
  );
};
