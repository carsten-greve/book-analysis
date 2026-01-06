import { useState, useEffect } from 'react';
import nlp from 'compromise';
import { sleep } from '../utils/timer';
import TaskSection from './TaskSection';

function ParagraphSize() {
  const [longParagraphs, setLongParagraphs] = useState({});

  false && useEffect(() => {
    let isMounted = true;

    const initLongParagraphs = async () => {
      await Word.run(async (context) => {
        let longParagraphs = {};

        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("text, uniqueLocalId, items, font");
        if (isMounted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          const doc = nlp(paragraph.text);
          const sentences = doc.sentences();
          const sentenceCount = sentences.length;

          if (sentenceCount > 12) {
            if (isMounted) {
              console.log(`Found long paragraph with ${sentenceCount} sentences.`);
            }
            longParagraphs[paragraph.uniqueLocalId] = {
              // paragraph,
              sentenceCount,
            };
            paragraph.font.highlightColor = "Yellow";
          }

          context.trackedObjects.remove(paragraph);
          await sleep(10);
        };

        if (isMounted){
          setLongParagraphs(longParagraphs);
          await context.sync();
        }
      });
    };

    initLongParagraphs()
      .catch(console.error);;

    return () => isMounted = false;
  }, []);

  false && useEffect(() => {
    let isMounted = true;

    const initLongParagraphs = async () => {
      await Word.run(async (context) => {
        let longParagraphs = {};

        let paragraph = context.document.body.paragraphs.getFirstOrNullObject();
        paragraph.load("text, uniqueLocalId, font");
        await context.sync();

        while (!paragraph.isNullObject) {
          const doc = nlp(paragraph.text);
          const sentences = doc.sentences();
          const sentenceCount = sentences.length;
        
          if (sentenceCount > 12) {
            if (isMounted) {
              console.log(`Found long paragraph with ${sentenceCount} sentences.`);
            }
            longParagraphs[paragraph.uniqueLocalId] = {
              // paragraph,
              sentenceCount,
            };
            paragraph.font.highlightColor = "Yellow";
          }

          const next = paragraph.getNextOrNullObject();
          next.load("text, uniqueLocalId, font");
          await context.sync();

          // Crucial: release the previous one now that we have the next
          context.trackedObjects.remove(paragraph);

          paragraph = next;
        }

        // Final cleanup (often optional if add-in ends soon)
        await context.sync();
  
        if (isMounted){
          setLongParagraphs(longParagraphs);
          await context.sync();
        }
      });
    };

    initLongParagraphs()
      .catch(console.error);;

    return () => isMounted = false;
  }, []);

  false && useEffect(() => {
    let isMounted = true;

    const initLongParagraphs = async () => {
      let longParagraphs = {};
      let isFirst = true;
      let nextUniqueLocalId = null;
      while (isFirst || nextUniqueLocalId) {
        await Word.run(async (context) => {
          let paragraph = null;
          if (isFirst) {
            isFirst = false;
            paragraph = context.document.body.paragraphs.getFirstOrNullObject();
          } else {
            paragraph = context.document.getParagraphByUniqueLocalId(nextUniqueLocalId);
          }
          paragraph.load("text, uniqueLocalId, font");
          await context.sync();

          let batchSize = 100;
          while (!paragraph.isNullObject && batchSize-- > 0) {
            const doc = nlp(paragraph.text);
            const sentences = doc.sentences();
            const sentenceCount = sentences.length;
          
            if (sentenceCount > 12) {
              if (isMounted) {
                console.log(`Found long paragraph with ${sentenceCount} sentences.`);
              }
              longParagraphs[paragraph.uniqueLocalId] = {
                // paragraph,
                sentenceCount,
              };
              paragraph.font.highlightColor = "Yellow";
            }
  
            const nextParagraph = paragraph.getNextOrNullObject();
            nextParagraph.load("text, uniqueLocalId, font");
            await context.sync();
  
            context.trackedObjects.remove(paragraph);
  
            paragraph = nextParagraph;
          }

          nextUniqueLocalId = paragraph.isNullObject ? null : paragraph.uniqueLocalId;
        });

        await sleep(200);
      }

      if (isMounted){
        setLongParagraphs(longParagraphs);
        // await context.sync();
      }
    };

    initLongParagraphs()
      .catch(console.error);;

    return () => isMounted = false;
  }, []);

  false && useEffect(() => {
    let isMounted = true;

    const initLongParagraphs = async () => {
      await Word.run(async (context) => {
          const paragraphs = context.document.body.paragraphs.load("items");
          await context.sync();

          for (let i = 0; i < paragraphs.items.length; i++) {
            const paragraph = paragraphs.items[i];
            paragraph.load('text, uniqueLocalId, font');
          }
          await context.sync();

          for (let i = 0; i < paragraphs.items.length; i++) {
            const paragraph = paragraphs.items[i];
            const doc = nlp(paragraph.text);
            const sentences = doc.sentences();
            const sentenceCount = sentences.length;

            if (sentenceCount > 12) {
              console.log(`Found long paragraph with ${sentenceCount} sentences.`);
              paragraph.font.highlightColor = "Yellow";
            }

            // console.log(`${paragraph.uniqueLocalId}: ${paragraph.text.slice(0, 20)}`);
          }
          await context.sync();
      });
    };

    initLongParagraphs()
      .catch(console.error);;

    return () => isMounted = false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initLongParagraphs = async () => {
      await Word.run(async (context) => {
        let longParagraphs = {};

        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("items");
        if (isMounted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          // Do NOT load the entire font!
          paragraph.load("text, uniqueLocalId", "font/highlightColor");
        }
        if (isMounted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          const doc = nlp(paragraph.text);
          const sentences = doc.sentences();
          const sentenceCount = sentences.length;

          if (sentenceCount > 12) {
            if (isMounted) {
              console.log(`Found long paragraph with ${sentenceCount} sentences.`);
            }
            longParagraphs[paragraph.uniqueLocalId] = {
              // paragraph,
              sentenceCount,
            };
            paragraph.font.highlightColor = "Yellow";
          }

          context.trackedObjects.remove(paragraph);
          await sleep(10);
        };

        if (isMounted){
          setLongParagraphs(longParagraphs);
          await context.sync();
        }
      });
    };

    initLongParagraphs()
      .catch(console.error);;

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
