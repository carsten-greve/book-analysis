import { useState } from "react";
import { Settings, X } from 'lucide-react';
import clsx from "clsx";
import { useApp } from '../AppProvider';

export const CommonMisspellingSettings = () => {
  const [word1, setWord1] = useState("");
  const [word2, setWord2] = useState("");

  const { commonMisspellings, updateCommonMisspellings } = useApp();

  const addWordPair = (e) => {
    e.preventDefault();
    const word1TrimmedNormalized = word1.trim().replace(/[‘’]/g, "'");
    const word2TrimmedNormalized = word2.trim().replace(/[‘’]/g, "'");
    if (word1TrimmedNormalized && word2TrimmedNormalized) {
      const newList = [...commonMisspellings, [word1TrimmedNormalized, word2TrimmedNormalized]];
      updateCommonMisspellings(newList);
      setWord1("");
      setWord2("");
    }
  };

  const removeWordPair = (indexToRemove) => {
    const newList = commonMisspellings.filter((_, index) => index !== indexToRemove);
    updateCommonMisspellings(newList);
  };

  return (
    <div className="p-3 space-y-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
        <Settings size={16} />
        <span className="text-sm">Word Pairs</span>
      </div>

      <form onSubmit={addWordPair} className="flex gap-2 mb-4">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value)}
            placeholder="e.g. bare"
            className={clsx(
              "flex-1 w-5 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value)}
            placeholder="e.g. bear"
            className={clsx(
              "flex-1 w-5 px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
        </div>
        <button
          type="submit"
          className={clsx(
            "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold",
            "rounded-md transition-colors shadow-sm"
          )}
        >
          Add
        </button>
      </form>

      <div className="max-h-40 overflow-y-auto space-y-1">
        {commonMisspellings.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No common misspellings added yet.</p>
        ) : (
          commonMisspellings.map((wordPair, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center bg-white px-3 py-1.5 border border-slate-200 rounded-md shadow-sm"
            >
              <span className="text-sm font-mono text-slate-600">{`${wordPair[0]} / ${wordPair[1]}`}</span>
              <button
                onClick={() => removeWordPair(index)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Remove"
              >
                <X size={24} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
