import { createContext, useState, useContext, useTransition, useEffect } from 'react';
import { getParagraphCache } from './utils/paragraphCache';
import { sleep } from './utils/timer';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [allParagraphs, setAllParagraphs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [sentenceThreshold, setSentenceThreshold] = useState(10);
  const [wordThreshold, setWordThreshold] = useState(150);
  const [sentenceWordThreshold, setSentenceWordThreshold] = useState(30);
  const [sentenceCharacterThreshold, setSentenceCharacterThreshold] = useState(150);
  const [quoteExceptions, setQuoteExceptions] = useState([]);
  const [commonMisspellings, setCommonMisspellings] = useState([
    { words: ["bare", "bear"], isActive: true },
    { words: ["its", "it's"], isActive: true },
    { words: ["brought", "bought"], isActive: true },
    { words: ["accept", "except"], isActive: true },
    { words: ["affect", "effect"], isActive: true },
    { words: ["forward", "forwards"], isActive: true },
  ]);

  const isProcessing = isLoading || isPending;

  useEffect(() => {
    Office.context.document.settings.refreshAsync(() => {
      const savedSentenceThreshold = Office.context.document.settings.get("sentenceThreshold");
      const savedWordThreshold = Office.context.document.settings.get("wordThreshold");
      const savedSentenceWordThreshold = Office.context.document.settings.get("sentenceWordThreshold");
      const savedSentenceCharacterThreshold = Office.context.document.settings.get("sentenceCharacterThreshold");
      const savedQuoteExceptions = Office.context.document.settings.get("quoteExceptions");
      const savedCommonMisspellings = Office.context.document.settings.get("commonMisspellings");

      setSentenceThreshold(prev => savedSentenceThreshold ?? prev);
      setWordThreshold(prev => savedWordThreshold ?? prev);
      setSentenceWordThreshold(prev => savedSentenceWordThreshold ?? prev);
      setSentenceCharacterThreshold(prev => savedSentenceCharacterThreshold ?? prev);
      setQuoteExceptions(prev => savedQuoteExceptions ?? prev);
      setCommonMisspellings(prev => savedCommonMisspellings ?? prev);
    });
  }, []);

  const updateSentenceThreshold = value => updateSetting("sentenceThreshold", value, setSentenceThreshold);
  const updateWordThreshold = value => updateSetting("wordThreshold", value, setWordThreshold);
  const updateSentenceWordThreshold = value => updateSetting("sentenceWordThreshold", value, setSentenceWordThreshold);
  const updateSentenceCharacterThreshold = value => updateSetting("sentenceCharacterThreshold", value, setSentenceCharacterThreshold);
  const updateQuoteExceptions = value => updateSetting("quoteExceptions", value, setQuoteExceptions);
  const updateCommonMisspellings = value => updateSetting("commonMisspellings", value, setCommonMisspellings);

  const updateSetting = (name, value, setState) => {
    startTransition(() => {
      setState(value);

      Office.context.document.settings.set(name, value);
      Office.context.document.settings.saveAsync();
    });
  }

  const handleParagraphChange = async (event) => {
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
  };

  const handleParagraphAdd = async (event) => {
    await handleParagraphChange(event);
  };

  const handleParagraphDelete = async (event) => {
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

    const initializeAddIn = async () => {
      setIsLoading(true);

      await Word.run(async (context) => {
        if (signal.aborted) return;

        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("text, uniqueLocalId");
        await context.sync();

        if (!signal.aborted) {
          let initialParagraphs = {};
          for (const paragraph of paragraphs.items) {
            initialParagraphs[paragraph.uniqueLocalId] = getParagraphCache(paragraph.text);

            context.trackedObjects.remove(paragraph);
            await sleep(1);
          };
          setAllParagraphs(initialParagraphs);

          context.document.onParagraphChanged.add((args) => { startTransition(() => handleParagraphChange(args)); });
          context.document.onParagraphAdded.add((args) => { startTransition(() => handleParagraphAdd(args)); });
          context.document.onParagraphDeleted.add((args) => { startTransition(() => handleParagraphDelete(args)); });
        }
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      });
    };

    initializeAddIn()
      .catch(console.error);

    return () => controller.abort();
  }, []);

  return (
    <AppContext.Provider value={{
      allParagraphs,
      isProcessing,
      sentenceThreshold,
      updateSentenceThreshold,
      wordThreshold,
      updateWordThreshold,
      sentenceWordThreshold,
      updateSentenceWordThreshold,
      sentenceCharacterThreshold,
      updateSentenceCharacterThreshold,
      quoteExceptions,
      updateQuoteExceptions,
      commonMisspellings,
      updateCommonMisspellings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
