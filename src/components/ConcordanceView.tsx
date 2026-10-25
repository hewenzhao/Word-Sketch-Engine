import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  FileSpreadsheet, 
  Maximize2, 
  SlidersHorizontal,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { Token, ConcordanceLine } from '../types/corpus';
import { searchConcordance } from '../lib/corpusEngine';
import { exportConcordanceData } from '../lib/exportUtils';

interface ConcordanceViewProps {
  tokens: Token[];
  initialQuery?: string;
  corpusName: string;
}

type SortField = 'pos' | 'node' | 'l1' | 'r1';

export const ConcordanceView: React.FC<ConcordanceViewProps> = ({
  tokens,
  initialQuery = 'corpus',
  corpusName
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [searchByLemma, setSearchByLemma] = useState(false);
  const [contextSpan, setContextSpan] = useState(7);
  const [sortBy, setSortBy] = useState<SortField>('pos');
  const [selectedLine, setSelectedLine] = useState<ConcordanceLine | null>(null);

  // Compute KWIC results
  const lines = useMemo(() => {
    return searchConcordance(tokens, activeQuery, {
      caseSensitive,
      searchByLemma,
      contextWords: contextSpan,
      docName: corpusName
    });
  }, [tokens, activeQuery, caseSensitive, searchByLemma, contextSpan, corpusName]);

  // Sort results
  const sortedLines = useMemo(() => {
    const list = [...lines];
    if (sortBy === 'pos') {
      return list.sort((a, b) => a.tokenIndex - b.tokenIndex);
    }
    if (sortBy === 'node') {
      return list.sort((a, b) => a.node.localeCompare(b.node));
    }
    if (sortBy === 'l1') {
      return list.sort((a, b) => a.l1Word.localeCompare(b.l1Word));
    }
    if (sortBy === 'r1') {
      return list.sort((a, b) => a.r1Word.localeCompare(b.r1Word));
    }
    return list;
  }, [lines, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportConcordanceData(sortedLines, format, activeQuery);
  };

  // Dispersion bins (100 bins along corpus length)
  const dispersionBins = useMemo(() => {
    const bins = new Array(80).fill(0);
    for (const line of lines) {
      const idx = Math.min(79, Math.floor(line.positionRatio * 80));
      bins[idx]++;
    }
    const max = Math.max(...bins, 1);
    return bins.map(count => ({ count, intensity: count / max }));
  }, [lines]);

  const normalizedFreqPer10k = useMemo(() => {
    if (tokens.length === 0) return '0.00';
    return ((lines.length / tokens.length) * 10000).toFixed(2);
  }, [lines.length, tokens.length]);

  return (
    <div className="space-y-6">
      {/* Header & Search Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter node word or lemma (e.g., language, analyze, model, empirical)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              Search Concordance
            </button>
          </div>

          {/* Filter & Tuning Parameters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={searchByLemma}
                  onChange={(e) => setSearchByLemma(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Match Lemma (Base Form)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Case Sensitive</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Context Window:</span>
                <select
                  value={contextSpan}
                  onChange={(e) => setContextSpan(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs"
                >
                  <option value={5}>5 words</option>
                  <option value={7}>7 words</option>
                  <option value={10}>10 words</option>
                  <option value={15}>15 words</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sort KWIC by:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setSortBy('pos')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortBy === 'pos'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Position
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('l1')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortBy === 'l1'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Left (L1)
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('node')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortBy === 'node'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Node Word
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('r1')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    sortBy === 'r1'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-medium'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Right (R1)
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Dispersion Plot & Hit Metrics Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Concordance Dispersion Plot
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              <strong>{lines.length}</strong> hits found ({normalizedFreqPer10k} per 10k words)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={lines.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={lines.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
            </button>
          </div>
        </div>

        {/* Visual Dispersion Strip (Timeline of Corpus) */}
        <div className="space-y-1">
          <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden flex border border-slate-200 dark:border-slate-700/60 p-0.5">
            {dispersionBins.map((bin, i) => (
              <div
                key={i}
                className="flex-1 h-full mx-[0.5px] rounded-2xs transition-colors"
                style={{
                  backgroundColor: bin.count > 0 ? `rgba(99, 102, 241, ${Math.max(0.3, bin.intensity)})` : 'transparent'
                }}
                title={`Slice ${i + 1}/80: ${bin.count} hits`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>0% (Corpus Beginning)</span>
            <span>50%</span>
            <span>100% (End)</span>
          </div>
        </div>
      </div>

      {/* Classic KWIC Concordance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {sortedLines.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No concordance lines found for "{activeQuery}"
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try enabling "Match Lemma", unchecking "Case Sensitive", or testing a different search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-4 text-right w-[42%]">Left Context</th>
                  <th className="py-2.5 px-2 text-center w-[16%]">Node</th>
                  <th className="py-2.5 px-4 text-left w-[42%]">Right Context</th>
                  <th className="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {sortedLines.map((line, idx) => (
                  <tr
                    key={line.id}
                    onClick={() => setSelectedLine(line)}
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-300 truncate">
                      {line.leftContext}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 rounded">
                      {line.node}
                    </td>
                    <td className="py-2 px-4 text-left text-slate-600 dark:text-slate-300 truncate">
                      {line.rightContext}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Sentence / Context Modal */}
      {selectedLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Expanded Linguistic Context
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedLine.docName} · Hit token index: {selectedLine.tokenIndex}
                </span>
              </div>
              <button
                onClick={() => setSelectedLine(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-sans">
              {selectedLine.fullSentence}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Left Neighbor (L1)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLine.l1Word || '(beginning)'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Right Neighbor (R1)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLine.r1Word || '(end)'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLine(null)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
