import { useState, useEffect, useTransition } from 'react';
import nlp from 'compromise';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, FileText, Hash, AlignLeft, Loader2 } from 'lucide-react';
import { sleep } from '../utils/timer';
import TaskSection from './TaskSection';
import ParagraphSizeSettings from './ParagraphSizeSettings';

function ParagraphSize() {
  const [allParagraphs, setAllParagraphs] = useState({});
  const [violatingParagraphIds, setViolatingParagraphIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sentenceThreshold, setSentenceThreshold] = useState(10);
  const [wordThreshold, setWordThreshold] = useState(150);

  const isProcessing = isLoading || isPending;

  const getParagraphCache = (text) => {
    const doc = nlp(text);

    return {
      lead : text.slice(0, 20),
      sentenceCount : doc.sentences().length,
      wordCount : doc.wordCount(),
    };
  };

  const paragraphChanged = async (event) => {
    console.log('paragraphChanged called');

    startTransition(async () => {
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
    return paragraphCache.sentenceCount > sentenceThreshold || paragraphCache.wordCount > wordThreshold;
  };

  const handleSettingsUpdate = (newThresholds) => {
    setSentenceThreshold(newThresholds.sentences);
    setWordThreshold(newThresholds.words);
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const processInitialParagraphs = async () => {
      setIsLoading(true);
      console.log('setIsLoading(true);');

      await Word.run(async (context) => {
        let initialParagraphs = {};
        let initialViolatingParagraphIds = [];

        // const paragraphs = context.document.body.paragraphs;
        const paragraphs = context.document.paragraphs;
        paragraphs.load("items");
        if (!signal.aborted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          paragraph.load("text, uniqueLocalId");
        }
        if (!signal.aborted){
          await context.sync();
        }

        for (const paragraph of paragraphs.items) {
          const paragraphCache = initialParagraphs[paragraph.uniqueLocalId] = getParagraphCache(paragraph.text);

          if (isViolatingParagraph(paragraphCache)) {
            console.log(`Found long paragraph with ${paragraphCache.sentenceCount} sentences.`);
            initialViolatingParagraphIds.push(paragraph.uniqueLocalId);
          }

          // if (sentenceCount > 12) {
          //   if (!signal.aborted) {
          //     console.log(`Found long paragraph with ${sentenceCount} sentences.`);
          //   }
          //   initialParagraphs[paragraph.uniqueLocalId] = {
          //     // paragraph,
          //     sentenceCount,
          //   };
          //   paragraph.font.highlightColor = "Yellow";
          // }

          context.trackedObjects.remove(paragraph);
          await sleep(1);
        };

        if (!signal.aborted){
          setAllParagraphs(initialParagraphs);
          setViolatingParagraphIds(initialViolatingParagraphIds);

          console.log('onParagraph...');
          context.document.onParagraphChanged.add(paragraphChanged);
          context.document.onParagraphAdded.add(paragraphAdded);
          context.document.onParagraphDeleted.add(paragraphDeleted);

          await context.sync();
        }
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        if (!signal.aborted) {
          setIsLoading(false);
          console.log('setIsLoading(false);');
        }
      });
    };

    processInitialParagraphs()
      .catch(console.error);

    return () => controller.abort();
  }, []);

  return (
    <TaskSection title="Paragraph Size">
      <ParagraphSizeSettings
        defaults={{ sentences: sentenceThreshold, words: wordThreshold }}
        onSettingsChange={handleSettingsUpdate}
      >
      </ParagraphSizeSettings>
      <p className="mb-3 text-xs text-slate-500">
        For readability, identify paragraphs exceeding {sentenceThreshold} sentences or {wordThreshold} words.
      </p>
      <button 
        className="w-full rounded bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        onClick={() => {/* Call your Word API logic here */}}
      >
        Check Paragraphs
      </button>

      <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100  transition-colors border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Long Paragraphs</span>
                  {isProcessing ? (
                    <Loader2 size={14} className="ml-3 animate-spin text-slate-400" />
                  ) : (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                      {Object.keys(violatingParagraphIds).length}
                    </span>
                  )}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                />
              </DisclosureButton>

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {violatingParagraphIds.map(id => ([id, allParagraphs[id]])).map(([index, para]) => (
                  <div 
                    key={index} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => /* logic to scroll Word to this paragraph */ {}}
                  >
                    {/* Lead Text */}
                    <p className="text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      "{para.lead}..."
                    </p>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 text-[11px] font-medium">
                      <div className="flex items-center gap-1 text-slate-500">
                        <AlignLeft size={12} className="text-slate-400" />
                        <span>{para.sentenceCount} sentences</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 border-l border-slate-200 pl-4">
                        <Hash size={12} className="text-slate-400" />
                        <span>{para.wordCount} words</span>
                      </div>
                    </div>
                  </div>
                ))}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
    </TaskSection>
  );
}

export default ParagraphSize
