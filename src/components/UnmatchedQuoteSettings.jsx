import { useState } from "react";
import { Settings, X } from 'lucide-react';
import { useApp } from '../AppProvider';

export const UnmatchedQuoteSettings = () => {
  const [inputValue, setInputValue] = useState("");

  const { quoteExceptions, updateQuoteExceptions } = useApp();

  const addException = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    // Normalize curly to straight and prevent duplicates
    const normalized = trimmed.replace(/[‘’]/g, "'");
    if (normalized && !quoteExceptions.includes(normalized)) {
      const newList = [...quoteExceptions, normalized];
      updateQuoteExceptions(newList);
      setInputValue("");
    }
  };

  const removeException = (indexToRemove) => {
    const newList = quoteExceptions.filter((_, index) => index !== indexToRemove);
    updateQuoteExceptions(newList);
  };

  return (
    <div className="p-3 space-y-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
        <Settings size={16} />
        <span className="text-sm">Exceptions</span>
      </div>

      {/* Input Field Area */}
      <form onSubmit={addException} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. ladies'"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm"
        >
          Add
        </button>
      </form>

      {/* Exceptions List */}
      <div className="max-h-40 overflow-y-auto space-y-1">
        {quoteExceptions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No exceptions added yet.</p>
        ) : (
          quoteExceptions.map((word, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm"
            >
              <span className="text-sm font-mono text-slate-600">{word}</span>
              <button
                onClick={() => removeException(index)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Remove"
              >
                <X size={24} />
              </button>
            </div>
          ))
        )}
      </div>
      <p className="mt-3 text-[10px] text-slate-500 leading-tight">
        *Words in this list are ignored during quote analysis, even if they use smart quotes (’).
      </p>
    </div>
  );
};
