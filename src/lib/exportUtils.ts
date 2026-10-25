import * as XLSX from 'xlsx';
import { ConcordanceLine, CollocationItem, NGramItem, KeynessItem, CorpusStats } from '../types/corpus';

/**
 * Downloads data as a CSV file with UTF-8 BOM encoding for Excel compatibility
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads data as a native Excel (.xlsx) workbook using SheetJS
 */
export function exportToXLSX(filename: string, sheetName: string, headers: string[], rows: (string | number)[][]) {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Helpers for exporting specific corpus views
 */
export function exportConcordanceData(lines: ConcordanceLine[], format: 'csv' | 'xlsx', query: string) {
  const headers = ['Index', 'Document', 'Left Context', 'Node Word', 'Right Context', 'L1 Word', 'R1 Word', 'Full Sentence'];
  const rows = lines.map((l, idx) => [
    idx + 1,
    l.docName,
    l.leftContext,
    l.node,
    l.rightContext,
    l.l1Word,
    l.r1Word,
    l.fullSentence
  ]);
  const filename = `concordance_${query.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
  if (format === 'xlsx') {
    exportToXLSX(filename, 'Concordance', headers, rows);
  } else {
    exportToCSV(filename, headers, rows);
  }
}

export function exportCollocationsData(items: CollocationItem[], nodeWord: string, format: 'csv' | 'xlsx') {
  const headers = ['Rank', 'Collocate', 'POS Tag', 'Co-occurrence (f_xy)', 'Node Freq (f_x)', 'Collocate Freq (f_y)', 'Expected', 'LogDice', 'MI Score', 'T-Score', 'Dice Coeff', 'Left Hits', 'Right Hits', 'Relation'];
  const rows = items.map((c, idx) => [
    idx + 1,
    c.word,
    c.tag,
    c.cooccurrenceCount,
    c.nodeCount,
    c.collocateCount,
    c.expected,
    c.logDice,
    c.miScore,
    c.tScore,
    c.dice,
    c.leftCount,
    c.rightCount,
    c.relation || ''
  ]);
  const filename = `collocations_${nodeWord.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
  if (format === 'xlsx') {
    exportToXLSX(filename, 'Collocations', headers, rows);
  } else {
    exportToCSV(filename, headers, rows);
  }
}

export function exportNGramsData(items: NGramItem[], n: number, format: 'csv' | 'xlsx') {
  const headers = ['Rank', `${n}-Gram Pattern`, 'Frequency', 'Relative Frequency (per 10k)', 'POS Category Sequence'];
  const rows = items.map((item, idx) => [
    idx + 1,
    item.ngram,
    item.count,
    item.relativeFreq,
    item.tags.join(' + ')
  ]);
  const filename = `${n}_grams_frequency_${Date.now()}`;
  if (format === 'xlsx') {
    exportToXLSX(filename, `${n}-Grams`, headers, rows);
  } else {
    exportToCSV(filename, headers, rows);
  }
}

export function exportKeynessData(items: KeynessItem[], format: 'csv' | 'xlsx') {
  const headers = ['Rank', 'Word', 'POS Tag', 'Study Freq', 'Study Freq (per 10k)', 'Ref Freq', 'Ref Freq (per 10k)', 'Log-Likelihood (G2)', '% Difference', 'Status'];
  const rows = items.map((k, idx) => [
    idx + 1,
    k.word,
    k.tag,
    k.studyFreq,
    k.studyRelFreq,
    k.refFreq,
    k.refRelFreq,
    k.logLikelihood,
    k.percentDiff,
    k.isOverused ? 'Overused (+)' : 'Underused (-)'
  ]);
  const filename = `keyness_keywords_${Date.now()}`;
  if (format === 'xlsx') {
    exportToXLSX(filename, 'Keywords', headers, rows);
  } else {
    exportToCSV(filename, headers, rows);
  }
}

export function exportCorpusSummary(stats: CorpusStats, docName: string, format: 'csv' | 'xlsx') {
  const headers = ['Metric', 'Value'];
  const rows: (string | number)[][] = [
    ['Corpus Name', docName],
    ['Total Word Tokens (N)', stats.totalTokens],
    ['Unique Word Types (V)', stats.totalTypes],
    ['Type-Token Ratio (TTR)', Number((stats.ttr * 100).toFixed(2)) + '%'],
    ['Standardized TTR (STTR / 1k)', Number((stats.sttr * 100).toFixed(2)) + '%'],
    ['Hapax Legomena Count', stats.hapaxCount],
    ['Hapax Legomena Ratio', Number((stats.hapaxRatio * 100).toFixed(2)) + '% of types'],
    ['Total Sentences', stats.sentenceCount],
    ['Average Word Length', Number(stats.averageWordLength.toFixed(2)) + ' chars'],
    ['Average Sentence Length', Number(stats.averageSentenceLength.toFixed(2)) + ' words'],
    ['Lexical Density', Number((stats.lexicalDensity * 100).toFixed(2)) + '%'],
    ['Noun Count', stats.posDistribution.NOUN],
    ['Verb Count', stats.posDistribution.VERB],
    ['Adjective Count', stats.posDistribution.ADJ],
    ['Adverb Count', stats.posDistribution.ADV],
    ['Pronoun Count', stats.posDistribution.PRON],
    ['Preposition Count', stats.posDistribution.PREP],
    ['Determiner Count', stats.posDistribution.DET],
    ['Conjunction Count', stats.posDistribution.CONJ],
    ['Numeral Count', stats.posDistribution.NUM]
  ];
  const filename = `corpus_summary_${Date.now()}`;
  if (format === 'xlsx') {
    exportToXLSX(filename, 'Summary', headers, rows);
  } else {
    exportToCSV(filename, headers, rows);
  }
}
