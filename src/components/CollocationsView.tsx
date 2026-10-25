import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Download, 
  FileSpreadsheet, 
  Sliders, 
  HelpCircle, 
  Search,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { Token, CollocationItem } from '../types/corpus';
import { computeCollocations } from '../lib/corpusEngine';
import { exportCollocationsData } from '../lib/exportUtils';

interface CollocationsViewProps {
  tokens: Token[];
  initialNode?: string;
  onJumpToConcordance: (query: string) => void;
}

type MetricSort = 'logDice' | 'miScore' | 'tScore' | 'dice' | 'cooccurrenceCount';

export const CollocationsView: React.FC<CollocationsViewProps> = ({
  tokens,
  initialNode = 'language',
  onJumpToConcordance
}) => {
  const [nodeWord, setNodeWord] = useState(initialNode);
  const [activeNode, setActiveNode] = useState(initialNode);
  const [leftSpan, setLeftSpan] = useState(3);
  const [rightSpan, setRightSpan] = useState(3);
  const [minFreq, setMinFreq] = useState(2);
  const [filterStopwords, setFilterStopwords] = useState(true);
  const [useLemma, setUseLemma] = useState(true);
  const [sortBy, setSortBy] = useState<MetricSort>('logDice');
  const [viewMode, setViewMode] = useState<'sketch' | 'table'>('sketch');

  // Compute collocations
  const collocates = useMemo(() => {
    return computeCollocations(tokens, activeNode, {
      leftSpan,
      rightSpan,
      minFreq,
      filterStopwords,
      useLemma
    });
  }, [tokens, activeNode, leftSpan, rightSpan, minFreq, filterStopwords, useLemma]);

  // Sorted collocates
  const sortedCollocates = useMemo(() => {
    return [...collocates].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [collocates, sortBy]);

  // Sketch Engine Grammatical Relation Clusters
  const sketchRelations = useMemo(() => {
    const groups: Record<string, CollocationItem[]> = {
      'Modifiers & Qualifiers': [],
      'Objects, Complements & Post-links': [],
      'Coordinated & Bilateral Collocates': [],
      'General Associations': []
    };

    for (const item of collocates) {
      if (item.relation?.includes('Modifier')) {
        groups['Modifiers & Qualifiers'].push(item);
      } else if (item.relation?.includes('Object') || item.relation?.includes('Right')) {
        groups['Objects, Complements & Post-links'].push(item);
      } else if (item.relation?.includes('Bilateral') || item.relation?.includes('Coordinated')) {
        groups['Coordinated & Bilateral Collocates'].push(item);
      } else {
        groups['General Associations'].push(item);
      }
    }

    return groups;
  }, [collocates]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeWord.trim()) {
      setActiveNode(nodeWord.trim().toLowerCase());
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportCollocationsData(sortedCollocates, activeNode, format);
  };

  const maxScore = sortedCollocates[0]?.[sortBy] || 1;

  return (
    <div className="space-y-6">
      {/* Search & Configuration Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Target node word (e.g., language, empirical, model, system)..."
                value={nodeWord}
                onChange={(e) => setNodeWord(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              Generate Word Sketch
            </button>
          </div>

          {/* Metric & Window Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                Association Metric
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as MetricSort)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="logDice">LogDice (Sketch Engine Standard)</option>
                <option value="miScore">Mutual Information (MI Score)</option>
                <option value="tScore">T-Score (Certainty Measure)</option>
                <option value="dice">Dice Coefficient</option>
                <option value="cooccurrenceCount">Raw Co-occurrence (f_xy)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-medium">Window Span</span>
                <span className="font-mono tabular-nums">[-{leftSpan}, +{rightSpan}]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={leftSpan}
                  onChange={(e) => setLeftSpan(Number(e.target.value))}
                  className="w-1/2 accent-indigo-600"
                  title="Left context span"
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rightSpan}
                  onChange={(e) => setRightSpan(Number(e.target.value))}
                  className="w-1/2 accent-indigo-600"
                  title="Right context span"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-medium">Min Co-occurrence</span>
                <span className="font-mono tabular-nums">&ge; {minFreq}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={minFreq}
                onChange={(e) => setMinFreq(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="flex flex-col justify-end gap-1.5">
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
                <span className="text-slate-700 dark:text-slate-300">Use Base Lemma</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Header bar with View Mode & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div>
          <span className="text-xs text-slate-400 block">Collocational profile for:</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              "{activeNode}"
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ({sortedCollocates.length} significant collocates found)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('sketch')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'sketch'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Word Sketch Matrix
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Full Statistics Table
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport('csv')}
              disabled={sortedCollocates.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={sortedCollocates.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {sortedCollocates.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Network className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No collocations meeting criteria (&ge; {minFreq} co-occurrences in span [-{leftSpan}, +{rightSpan}])
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try lowering the minimum co-occurrence threshold or expanding the window span.
          </p>
        </div>
      ) : viewMode === 'sketch' ? (
        /* Sketch Engine Style Word Sketch Matrix */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(sketchRelations).map(([relTitle, items]) => (
              <div
                key={relTitle}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={relTitle}>
                      {relTitle}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      No matching relations
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {items.slice(0, 7).map((item) => (
                        <div
                          key={item.word}
                          className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate mr-2">
                            <button
                              onClick={() => {
                                setNodeWord(item.word);
                                setActiveNode(item.word);
                              }}
                              title="Pivot Word Sketch on this word"
                              className="font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left"
                            >
                              {item.word}
                            </button>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {item.tag}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 text-[11px]">
                              {sortBy === 'logDice' ? `${item.logDice.toFixed(1)}` : item[sortBy]}
                            </span>
                            <button
                              onClick={() => onJumpToConcordance(item.word)}
                              title="Inspect KWIC Concordance"
                              className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Top Collocation Strength Visualizer Bar Graph */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Collocational Association Strength Ranking
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ranking top collocates by {sortBy.toUpperCase()} with co-occurrence counts
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Top 12 Collocates
              </span>
            </div>

            <div className="space-y-2">
              {sortedCollocates.slice(0, 12).map((item, index) => {
                const metricValue = item[sortBy];
                const widthPct = Math.max(6, Math.round((metricValue / maxScore) * 100));

                return (
                  <div key={item.word} className="flex items-center gap-3 text-xs">
                    <span className="w-5 text-right font-mono tabular-nums text-slate-400">
                      {index + 1}.
                    </span>
                    <div className="w-28 font-medium text-slate-800 dark:text-slate-200 truncate flex items-center justify-between">
                      <span className="truncate">{item.word}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({item.cooccurrenceCount})</span>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-sm h-5 overflow-hidden flex items-center">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-sm transition-all duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {sortBy === 'logDice' || sortBy === 'miScore' || sortBy === 'tScore'
                        ? metricValue.toFixed(2)
                        : metricValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Complete Tabular View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center">Rank</th>
                  <th className="py-2.5 px-4 text-left">Collocate</th>
                  <th className="py-2.5 px-2 text-center">POS</th>
                  <th className="py-2.5 px-3 text-right">f_xy</th>
                  <th className="py-2.5 px-3 text-right">f_y</th>
                  <th className="py-2.5 px-3 text-right">Expected</th>
                  <th className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">LogDice</th>
                  <th className="py-2.5 px-3 text-right">MI Score</th>
                  <th className="py-2.5 px-3 text-right">T-Score</th>
                  <th className="py-2.5 px-3 text-right">Dice</th>
                  <th className="py-2.5 px-3 text-center">L / R Hits</th>
                  <th className="py-2.5 px-4 text-left">Grammar Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {sortedCollocates.map((c, idx) => (
                  <tr
                    key={c.word}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 text-left font-semibold text-slate-900 dark:text-slate-100 font-sans">
                      <button
                        onClick={() => {
                          setNodeWord(c.word);
                          setActiveNode(c.word);
                        }}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Pivot to this collocate"
                      >
                        {c.word}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-center text-[10px] text-slate-400">
                      {c.tag}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">
                      {c.cooccurrenceCount}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                      {c.collocateCount}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                      {c.expected}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                      {c.logDice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {c.miScore.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {c.tScore.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                      {c.dice.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-[11px] text-slate-500">
                      {c.leftCount}L / {c.rightCount}R
                    </td>
                    <td className="py-2.5 px-4 text-left font-sans text-slate-500 truncate max-w-[150px]">
                      {c.relation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
