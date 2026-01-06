import { useState, useEffect } from 'react';
import nlp from 'compromise';
import { sleep } from '../utils/timer';
import TaskSection from './TaskSection';

function ParagraphSize() {
  const [allParagraphs, setAllParagraphs] = useState({});
  const [violatingParagraphIds, setViolatingParagraphIds] = useState([]);

  const getParagraphCache = (text) => {
    const doc = nlp(text);

    return {
      lead : text.slice(0, 20),
      sentenceCount : doc.sentences().length,
      wordCount : doc.wordCount,
    };
  };

  const paragraphChanged = async (event) => {
    console.log('paragraphChanged called');

    await Word.run(async (context) => {
      for (const id of event.uniqueLocalIds) {
        const paragraph = context.document.getParagraphByUniqueLocalId(id);
        if (paragraph.isNullObject) {
          continue;
        }

        paragraph.load("text");
        await context.sync();

        const paragraphCache = getParagraphCache(paragraph.text);
        setAllParagraphs((prev) => ({ ...prev, id: paragraphCache }));
        if (isViolatingParagraph(paragraphCache)) {
          setViolatingParagraphIds((prev) => [...new Set([...prev, id])]);
        } else {
          const index = violatingParagraphIds.indexOf(id);
          if (index >= 0) {
            setViolatingParagraphIds((prev) => prev.toSpliced(index, 1));
          }
        }
      }
    });
  };

  const paragraphAdded = async (event) => {
    console.log('paragraphAdded called');

    await paragraphChanged(event);
  };

  const paragraphDeleted = async (event) => {
    console.log('paragraphDeleted called');

    for (const id of event.uniqueLocalIds) {
      setAllParagraphs(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
      const index = violatingParagraphIds.indexOf(id);
      if (index >= 0) {
        setViolatingParagraphIds((prev) => prev.toSpliced(index, 1));
      }
    }
  };

  const isViolatingParagraph = (paragraphCache) => {
    return paragraphCache.sentenceCount > 12;
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    let isMounted = true;

    const processInitialParagraphs = async () => {
      await Word.run(async (context) => {
        let initialParagraphs = {};
        let initialViolatingParagraphIds = [];

        // const paragraphs = context.document.body.paragraphs;
        const paragraphs = context.document.paragraphs;
        paragraphs.load("items");
        if (isMounted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          paragraph.load("text, uniqueLocalId");
        }
        if (isMounted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          const paragraphCache = initialParagraphs[paragraph.uniqueLocalId] = getParagraphCache(paragraph.text);

          if (isViolatingParagraph(paragraphCache)) {
            console.log(`Found long paragraph with ${paragraphCache.sentenceCount} sentences.`);
            initialViolatingParagraphIds.push(paragraph.uniqueLocalId);
          }

          // if (sentenceCount > 12) {
          //   if (isMounted) {
          //     console.log(`Found long paragraph with ${sentenceCount} sentences.`);
          //   }
          //   initialParagraphs[paragraph.uniqueLocalId] = {
          //     // paragraph,
          //     sentenceCount,
          //   };
          //   paragraph.font.highlightColor = "Yellow";
          // }

          context.trackedObjects.remove(paragraph);
          await sleep(10);
        };

        if (isMounted){
          setAllParagraphs(initialParagraphs);
          setViolatingParagraphIds(initialViolatingParagraphIds);

          context.document.onParagraphChanged.add(paragraphChanged);
          context.document.onParagraphAdded.add(paragraphAdded);
          context.document.onParagraphDeleted.add(paragraphDeleted);

          await context.sync();
        }
      });
    };

    processInitialParagraphs()
      .catch(console.error);

    return () => isMounted = false;
  }, []);

  return (
    <TaskSection title="Paragraph Size">
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
  );
}

export default ParagraphSize
