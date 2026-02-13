import clsx from "clsx";
import { DisclosureButton } from "@headlessui/react";
import { ChevronUp, FileText, Loader2 } from "lucide-react";
import { useApp } from "../AppProvider";

export const ResultHeader = ({ open, text, count }) => {
  const { isProcessing } = useApp();

  return (
    <DisclosureButton
      className={clsx(
        "flex w-full items-center justify-between px-4 py-3 bg-slate-50",
        "hover:bg-slate-100  transition-colors border-b border-slate-200"
      )}
    >
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">{text}</span>
        {isProcessing ? (
          <Loader2 size={14} className="ml-3 animate-spin text-slate-400" />
        ) : (
          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
            {count}
          </span>
        )}
      </div>
      <ChevronUp
        size={16} 
        className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
      />
    </DisclosureButton>
  );
}
