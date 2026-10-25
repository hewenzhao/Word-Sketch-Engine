import { Token, POSTag, CorpusStats, ConcordanceLine, CollocationItem, KeynessItem, NGramItem } from '../types/corpus';

export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these',
  'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

const CLOSED_DETERMINERS = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'every', 'each', 'either', 'neither', 'some', 'any', 'no']);
const CLOSED_PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves', 'who', 'whom', 'whose', 'which', 'what', 'someone', 'everyone', 'anyone', 'nobody', 'nothing', 'something']);
const CLOSED_PREPOSITIONS = new Set(['in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'off', 'out', 'throughout', 'upon', 'within', 'without']);
const CLOSED_CONJUNCTIONS = new Set(['and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since', 'unless', 'while', 'whereas', 'if']);
const CLOSED_AUX_VERBS = new Set(['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would']);

const IRREGULAR_LEMMAS: Record<string, string> = {
  'am': 'be', 'is': 'be', 'are': 'be', 'was': 'be', 'were': 'be', 'been': 'be', 'being': 'be',
  'has': 'have', 'had': 'have', 'having': 'have',
  'does': 'do', 'did': 'do', 'done': 'do', 'doing': 'do',
  'went': 'go', 'gone': 'go', 'goes': 'go', 'going': 'go',
  'said': 'say', 'says': 'say', 'saying': 'say',
  'made': 'make', 'makes': 'make', 'making': 'make',
  'knew': 'know', 'known': 'know', 'knows': 'know', 'knowing': 'know',
  'thought': 'think', 'thinks': 'think', 'thinking': 'think',
  'took': 'take', 'taken': 'take', 'takes': 'take', 'taking': 'take',
  'saw': 'see', 'seen': 'see', 'sees': 'see', 'seeing': 'see',
  'came': 'come', 'comes': 'come', 'coming': 'come',
  'gave': 'give', 'given': 'give', 'gives': 'give', 'giving': 'give',
  'found': 'find', 'finds': 'find', 'finding': 'find',
  'told': 'tell', 'tells': 'tell', 'telling': 'tell',
  'became': 'become', 'becomes': 'become', 'becoming': 'become',
  'showed': 'show', 'shown': 'show', 'shows': 'show', 'showing': 'show',
  'felt': 'feel', 'feels': 'feel', 'feeling': 'feel',
  'children': 'child', 'men': 'man', 'women': 'woman', 'people': 'person', 'mice': 'mouse', 'data': 'datum', 'criteria': 'criterion'
};

export function lemmatizeWord(lowerWord: string, tag: POSTag): string {
  if (IRREGULAR_LEMMAS[lowerWord]) {
    return IRREGULAR_LEMMAS[lowerWord];
  }
  if (tag === 'NOUN') {
    if (lowerWord.endsWith('ies') && lowerWord.length > 4) {
      return lowerWord.slice(0, -3) + 'y';
    }
    if (lowerWord.endsWith('es') && (lowerWord.endsWith('shes') || lowerWord.endsWith('ches') || lowerWord.endsWith('xes') || lowerWord.endsWith('sses'))) {
      return lowerWord.slice(0, -2);
    }
    if (lowerWord.endsWith('s') && !lowerWord.endsWith('ss') && lowerWord.length > 3) {
      return lowerWord.slice(0, -1);
    }
  }
  if (tag === 'VERB') {
    if (lowerWord.endsWith('ing') && lowerWord.length > 5) {
      const base = lowerWord.slice(0, -3);
      if (base.endsWith('at') || base.endsWith('iz') || base.endsWith('lat')) return base + 'e';
      return base;
    }
    if (lowerWord.endsWith('ed') && lowerWord.length > 4) {
      return lowerWord.endsWith('ied') ? lowerWord.slice(0, -3) + 'y' : lowerWord.slice(0, -2);
    }
    if (lowerWord.endsWith('s') && !lowerWord.endsWith('ss') && lowerWord.length > 3) {
      return lowerWord.slice(0, -1);
    }
  }
  if (tag === 'ADJ' && lowerWord.endsWith('ly') && lowerWord.length > 4) {
    return lowerWord;
  }
  return lowerWord;
}

export function tagWord(word: string, lower: string, prevTag: POSTag | null): POSTag {
  if (/^[0-9]+(\.[0-9]+)?(%|th|st|nd|rd)?$/.test(word)) return 'NUM';
  if (/^[^\w\s]+$/.test(word)) return 'PUNCT';
  if (CLOSED_DETERMINERS.has(lower)) return 'DET';
  if (CLOSED_PRONOUNS.has(lower)) return 'PRON';
  if (CLOSED_PREPOSITIONS.has(lower)) return 'PREP';
  if (CLOSED_CONJUNCTIONS.has(lower)) return 'CONJ';
  if (CLOSED_AUX_VERBS.has(lower)) return 'VERB';

  if (lower.endsWith('ly') && lower.length > 3) return 'ADV';
  if (lower.endsWith('able') || lower.endsWith('ible') || lower.endsWith('al') || lower.endsWith('ful') ||
      lower.endsWith('ic') || lower.endsWith('ive') || lower.endsWith('less') || lower.endsWith('ous')) {
    return 'ADJ';
  }
  if (lower.endsWith('tion') || lower.endsWith('sion') || lower.endsWith('ment') || lower.endsWith('ness') ||
      lower.endsWith('ity') || lower.endsWith('ance') || lower.endsWith('ence') || lower.endsWith('ist') || lower.endsWith('ism')) {
    return 'NOUN';
  }
  if (lower.endsWith('ize') || lower.endsWith('ise') || lower.endsWith('ate') || lower.endsWith('ing') || lower.endsWith('ed')) {
    if (prevTag === 'DET' || prevTag === 'ADJ') {
      return lower.endsWith('ing') ? 'NOUN' : 'ADJ';
    }
    return 'VERB';
  }

  // Position-based heuristics
  if (prevTag === 'DET') return 'ADJ';
  if (prevTag === 'ADJ') return 'NOUN';
  if (prevTag === 'NOUN') return 'VERB';
  if (prevTag === 'VERB') return 'NOUN';

  return 'NOUN';
}

/**
 * Tokenizes raw text into rich tokens with character offsets, sentence indexing, and POS tags.
 */
export function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /([A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?)|([^\s\w])/gu;
  let match: RegExpExecArray | null;
  let tokenCounter = 0;
  let sentenceCounter = 0;
  let prevTag: POSTag | null = null;

  while ((match = regex.exec(text)) !== null) {
    const rawWord = match[0];
    const isPunct = !match[1];
    const lower = rawWord.toLowerCase();
    const charStart = match.index;
    const charEnd = match.index + rawWord.length;

    let tag: POSTag = 'NOUN';
    if (isPunct) {
      tag = 'PUNCT';
      if (['.', '!', '?'].includes(rawWord)) {
        sentenceCounter++;
      }
    } else {
      tag = tagWord(rawWord, lower, prevTag);
    }

    const lemma = isPunct ? rawWord : lemmatizeWord(lower, tag);

    tokens.push({
      id: tokenCounter++,
      word: rawWord,
      lower,
      lemma,
      tag,
      sentenceIndex: sentenceCounter,
      charStart,
      charEnd
    });

    if (!isPunct) {
      prevTag = tag;
    }
  }

  return tokens;
}

/**
 * Computes comprehensive statistical summary for the corpus
 */
export function computeCorpusStats(tokens: Token[]): CorpusStats {
  const wordTokens = tokens.filter(t => t.tag !== 'PUNCT');
  const totalTokens = wordTokens.length;

  if (totalTokens === 0) {
    return {
      totalTokens: 0,
      totalTypes: 0,
      ttr: 0,
      sttr: 0,
      hapaxCount: 0,
      hapaxRatio: 0,
      averageWordLength: 0,
      averageSentenceLength: 0,
      sentenceCount: 0,
      lexicalDensity: 0,
      posDistribution: {
        NOUN: 0, VERB: 0, ADJ: 0, ADV: 0, PRON: 0, DET: 0, PREP: 0, CONJ: 0, NUM: 0, PUNCT: 0, OTHER: 0
      }
    };
  }

  const freqMap = new Map<string, number>();
  let totalCharLen = 0;
  const posCounts: Record<POSTag, number> = {
    NOUN: 0, VERB: 0, ADJ: 0, ADV: 0, PRON: 0, DET: 0, PREP: 0, CONJ: 0, NUM: 0, PUNCT: 0, OTHER: 0
  };

  let maxSentenceIdx = 0;
  for (const t of tokens) {
    if (t.sentenceIndex > maxSentenceIdx) maxSentenceIdx = t.sentenceIndex;
    if (posCounts[t.tag] !== undefined) {
      posCounts[t.tag]++;
    }
  }

  for (const t of wordTokens) {
    freqMap.set(t.lower, (freqMap.get(t.lower) || 0) + 1);
    totalCharLen += t.word.length;
  }

  const totalTypes = freqMap.size;
  const ttr = totalTokens > 0 ? (totalTypes / totalTokens) : 0;

  // Standardized TTR (slice of 1,000 words average)
  const sliceSize = 1000;
  let sttrSum = 0;
  let sliceCount = 0;
  for (let i = 0; i < totalTokens; i += sliceSize) {
    const slice = wordTokens.slice(i, i + sliceSize);
    if (slice.length >= Math.min(200, sliceSize)) {
      const sliceTypes = new Set(slice.map(s => s.lower)).size;
      sttrSum += (sliceTypes / slice.length);
      sliceCount++;
    }
  }
  const sttr = sliceCount > 0 ? (sttrSum / sliceCount) : ttr;

  // Hapax Legomena (frequency = 1)
  let hapaxCount = 0;
  for (const count of freqMap.values()) {
    if (count === 1) hapaxCount++;
  }
  const hapaxRatio = totalTypes > 0 ? (hapaxCount / totalTypes) : 0;

  const averageWordLength = totalTokens > 0 ? (totalCharLen / totalTokens) : 0;
  const sentenceCount = Math.max(1, maxSentenceIdx + 1);
  const averageSentenceLength = totalTokens / sentenceCount;

  // Lexical density: content words (NOUN, VERB, ADJ, ADV) / total words
  const contentWordsCount = wordTokens.filter(t => ['NOUN', 'VERB', 'ADJ', 'ADV'].includes(t.tag)).length;
  const lexicalDensity = totalTokens > 0 ? (contentWordsCount / totalTokens) : 0;

  return {
    totalTokens,
    totalTypes,
    ttr,
    sttr,
    hapaxCount,
    hapaxRatio,
    averageWordLength,
    averageSentenceLength,
    sentenceCount,
    lexicalDensity,
    posDistribution: posCounts
  };
}

/**
 * Searches concordance lines matching target keyword, regex, or CQL pattern.
 */
export function searchConcordance(
  tokens: Token[],
  query: string,
  options: {
    isRegex?: boolean;
    caseSensitive?: boolean;
    searchByLemma?: boolean;
    contextWords?: number;
    docId?: string;
    docName?: string;
  }
): ConcordanceLine[] {
  const {
    isRegex = false,
    caseSensitive = false,
    searchByLemma = false,
    contextWords = 7,
    docId = 'doc-1',
    docName = 'Corpus'
  } = options;

  if (!query.trim()) return [];

  const results: ConcordanceLine[] = [];
  const totalTokens = tokens.length;

  let matcher: (token: Token) => boolean;

  if (isRegex) {
    try {
      const re = new RegExp(query, caseSensitive ? '' : 'i');
      matcher = (token: Token) => re.test(searchByLemma ? token.lemma : token.word);
    } catch {
      return [];
    }
  } else {
    const q = caseSensitive ? query : query.toLowerCase();
    matcher = (token: Token) => {
      const target = searchByLemma ? token.lemma : (caseSensitive ? token.word : token.lower);
      return target === q;
    };
  }

  for (let i = 0; i < totalTokens; i++) {
    const token = tokens[i];
    if (token.tag === 'PUNCT') continue;

    if (matcher(token)) {
      // Collect left context
      const leftTokens: Token[] = [];
      let p = i - 1;
      while (p >= 0 && leftTokens.length < contextWords) {
        leftTokens.unshift(tokens[p]);
        p--;
      }

      // Collect right context
      const rightTokens: Token[] = [];
      let n = i + 1;
      while (n < totalTokens && rightTokens.length < contextWords) {
        rightTokens.push(tokens[n]);
        n++;
      }

      const leftContext = leftTokens.map(t => t.word).join(' ');
      const rightContext = rightTokens.map(t => t.word).join(' ');
      const l1Word = leftTokens.length > 0 ? leftTokens[leftTokens.length - 1].word : '';
      const r1Word = rightTokens.length > 0 ? rightTokens[0].word : '';

      // Full sentence reconstruction
      const sentenceTokens = tokens.filter(t => t.sentenceIndex === token.sentenceIndex);
      const fullSentence = sentenceTokens.map(t => t.word).join(' ');

      results.push({
        id: `kwic-${i}`,
        docId,
        docName,
        leftContext,
        node: token.word,
        rightContext,
        fullSentence,
        positionRatio: totalTokens > 1 ? i / totalTokens : 0,
        tokenIndex: i,
        l1Word,
        r1Word
      });
    }
  }

  return results;
}

/**
 * Searches patterns with CQL (Corpus Query Language) syntax like:
 * [tag="ADJ"] [tag="NOUN"]
 * [word="in"] [tag="DET"] [tag="NOUN"]
 * [lemma="be"] [tag="VERB"]
 */
export function searchCQL(
  tokens: Token[],
  cqlString: string,
  options: {
    contextWords?: number;
    docId?: string;
    docName?: string;
  }
): ConcordanceLine[] {
  const { contextWords = 7, docId = 'doc-1', docName = 'Corpus' } = options;
  const tokenSpecs: Array<{
    wordRegex?: RegExp;
    lemmaRegex?: RegExp;
    tagRegex?: RegExp;
  }> = [];

  // Parse CQL blocks: [attr="val" attr2="val2"]
  const blockRegex = /\[([^\]]*)\]/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(cqlString)) !== null) {
    const inside = match[1].trim();
    if (!inside) {
      // Wildcard token []
      tokenSpecs.push({});
      continue;
    }
    const spec: { wordRegex?: RegExp; lemmaRegex?: RegExp; tagRegex?: RegExp } = {};
    const attrRegex = /(word|lemma|tag)\s*=\s*"([^"]+)"/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(inside)) !== null) {
      const attr = attrMatch[1];
      const val = attrMatch[2];
      try {
        const re = new RegExp(`^(${val})$`, 'i');
        if (attr === 'word') spec.wordRegex = re;
        if (attr === 'lemma') spec.lemmaRegex = re;
        if (attr === 'tag') spec.tagRegex = re;
      } catch {
        // ignore invalid regex
      }
    }
    tokenSpecs.push(spec);
  }

  if (tokenSpecs.length === 0) return [];

  const results: ConcordanceLine[] = [];
  const totalTokens = tokens.length;
  const patternLength = tokenSpecs.length;

  for (let i = 0; i <= totalTokens - patternLength; i++) {
    let matchesAll = true;
    for (let j = 0; j < patternLength; j++) {
      const curToken = tokens[i + j];
      const spec = tokenSpecs[j];

      if (spec.wordRegex && !spec.wordRegex.test(curToken.word)) {
        matchesAll = false;
        break;
      }
      if (spec.lemmaRegex && !spec.lemmaRegex.test(curToken.lemma)) {
        matchesAll = false;
        break;
      }
      if (spec.tagRegex && !spec.tagRegex.test(curToken.tag)) {
        matchesAll = false;
        break;
      }
    }

    if (matchesAll) {
      const matchedTokens = tokens.slice(i, i + patternLength);
      const nodeText = matchedTokens.map(t => t.word).join(' ');

      const leftTokens: Token[] = [];
      let p = i - 1;
      while (p >= 0 && leftTokens.length < contextWords) {
        leftTokens.unshift(tokens[p]);
        p--;
      }

      const rightTokens: Token[] = [];
      let n = i + patternLength;
      while (n < totalTokens && rightTokens.length < contextWords) {
        rightTokens.push(tokens[n]);
        n++;
      }

      const leftContext = leftTokens.map(t => t.word).join(' ');
      const rightContext = rightTokens.map(t => t.word).join(' ');
      const l1Word = leftTokens.length > 0 ? leftTokens[leftTokens.length - 1].word : '';
      const r1Word = rightTokens.length > 0 ? rightTokens[0].word : '';

      const fullSentenceTokens = tokens.filter(t => t.sentenceIndex === matchedTokens[0].sentenceIndex);
      const fullSentence = fullSentenceTokens.map(t => t.word).join(' ');

      results.push({
        id: `cql-${i}`,
        docId,
        docName,
        leftContext,
        node: nodeText,
        rightContext,
        fullSentence,
        positionRatio: totalTokens > 1 ? i / totalTokens : 0,
        tokenIndex: i,
        l1Word,
        r1Word
      });
    }
  }

  return results;
}

/**
 * Computes collocations and Sketch Engine Word Sketches around a node word.
 * Calculates f_xy, MI, T-Score, LogDice, Dice, and grammatical relations.
 */
export function computeCollocations(
  tokens: Token[],
  nodeWord: string,
  options: {
    leftSpan?: number; // e.g. 3
    rightSpan?: number; // e.g. 3
    minFreq?: number; // e.g. 2
    filterStopwords?: boolean;
    useLemma?: boolean;
  }
): CollocationItem[] {
  const {
    leftSpan = 3,
    rightSpan = 3,
    minFreq = 2,
    filterStopwords = true,
    useLemma = true
  } = options;

  const nodeTarget = nodeWord.toLowerCase().trim();
  if (!nodeTarget) return [];

  const wordTokens = tokens.filter(t => t.tag !== 'PUNCT');
  const totalCorpusWords = wordTokens.length;

  if (totalCorpusWords === 0) return [];

  // Count unigram frequencies
  const unigramCounts = new Map<string, { count: number; tag: POSTag; lemma: string }>();
  for (const t of wordTokens) {
    const key = useLemma ? t.lemma : t.lower;
    const existing = unigramCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      unigramCounts.set(key, { count: 1, tag: t.tag, lemma: t.lemma });
    }
  }

  const nodeStats = unigramCounts.get(nodeTarget);
  const nodeCount = nodeStats ? nodeStats.count : 0;
  if (nodeCount === 0) return [];

  // Find all node positions in wordTokens
  const nodeIndices: number[] = [];
  for (let i = 0; i < totalCorpusWords; i++) {
    const key = useLemma ? wordTokens[i].lemma : wordTokens[i].lower;
    if (key === nodeTarget) {
      nodeIndices.push(i);
    }
  }

  // Count co-occurrences within window
  interface CoocStats {
    count: number;
    leftCount: number;
    rightCount: number;
    tag: POSTag;
    lemma: string;
  }
  const coocMap = new Map<string, CoocStats>();
  const spanSize = leftSpan + rightSpan;

  for (const idx of nodeIndices) {
    const start = Math.max(0, idx - leftSpan);
    const end = Math.min(totalCorpusWords - 1, idx + rightSpan);

    for (let p = start; p <= end; p++) {
      if (p === idx) continue;
      const colToken = wordTokens[p];
      const colKey = useLemma ? colToken.lemma : colToken.lower;

      if (filterStopwords && STOPWORDS.has(colKey)) continue;

      const isLeft = p < idx;
      const stat = coocMap.get(colKey);
      if (stat) {
        stat.count++;
        if (isLeft) stat.leftCount++;
        else stat.rightCount++;
      } else {
        coocMap.set(colKey, {
          count: 1,
          leftCount: isLeft ? 1 : 0,
          rightCount: isLeft ? 0 : 1,
          tag: colToken.tag,
          lemma: colToken.lemma
        });
      }
    }
  }

  // Calculate statistics
  const results: CollocationItem[] = [];

  for (const [collocate, stats] of coocMap.entries()) {
    if (stats.count < minFreq) continue;

    const collocateTotal = unigramCounts.get(collocate)?.count || stats.count;
    const f_xy = stats.count;
    const f_x = nodeCount;
    const f_y = collocateTotal;

    // Expected frequency: (f_x * f_y * spanSize) / N
    const expected = (f_x * f_y * spanSize) / totalCorpusWords;

    // MI score: log2(f_xy / expected)
    const miScore = expected > 0 ? Math.log2(f_xy / expected) : 0;

    // T-Score: (f_xy - expected) / sqrt(f_xy)
    const tScore = f_xy > 0 ? (f_xy - expected) / Math.sqrt(f_xy) : 0;

    // Dice: 2*f_xy / (f_x + f_y)
    const dice = (2 * f_xy) / (f_x + f_y);

    // Sketch Engine LogDice: 14 + log2(2*f_xy / (f_x + f_y))
    const logDice = 14 + Math.log2(Math.max(1e-9, dice));

    // Heuristic Grammatical Relation determination (Sketch Engine style)
    let relation = 'General Collocate';
    if (stats.leftCount > stats.rightCount * 1.5) {
      if (stats.tag === 'ADJ') relation = 'Modifier (Adjective)';
      else if (stats.tag === 'NOUN') relation = 'Pre-modifier / Subject';
      else if (stats.tag === 'ADV') relation = 'Adverbial Specifier';
      else relation = 'Left Context';
    } else if (stats.rightCount > stats.leftCount * 1.5) {
      if (stats.tag === 'NOUN') relation = 'Object / Complement';
      else if (stats.tag === 'PREP') relation = 'Prepositional Link';
      else if (stats.tag === 'VERB') relation = 'Governing Action';
      else relation = 'Right Context';
    } else {
      if (stats.tag === 'CONJ') relation = 'Coordinated Pair';
      else relation = 'Bilateral Collocate';
    }

    results.push({
      word: collocate,
      lemma: stats.lemma,
      tag: stats.tag,
      cooccurrenceCount: f_xy,
      nodeCount: f_x,
      collocateCount: f_y,
      expected: Number(expected.toFixed(2)),
      miScore: Number(miScore.toFixed(3)),
      tScore: Number(tScore.toFixed(3)),
      logDice: Number(logDice.toFixed(3)),
      dice: Number(dice.toFixed(4)),
      leftCount: stats.leftCount,
      rightCount: stats.rightCount,
      relation
    });
  }

  // Default sort by LogDice descending
  return results.sort((a, b) => b.logDice - a.logDice);
}

/**
 * Computes Keyness analysis (Keywords) comparing Study Corpus vs Reference Corpus
 * using Log-Likelihood (G^2 statistic) and %DIFF.
 */
export function computeKeyness(
  studyTokens: Token[],
  referenceTokens: Token[],
  options: {
    minFreq?: number;
    filterStopwords?: boolean;
    useLemma?: boolean;
  }
): KeynessItem[] {
  const { minFreq = 3, filterStopwords = false, useLemma = false } = options;

  const studyWords = studyTokens.filter(t => t.tag !== 'PUNCT');
  const refWords = referenceTokens.filter(t => t.tag !== 'PUNCT');

  const N1 = studyWords.length;
  const N2 = refWords.length;

  if (N1 === 0 || N2 === 0) return [];

  const studyCounts = new Map<string, { count: number; tag: POSTag; lemma: string }>();
  for (const t of studyWords) {
    const key = useLemma ? t.lemma : t.lower;
    if (filterStopwords && STOPWORDS.has(key)) continue;
    const existing = studyCounts.get(key);
    if (existing) existing.count++;
    else studyCounts.set(key, { count: 1, tag: t.tag, lemma: t.lemma });
  }

  const refCounts = new Map<string, number>();
  for (const t of refWords) {
    const key = useLemma ? t.lemma : t.lower;
    if (filterStopwords && STOPWORDS.has(key)) continue;
    refCounts.set(key, (refCounts.get(key) || 0) + 1);
  }

  const results: KeynessItem[] = [];

  for (const [word, data] of studyCounts.entries()) {
    const a = data.count;
    if (a < minFreq) continue;

    const b = refCounts.get(word) || 0;

    // Expected frequencies
    const E1 = (N1 * (a + b)) / (N1 + N2);
    const E2 = (N2 * (a + b)) / (N1 + N2);

    // G^2 calculation: 2 * (a * ln(a/E1) + b * ln(b/E2))
    const term1 = a > 0 && E1 > 0 ? a * Math.log(a / E1) : 0;
    const term2 = b > 0 && E2 > 0 ? b * Math.log(b / E2) : 0;
    const logLikelihood = 2 * (term1 + term2);

    // Relative frequencies per 10,000 words
    const studyRelFreq = (a / N1) * 10000;
    const refRelFreq = (b / N2) * 10000;

    // %DIFF = (studyRelFreq - refRelFreq) / refRelFreq * 100
    const percentDiff = refRelFreq > 0 ? ((studyRelFreq - refRelFreq) / refRelFreq) * 100 : 999;
    const isOverused = studyRelFreq >= refRelFreq;

    results.push({
      word,
      lemma: data.lemma,
      tag: data.tag,
      studyFreq: a,
      studyRelFreq: Number(studyRelFreq.toFixed(2)),
      refFreq: b,
      refRelFreq: Number(refRelFreq.toFixed(2)),
      logLikelihood: Number(logLikelihood.toFixed(2)),
      percentDiff: Number(percentDiff.toFixed(1)),
      isOverused
    });
  }

  return results.sort((a, b) => b.logLikelihood - a.logLikelihood);
}

/**
 * Computes N-grams (1-gram to 4-gram) with relative frequency
 */
export function computeNGrams(
  tokens: Token[],
  n: number,
  options: {
    minCount?: number;
    filterStopwords?: boolean;
    useLemma?: boolean;
  }
): NGramItem[] {
  const { minCount = 2, filterStopwords = false, useLemma = false } = options;
  const wordTokens = tokens.filter(t => t.tag !== 'PUNCT');
  const total = wordTokens.length;

  if (total < n) return [];

  const ngramMap = new Map<string, { count: number; tokens: string[]; tags: POSTag[] }>();

  for (let i = 0; i <= total - n; i++) {
    const slice = wordTokens.slice(i, i + n);
    const words = slice.map(t => useLemma ? t.lemma : t.lower);

    if (filterStopwords && words.every(w => STOPWORDS.has(w))) {
      continue;
    }

    const key = words.join(' ');
    const existing = ngramMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      ngramMap.set(key, {
        count: 1,
        tokens: words,
        tags: slice.map(t => t.tag)
      });
    }
  }

  const items: NGramItem[] = [];
  const denominator = Math.max(1, total - n + 1);

  for (const [ngram, stat] of ngramMap.entries()) {
    if (stat.count >= minCount) {
      items.push({
        ngram,
        tokens: stat.tokens,
        count: stat.count,
        relativeFreq: Number(((stat.count / denominator) * 10000).toFixed(2)),
        tags: stat.tags
      });
    }
  }

  return items.sort((a, b) => b.count - a.count);
}
