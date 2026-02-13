import { ParagraphSize } from './ParagraphSize';
import { SentenceSize } from './SentenceSize';
import { UnmatchedQuote } from './UnmatchedQuote';

export const TaskPane = () => {
  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <ParagraphSize />

        <SentenceSize />

        <UnmatchedQuote />
      </div>
    </div>
  );
}
