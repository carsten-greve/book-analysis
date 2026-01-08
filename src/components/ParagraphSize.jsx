import { useState, useEffect, useTransition, useMemo } from 'react';
import nlp from 'compromise';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, ChevronUp, ArrowUpDown, FileText, Hash, AlignLeft, Loader2 } from 'lucide-react';
import { sleep } from '../utils/timer';
import TaskSection from './TaskSection';
import ParagraphSizeSettings from './ParagraphSizeSettings';

function ParagraphSize() {
  const [allParagraphs, setAllParagraphs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sentenceThreshold, setSentenceThreshold] = useState(10);
  const [wordThreshold, setWordThreshold] = useState(150);
  const [sortConfig, setSortConfig] = useState({ key: 'sentenceCount', direction: 'desc' });

  const isProcessing = isLoading || isPending;

  const isLongParagraph = (paragraphCache) => {
    return paragraphCache.sentenceCount > sentenceThreshold || paragraphCache.wordCount > wordThreshold;
  };

  const longParagraphs = useMemo(() => {
    return Object.entries(allParagraphs)
      .filter(([, paragraph]) => isLongParagraph(paragraph))
      .sort((a, b) => {
        const aVal = a[1][sortConfig.key];
        const bVal = b[1][sortConfig.key];
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [allParagraphs, sentenceThreshold, wordThreshold, sortConfig]);

  const handleSettingsUpdate = (newThresholds) => {
    startTransition(() => {
      setSentenceThreshold(newThresholds.sentences);
      setWordThreshold(newThresholds.words);
    });
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getParagraphCache = (text) => {
    const doc = nlp(text);

    return {
      text,
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
          paragraph.load("text");
          await context.sync();

          if (paragraph.isNullObject) {
            continue;
          }

          const paragraphCache = getParagraphCache(paragraph.text);
          setAllParagraphs((prev) => ({ ...prev, [id]: paragraphCache }));
        }
      }).catch((error) => {
        console.error(error)
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
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const processInitialParagraphs = async () => {
      setIsLoading(true);
      console.log('setIsLoading(true);');

      await Word.run(async (context) => {
        let initialParagraphs = {};

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
      <p className="pl-3 pb-2 text-xs text-slate-500 bg-slate-100/50">
        Paragraphs exceeding {sentenceThreshold} sentences or {wordThreshold} words.
      </p>
      <div className="flex items-center justify-between px-4 mb-2 py-2 bg-slate-100/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        <span>Sort by:</span>
        <div className="flex gap-2">
          {/* Sort by Sentences */}
          <button 
            onClick={() => requestSort('sentenceCount')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              sortConfig.key === 'sentenceCount' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'
            }`}
          >
            <AlignLeft size={12} />
            <span>Sentences</span>
            {sortConfig.key === 'sentenceCount' ? (
              sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
            ) : <ArrowUpDown size={12} className="opacity-30" />}
          </button>

          {/* Sort by Words */}
          <button 
            onClick={() => requestSort('wordCount')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              sortConfig.key === 'wordCount' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'
            }`}
          >
            <Hash size={12} />
            <span>Words</span>
            {sortConfig.key === 'wordCount' ? (
              sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
            ) : <ArrowUpDown size={12} className="opacity-30" />}
          </button>
        </div>
      </div>

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
                      {longParagraphs.length}
                    </span>
                  )}
                </div>
                <ChevronUp
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                />
              </DisclosureButton>

              <DisclosurePanel className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {longParagraphs.map(([index, para]) => (
                  <div 
                    key={index} 
                    className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => /* logic to scroll Word to this paragraph */ {}}
                  >
                    <p className="truncate text-xs text-slate-600 italic mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                      "{para.text}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-medium">
                      <div className={"flex items-center gap-1 " + (para.sentenceCount > sentenceThreshold ? "text-red-500" : "text-slate-500")}>
                        <AlignLeft size={12} className="text-slate-400" />
                        <span>{para.sentenceCount} sentences</span>
                      </div>
                      <div className={"flex items-center gap-1 border-l border-slate-200 pl-4 " + (para.wordCount > wordThreshold ? "text-red-500" : "text-slate-500")}>
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
