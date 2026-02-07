import nlp from 'compromise';

export const getParagraphCache = (text) => {
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
