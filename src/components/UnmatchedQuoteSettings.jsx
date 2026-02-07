import { Settings } from 'lucide-react';
import { useApp } from '../AppProvider';

export const UnmatchedQuoteSettings = () => {
  const { quoteExceptions, updateQuoteExceptions } = useApp();

  return (
    <div className="p-3 space-y-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
        <Settings size={16} />
        <span className="text-sm">Exceptions</span>
      </div>

    </div>
  );
};
