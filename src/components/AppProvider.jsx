import { createContext, useState, useContext, useTransition, useEffect } from 'react';
import nlp from 'compromise';
import { sleep } from '../utils/timer';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [allParagraphs, setAllParagraphs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [sentenceThreshold, setSentenceThreshold] = useState(10);
  const [wordThreshold, setWordThreshold] = useState(150);
  const [sentenceWordThreshold, setSentenceWordThreshold] = useState(30);
  const [sentenceCharacterThreshold, setSentenceCharacterThreshold] = useState(150);

  const isProcessing = isLoading || isPending;

  useEffect(() => {
    Office.context.document.settings.refreshAsync(() => {
      const savedSentences = Office.context.document.settings.get("sentenceThreshold");
      const savedWords = Office.context.document.settings.get("wordThreshold");

      setSentenceThreshold(prev => savedSentences ?? prev);
      setWordThreshold(prev => savedWords ?? prev);
    });
  }, []);

  const updateSentenceThreshold = value => updateSetting("sentenceThreshold", value, setSentenceThreshold);
  const updateWordThreshold = value => updateSetting("wordThreshold", value, setWordThreshold);
  const updateSentenceWordThreshold = value => updateSetting("sentenceWordThreshold", value, setSentenceWordThreshold);
  const updateSentenceCharacterThreshold = value => updateSetting("sentenceCharacterThreshold", value, setSentenceCharacterThreshold);

  const updateSetting = (name, value, setState) => {
    startTransition(() => {
      setState(value);

      Office.context.document.settings.set(name, value);
      Office.context.document.settings.saveAsync();
    });
  }

  const getParagraphCache = (text) => {
    const doc = nlp(text.replace(/["“”'‘]+/g, '').replace(/(?<![a-zA-Z])’/g, '')); // compromise.nlp gets confused by quotes. Cannot work out sentences.
    const sentences = doc.sentences();

    return {
      text,
      sentenceCount : sentences.length,
      wordCount : doc.wordCount(),
      sentences : [...sentences.json().map(s => ({
        text : s.text,
        sentenceWordCount : nlp(s.text).wordCount(),
        sentenceCharacterCount : s.text.length,
      }))],
    };
  };

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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
