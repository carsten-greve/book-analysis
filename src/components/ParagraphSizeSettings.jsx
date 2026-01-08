import { Settings, Hash, AlignLeft } from 'lucide-react';
import { useApp } from './AppProvider';

const ParagraphSizeSettings = () => {
  const { sentenceThreshold, updateSentenceThreshold, wordThreshold, updateWordThreshold } = useApp();

  return (
    <div className="p-3 space-y-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
        <Settings size={16} />
        <span className="text-sm">Thresholds</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500 flex items-center gap-1">
            <AlignLeft size={12} /> Sentences
          </label>
          <input 
            type="number"
            min="5"
            value={sentenceThreshold}
            onChange={(e) => updateSentenceThreshold(e.target.value)}
            className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-500 flex items-center gap-1">
            <Hash size={12} /> Word Count
          </label>
          <input 
            type="number"
            min="100"
            value={wordThreshold}
            onChange={(e) => updateWordThreshold(e.target.value)}
            className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ParagraphSizeSettings
