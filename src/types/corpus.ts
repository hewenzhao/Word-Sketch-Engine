export type POSTag = 
  | 'NOUN' 
  | 'VERB' 
  | 'ADJ' 
  | 'ADV' 
  | 'PRON' 
  | 'DET' 
  | 'PREP' 
  | 'CONJ' 
  | 'NUM' 
  | 'PUNCT' 
  | 'OTHER';

export interface Token {
  id: number;
  word: string;
  lower: string;
  lemma: string;
  tag: POSTag;
  sentenceIndex: number;
  charStart: number;
  charEnd: number;
}

export interface CorpusDocument {
  id: string;
  name: string;
  sizeBytes: number;
  rawText: string;
  tokens: Token[];
  wordCount: number;
  sentenceCount: number;
  typeCount: number;
  uploadedAt: string;
}

export interface CorpusStats {
  totalTokens: number;
  totalTypes: number;
  ttr: number; // Type-Token Ratio
  sttr: number; // Standardized TTR (per 1,000 words)
  hapaxCount: number;
  hapaxRatio: number;
  averageWordLength: number;
  averageSentenceLength: number;
  sentenceCount: number;
  lexicalDensity: number; // Content words / total words
  posDistribution: Record<POSTag, number>;
}

export interface ConcordanceLine {
  id: string;
  docId: string;
  docName: string;
  leftContext: string;
  node: string;
  rightContext: string;
  fullSentence: string;
  positionRatio: number; // 0 to 1 for dispersion plot
  tokenIndex: number;
  l1Word: string;
  r1Word: string;
}

export interface CollocationItem {
  word: string;
  lemma: string;
  tag: POSTag;
  cooccurrenceCount: number; // f_xy
  nodeCount: number; // f_x
  collocateCount: number; // f_y
  expected: number;
  miScore: number;
  tScore: number;
  logDice: number;
  dice: number;
  leftCount: number;
  rightCount: number;
  relation?: string;
}

export interface KeynessItem {
  word: string;
  lemma: string;
  tag: POSTag;
  studyFreq: number;
  studyRelFreq: number; // per 10k
  refFreq: number;
  refRelFreq: number; // per 10k
  logLikelihood: number; // G^2
  percentDiff: number;
  isOverused: boolean; // Overused in study corpus
}

export interface NGramItem {
  ngram: string;
  tokens: string[];
  count: number;
  relativeFreq: number; // per 10k
  tags: POSTag[];
}

export interface PatternQueryPreset {
  name: string;
  description: string;
  query: string;
  type: 'regex' | 'cql';
}
