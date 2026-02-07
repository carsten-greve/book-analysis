import { TaskSection } from './TaskSection';
import { ParagraphSize } from './ParagraphSize';
import { SentenceSize } from './SentenceSize';
import { UnmatchedQuote } from './UnmatchedQuote';

export const TaskPane = () => {
  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Scrollable Area for Tasks */}
      <div className="flex-1 overflow-y-auto">
        <ParagraphSize />

        <SentenceSize />

        <UnmatchedQuote />

        <TaskSection title="Paragraph Length Checker">
          <p className="mb-3 text-xs text-slate-500">
            Identify paragraphs with more than 10 sentences for readability.
          </p>
          <button 
            className="w-full rounded bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => {/* Call your Word API logic here */}}
          >
            Check Paragraphs
          </button>
        </TaskSection>

        <TaskSection title="Style & Consistency">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Detect Oxford Comma usage</span>
            </label>
            <label className="flex items-center space-x-2 text-xs">
              <input type="checkbox" className="rounded text-blue-600" />
              <span>Check for double spaces</span>
            </label>
          </div>
        </TaskSection>
      </div>
    </div>
  );
}
