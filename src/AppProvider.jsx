import { createContext, useState, useContext, useTransition, useEffect, useRef, useMemo } from 'react';
import { getParagraphCache } from './utils/paragraphCache';
import { ParagraphMap } from './utils/ParagraphMap';
import { sleep } from './utils/timer';
import { debounce } from './utils/debounce';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const paraMap = useRef(new ParagraphMap());
  const [allParagraphs, setAllParagraphs] = useState({});
  const [allStyles, setAllStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [sentenceThreshold, setSentenceThreshold] = useState(10);
  const [wordThreshold, setWordThreshold] = useState(150);
  const [sentenceWordThreshold, setSentenceWordThreshold] = useState(30);
  const [sentenceCharacterThreshold, setSentenceCharacterThreshold] = useState(150);
  const [quoteExceptions, setQuoteExceptions] = useState([]);
  const [commonMisspellings, setCommonMisspellings] = useState([
    { words: ["bare", "bear"], isActive: false },
    { words: ["its", "it's"], isActive: false },
    { words: ["brought", "bought"], isActive: false },
    { words: ["accept", "except"], isActive: false },
    { words: ["affect", "effect"], isActive: false },
    { words: ["forward", "forwards"], isActive: false },
    { words: ["roll", "role"], isActive: false },
    { words: ["whose", "who's"], isActive: false },
  ]);
  const [styleOrder, setStyleOrder] = useState({});
  const styleOrderRef = useRef(styleOrder);
  const [styleErrors, setStyleErrors] = useState([]);

  useEffect(() => {
    styleOrderRef.current = styleOrder;
  }, [styleOrder]);

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

  const adjacentStyleCheck = (currentStyle, nextStyle) => {
    const allowedNextStyles = styleOrderRef.current[currentStyle];
    return allowedNextStyles && !allowedNextStyles.includes(nextStyle)
      ? `Style "${nextStyle}" cannot follow style "${currentStyle}".` : null;
  }

  const debouncedStyleCheck = useMemo(() =>
    debounce(() => {
      const styleErrors = [];
      let currentNode = paraMap.current.head;
      while (true) {
        const nextNode = currentNode?.next;
        if (!nextNode) break;

        const errorText = adjacentStyleCheck(currentNode.style, nextNode.style);
        if (errorText) {
          styleErrors.push({
            id: nextNode.id,
            errorText,
          });
        }

        currentNode = nextNode;
      }

      setStyleErrors(styleErrors);
    }, 250),
  []);

  useEffect(() => {
    debouncedStyleCheck();
  }, [styleOrder]);

  const addToParagraphMap = async (uniqueLocalIds) => {
    await Word.run(async (context) => {
      if (uniqueLocalIds.length === 1) {
        const newPara = context.document.getParagraphByUniqueLocalId(uniqueLocalIds[0]);
        const prevPara = newPara.getPreviousOrNullObject();
        newPara.load("style");
        prevPara.load("uniqueLocalId");

        await context.sync();

        const anchorId = prevPara.isNullObject ? null : prevPara.uniqueLocalId;
        paraMap.current.upsert(uniqueLocalIds[0], newPara.style, anchorId);

        if (!allStyles.includes(newPara.style)) {
          setAllStyles([...allStyles, newPara.style]);
        }
      }
      else if (uniqueLocalIds.length > 1) {
        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("uniqueLocalId, style");

        await context.sync();

        paraMap.current.nodes.clear();
        paraMap.current.head = null;
        paraMap.current.tail = null;

        let previousId = null;
        const usedStyles = new Set();
        for (let i = 0; i < paragraphs.items.length; i++) {
          const p = paragraphs.items[i];
          paraMap.current.upsert(p.uniqueLocalId, p.style, previousId);
          previousId = p.uniqueLocalId;
          usedStyles.add(paragraph.style);
        }
        setAllStyles([...usedStyles]);
      }
    }).catch((error) => {
      console.error(error)
    });
  }

  const updateParagraphMap = async (uniqueLocalIds) => {
    await Word.run(async (context) => {
      for (const id of uniqueLocalIds) {
        const paragraph = context.document.getParagraphByUniqueLocalId(id);
        paragraph.load("style");

        await context.sync();

        if (paragraph.isNullObject) {
          continue;
        }

        paraMap.current.upsert(id, paragraph.style);

        if (!allStyles.includes(paragraph.style)) {
          setAllStyles([...allStyles, paragraph.style]);
        }
      }
    }).catch((error) => {
      console.error(error)
    });
  };

  const updateParagraphCache = async (uniqueLocalIds) => {
    await Word.run(async (context) => {
      for (const id of uniqueLocalIds) {
        const paragraph = context.document.getParagraphByUniqueLocalId(id);
        paragraph.load("text, style");
        await context.sync();

        if (paragraph.isNullObject) {
          continue;
        }

        const paragraphCache = getParagraphCache(paragraph);
        setAllParagraphs((prev) => ({ ...prev, [id]: paragraphCache }));
      }
    }).catch((error) => {
      console.error(error)
    });
  };

  const handleParagraphChange = async (event) => {
    await updateParagraphCache(event.uniqueLocalIds);
    await updateParagraphMap(event.uniqueLocalIds);

    debouncedStyleCheck();
  };

  const handleParagraphAdd = async (event) => {
    await updateParagraphCache(event.uniqueLocalIds);
    await addToParagraphMap(event.uniqueLocalIds);

    debouncedStyleCheck();
  };

  const handleParagraphDelete = async (event) => {
    for (const id of event.uniqueLocalIds) {
      setAllParagraphs(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });

      paraMap.current.delete(id);
    }

    debouncedStyleCheck();
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const initializeAddIn = async () => {
      setIsLoading(true);

      await Word.run(async (context) => {
        if (signal.aborted) return;

        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("text, uniqueLocalId, style");

        await context.sync();

        paraMap.current.nodes.clear();
        paraMap.current.head = null;
        paraMap.current.tail = null;

        let previousId = null;

        if (!signal.aborted) {
          let initialParagraphs = {};
          const usedStyles = new Set();
          for (const paragraph of paragraphs.items) {
            initialParagraphs[paragraph.uniqueLocalId] = getParagraphCache(paragraph);
            usedStyles.add(paragraph.style);

            paraMap.current.upsert(paragraph.uniqueLocalId, paragraph.style, previousId);
            previousId = paragraph.uniqueLocalId;

            context.trackedObjects.remove(paragraph);
            await sleep(1);
          };
          setAllParagraphs(initialParagraphs);

          context.document.onParagraphChanged.add((args) => { startTransition(() => handleParagraphChange(args)); });
          context.document.onParagraphAdded.add((args) => { startTransition(() => handleParagraphAdd(args)); });
          context.document.onParagraphDeleted.add((args) => { startTransition(() => handleParagraphDelete(args)); });

          setAllStyles([...usedStyles]);
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
      allStyles,
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
      styleOrder,
      setStyleOrder,
      styleErrors,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
