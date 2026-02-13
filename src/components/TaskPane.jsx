import { ParagraphSize } from './ParagraphSize';
import { SentenceSize } from './SentenceSize';
import { UnmatchedQuote } from './UnmatchedQuote';
import { CommonMisspelling } from './CommonMisspelling';

export const TaskPane = () => {
  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <ParagraphSize />

        <SentenceSize />

        <UnmatchedQuote />

        <CommonMisspelling />
      </div>
    </div>
  );
}
