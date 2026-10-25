import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  Download, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Sparkles
} from 'lucide-react';
import { Token, CorpusDocument, KeynessItem } from '../types/corpus';
import { computeKeyness, computeCorpusStats } from '../lib/corpusEngine';
import { exportKeynessData } from '../lib/exportUtils';

interface ComparativeAnalysisViewProps {
  documents: CorpusDocument[];
  activeStudyDocId: string;
  activeRefDocId: string;
  onSelectStudyDoc: (id: string) => void;
  onSelectRefDoc: (id: string) => void;
  onJumpToConcordance: (word: string) => void;
}

export const ComparativeAnalysisView: React.FC<ComparativeAnalysisViewProps> = ({
  documents,
  activeStudyDocId,
  activeRefDocId,
  onSelectStudyDoc,
  onSelectRefDoc,
  onJumpToConcordance
}) => {
  const [minFreq, setMinFreq] = useState<number>(2);
  const [filterStopwords, setFilterStopwords] = useState<boolean>(true);
  const [useLemma, setUseLemma] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'overused' | 'underused'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const studyDoc = useMemo(() => documents.find(d => d.id === activeStudyDocId) || documents[0], [documents, activeStudyDocId]);
  const refDoc = useMemo(() => documents.find(d => d.id === activeRefDocId) || documents[1] || documents[0], [documents, activeRefDocId]);

  const studyStats = useMemo(() => studyDoc ? computeCorpusStats(studyDoc.tokens) : null, [studyDoc]);
  const refStats = useMemo(() => refDoc ? computeCorpusStats(refDoc.tokens) : null, [refDoc]);

  // Compute keyness list
  const keynessItems: KeynessItem[] = useMemo(() => {
    if (!studyDoc || !refDoc || studyDoc.id === refDoc.id) return [];
    return computeKeyness(studyDoc.tokens, refDoc.tokens, {
      minFreq,
      filterStopwords,
      useLemma
    });
  }, [studyDoc, refDoc, minFreq, filterStopwords, useLemma]);

  // Filter items
  const filteredItems = useMemo(() => {
    return keynessItems.filter(item => {
      if (searchTerm.trim() && !item.word.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
        return false;
      }
      if (statusFilter === 'overused' && !item.isOverused) return false;
      if (statusFilter === 'underused' && item.isOverused) return false;
      return true;
    });
  }, [keynessItems, searchTerm, statusFilter]);

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportKeynessData(filteredItems, format);
  };

  const topOverused = useMemo(() => {
    return keynessItems.filter(k => k.isOverused).slice(0, 10);
  }, [keynessItems]);

  const maxLogLikelihood = topOverused[0]?.logLikelihood || 1;

  return (
    <div className="space-y-6">
      {/* Target Corpora Selector Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Comparative Corpus Analysis & Keyness (G&sup2;)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identify statistically significant lexical shifts (overuse & underuse) between study and reference corpora
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={filteredItems.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={filteredItems.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
            </button>
          </div>
        </div>

        {/* Study vs Reference Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-3.5 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <label className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
              Study Corpus (Focus)
            </label>
            <select
              value={studyDoc?.id || ''}
              onChange={(e) => onSelectStudyDoc(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.wordCount.toLocaleString()} words)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
            <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 block mb-1">
              Reference Corpus (Baseline)
            </label>
            <select
              value={refDoc?.id || ''}
              onChange={(e) => onSelectRefDoc(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 text-slate-800 dark:text-slate-100"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.wordCount.toLocaleString()} words)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterStopwords}
                onChange={(e) => setFilterStopwords(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Exclude Stopwords</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useLemma}
                onChange={(e) => setUseLemma(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Lemmatize</span>
            </label>
          </div>

          <div className="inline-flex justify-end rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all' ? 'bg-white dark:bg-slate-700 font-semibold shadow-2xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              All Keywords
            </button>
            <button
              onClick={() => setStatusFilter('overused')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'overused' ? 'bg-white dark:bg-slate-700 font-semibold shadow-2xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
              }`}
            >
              Overused (+)
            </button>
            <button
              onClick={() => setStatusFilter('underused')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'underused' ? 'bg-white dark:bg-slate-700 font-semibold shadow-2xs text-amber-600 dark:text-amber-400' : 'text-slate-500'
              }`}
            >
              Underused (-)
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-side Metrics Comparison Strip */}
      {studyStats && refStats && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Comparative Lexical Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block mb-1">Total Word Tokens (N)</span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {studyStats.totalTokens.toLocaleString()}
                </span>
                <span className="text-slate-500">vs</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {refStats.totalTokens.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block mb-1">Vocabulary Types (V)</span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {studyStats.totalTypes.toLocaleString()}
                </span>
                <span className="text-slate-500">vs</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {refStats.totalTypes.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block mb-1">Type-Token Ratio (TTR)</span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {(studyStats.ttr * 100).toFixed(1)}%
                </span>
                <span className="text-slate-500">vs</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {(refStats.ttr * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block mb-1">Lexical Density</span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {(studyStats.lexicalDensity * 100).toFixed(1)}%
                </span>
                <span className="text-slate-500">vs</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {(refStats.lexicalDensity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Keywords Visual Representation */}
      {topOverused.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Strongest Positive Keyness ($G^2$ Log-Likelihood)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Words heavily characteristic of <strong className="font-medium text-slate-700 dark:text-slate-300">{studyDoc?.name}</strong> compared to <strong className="font-medium text-slate-700 dark:text-slate-300">{refDoc?.name}</strong>
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Keyness Rank 1-10</span>
          </div>

          <div className="space-y-2">
            {topOverused.map((item, index) => {
              const widthPct = Math.max(6, Math.round((item.logLikelihood / maxLogLikelihood) * 100));

              return (
                <div key={item.word} className="flex items-center gap-3 text-xs">
                  <span className="w-5 text-right font-mono tabular-nums text-slate-400">
                    {index + 1}.
                  </span>
                  <div className="w-28 font-medium text-slate-800 dark:text-slate-200 truncate flex items-center justify-between">
                    <span className="truncate">{item.word}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({item.studyFreq})</span>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-sm h-5 overflow-hidden flex items-center">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-sm transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-24 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      G&sup2; {item.logLikelihood}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyness Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {studyDoc?.id === refDoc?.id ? (
          <div className="p-12 text-center">
            <GitCompare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Study corpus and Reference corpus are identical
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Select two different corpora from the dropdowns above to calculate comparative keyness.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <GitCompare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No keywords meet threshold criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Rank</th>
                  <th className="py-2.5 px-4 text-left">Keyword</th>
                  <th className="py-2.5 px-2 text-center">POS</th>
                  <th className="py-2.5 px-4 text-right">Study Freq (N={studyDoc?.wordCount})</th>
                  <th className="py-2.5 px-4 text-right">Ref Freq (N={refDoc?.wordCount})</th>
                  <th className="py-2.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">Log-Likelihood (G&sup2;)</th>
                  <th className="py-2.5 px-4 text-right">% Difference</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.word}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      {item.word}
                    </td>
                    <td className="py-2 px-2 text-center text-[10px] text-slate-400">
                      {item.tag}
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.studyFreq}</span>
                      <span className="text-slate-400 ml-1 text-[11px]">({item.studyRelFreq}/10k)</span>
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums">
                      <span className="text-slate-900 dark:text-slate-100">{item.refFreq}</span>
                      <span className="text-slate-400 ml-1 text-[11px]">({item.refRelFreq}/10k)</span>
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                      {item.logLikelihood}
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums">
                      {item.percentDiff > 0 ? `+${item.percentDiff}%` : `${item.percentDiff}%`}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-sans px-2 py-0.5 rounded ${
                          item.isOverused
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {item.isOverused ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" /> Overused
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3 h-3" /> Underused
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onJumpToConcordance(item.word)}
                        className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        KWIC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
