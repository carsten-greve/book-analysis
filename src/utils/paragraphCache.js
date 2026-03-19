import nlp from 'compromise';

// List of patterns that strongly imply a question
const interrogativeStructurePatterns = [
  '^#QuestionWord',                                     // Why, How, etc.
  '^(is|are|am|was|were) #Noun',                        // Are you...
  '^(do|does|did) #Noun',                               // Do you...
  '^(can|could|should|would|will) #Noun #Verb',         // Should we...
  '. (isnt|arent|dont|doesnt|cant|shouldnt) #Pronoun$', // ...isn't it?
  '. (is|are|do|does|can|should) #Pronoun$',            // ...do you?
  '. (will|wont) you$',                                 // ...will you?
  '. shall we$',                                        // ...shall we?
  '. #Copula #Negation #Pronoun$', // matches "is not it", "aren't they"
  '. #Modal #Negation #Pronoun$',  // matches "can't you", "won't we"
  '. (will|shall) (you|we)$',      // matches "will you", "shall we"
  '^(is|are|am|was|were|do|does|did|can|could|should|would|will) #Noun',
  '. (right|correct)$',
];

const hasInterrogativeStructure = s => {
  // 1. Check if it matches any question pattern
  const isQuestionStructure = interrogativeStructurePatterns.some(p => s.has(p));

  // 2. Check if it's missing a question mark at the end
  const lastTerm = s.terms().last();
  const hasQuestionMark = lastTerm.has('@hasQuestionMark');

  return isQuestionStructure && !hasQuestionMark
}

export const getParagraphCache = (paragraph) => {
  const text = paragraph.text;

  // compromise.nlp gets confused by quotes. Cannot work out sentences.
  const doc = nlp(text.replace(/["“”'‘]+/g, '').replace(/(?<![a-zA-Z])’/g, ''));
  const sentences = doc.sentences();
  const questions = doc.questions().ifNo('?').filter(q => !q.out('text').trim().endsWith('?'));

  return {
    text,
    sentenceCount : sentences.length,
    wordCount : doc.wordCount(),
    sentences : [...sentences.json().map(s => ({
      text : s.text,
      sentenceWordCount : nlp(s.text).wordCount(),
      sentenceCharacterCount : s.text.length,
    }))],
    interrogativeStructures : [...new Set(
      [...sentences.filter(hasInterrogativeStructure).json().map(s => s.text)].concat([...questions.json().map(q => q.text)])
    )].map(t => ({ text : t })),
    hasWrongEnding: /( |(?<![.?!…])"|[^.?!…"])$/.test(text.replace(/[“”]+/g, '"')),
    style: paragraph.style,
  };
};
