import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  Download, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Token, NGramItem, POSTag } from '../types/corpus';
import { computeNGrams } from '../lib/corpusEngine';
import { exportNGramsData } from '../lib/exportUtils';

interface NgramsFrequencyViewProps {
  tokens: Token[];
  onJumpToConcordance: (query: string) => void;
}

export const NgramsFrequencyView: React.FC<NgramsFrequencyViewProps> = ({
  tokens,
  onJumpToConcordance
}) => {
  const [ngramLength, setNgramLength] = useState<number>(1);
  const [minCount, setMinCount] = useState<number>(2);
  const [filterStopwords, setFilterStopwords] = useState<boolean>(true);
  const [useLemma, setUseLemma] = useState<boolean>(false);
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Compute n-grams
  const ngrams = useMemo(() => {
    return computeNGrams(tokens, ngramLength, {
      minCount,
      filterStopwords,
      useLemma
    });
  }, [tokens, ngramLength, minCount, filterStopwords, useLemma]);

  // Apply POS filter and local search term
  const filteredNgrams = useMemo(() => {
    return ngrams.filter(item => {
      if (searchTerm.trim()) {
        if (!item.ngram.toLowerCase().includes(searchTerm.toLowerCase().trim())) {
          return false;
        }
      }
      if (posFilter !== 'ALL') {
        if (ngramLength === 1) {
          return item.tags[0] === posFilter;
        } else {
          return item.tags.some(t => t === posFilter);
        }
      }
      return true;
    });
  }, [ngrams, searchTerm, posFilter, ngramLength]);

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportNGramsData(filteredNgrams, ngramLength, format);
  };

  const maxFreq = filteredNgrams[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Word Frequency & N-Gram Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Extract unigrams, collocated n-grams, and multi-word syntactic units with frequency densities
            </p>
          </div>

          {/* Segmented N-gram Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setNgramLength(n)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  ngramLength === n
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {n === 1 ? '1-Gram (Words)' : `${n}-Gram`}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Grammatical Tags</option>
              <option value="NOUN">Nouns</option>
              <option value="VERB">Verbs</option>
              <option value="ADJ">Adjectives</option>
              <option value="ADV">Adverbs</option>
              <option value="NUM">Numerals</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Min Count:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={minCount}
              onChange={(e) => setMinCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 w-4 text-right">
              {minCount}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterStopwords}
                onChange={(e) => setFilterStopwords(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Filter Stopwords</span>
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
        </div>
      </div>

      {/* Visual Chart: Top 12 N-grams */}
      {filteredNgrams.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Top {ngramLength}-Gram Frequency Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Frequency occurrences and normalized rates per 10,000 words
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredNgrams.slice(0, 12).map((item, index) => {
              const widthPct = Math.max(6, Math.round((item.count / maxFreq) * 100));

              return (
                <div key={item.ngram} className="group flex items-center gap-3 text-xs">
                  <span className="w-6 text-right font-mono tabular-nums text-slate-400">
                    {index + 1}.
                  </span>
                  <div className="w-48 font-medium text-slate-800 dark:text-slate-200 truncate font-mono">
                    {item.ngram}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-sm h-5 overflow-hidden flex items-center">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-sm transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-28 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{item.count}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">
                      ({item.relativeFreq}/10k)
                    </span>
                  </div>
                  <button
                    onClick={() => onJumpToConcordance(item.tokens[0])}
                    title="Jump to KWIC Concordance"
                    className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {filteredNgrams.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart2 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No n-grams matched criteria
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting the minimum frequency or clearing the search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Rank</th>
                  <th className="py-2.5 px-4 text-left">N-Gram Construction</th>
                  <th className="py-2.5 px-4 text-left">POS Sequence</th>
                  <th className="py-2.5 px-4 text-right">Raw Frequency</th>
                  <th className="py-2.5 px-4 text-right">Relative Freq (per 10k)</th>
                  <th className="py-2.5 px-3 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredNgrams.map((item, idx) => (
                  <tr
                    key={item.ngram}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.ngram}
                    </td>
                    <td className="py-2 px-4 text-slate-500 text-[11px]">
                      {item.tags.join(' + ')}
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right tabular-nums text-indigo-600 dark:text-indigo-400">
                      {item.relativeFreq}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onJumpToConcordance(item.tokens[0])}
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
