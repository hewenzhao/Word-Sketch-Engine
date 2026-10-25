import React, { useMemo } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  PieChart, 
  Sparkles, 
  ArrowRight, 
  Download,
  Activity,
  Layers,
  BookOpen
} from 'lucide-react';
import { CorpusStats, Token, POSTag } from '../types/corpus';
import { exportCorpusSummary } from '../lib/exportUtils';
import { STOPWORDS } from '../lib/corpusEngine';

interface DashboardProps {
  stats: CorpusStats;
  tokens: Token[];
  corpusName: string;
  onExploreWord: (word: string, targetView: 'concordance' | 'collocations') => void;
  onSwitchTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  tokens,
  corpusName,
  onExploreWord,
  onSwitchTab
}) => {
  // Top 10 content words (excluding stopwords)
  const topContentWords = useMemo(() => {
    const counts = new Map<string, { count: number; tag: POSTag }>();
    for (const t of tokens) {
      if (t.tag === 'PUNCT') continue;
      const w = t.lower;
      if (STOPWORDS.has(w)) continue;
      const existing = counts.get(w);
      if (existing) {
        existing.count++;
      } else {
        counts.set(w, { count: 1, tag: t.tag });
      }
    }
    return Array.from(counts.entries())
      .map(([word, d]) => ({ word, count: d.count, tag: d.tag }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tokens]);

  // Zipf's law data points (top 20 words total including all)
  const zipfData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tokens) {
      if (t.tag === 'PUNCT') continue;
      counts.set(t.lower, (counts.get(t.lower) || 0) + 1);
    }
    const sorted = Array.from(counts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const f1 = sorted[0]?.count || 1;
    return sorted.map((item, idx) => {
      const rank = idx + 1;
      const zipfExpected = Math.round(f1 / rank);
      return {
        ...item,
        rank,
        zipfExpected
      };
    });
  }, [tokens]);

  // POS percentage calculation
  const totalTaggedTokens = useMemo(() => {
    return Object.values(stats.posDistribution).reduce((a, b) => a + b, 0) || 1;
  }, [stats.posDistribution]);

  const posCategories: Array<{ tag: POSTag; label: string; color: string }> = [
    { tag: 'NOUN', label: 'Nouns', color: 'bg-blue-500' },
    { tag: 'VERB', label: 'Verbs', color: 'bg-emerald-500' },
    { tag: 'ADJ', label: 'Adjectives', color: 'bg-amber-500' },
    { tag: 'ADV', label: 'Adverbs', color: 'bg-violet-500' },
    { tag: 'PRON', label: 'Pronouns', color: 'bg-pink-500' },
    { tag: 'PREP', label: 'Prepositions', color: 'bg-cyan-500' },
    { tag: 'DET', label: 'Determiners', color: 'bg-slate-400' },
    { tag: 'CONJ', label: 'Conjunctions', color: 'bg-orange-400' },
  ];

  const maxFreq = topContentWords[0]?.count || 1;
  const maxZipf = zipfData[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Corpus Linguistics Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time statistical indicators and lexical profile for <span className="font-medium text-slate-800 dark:text-slate-200">{corpusName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCorpusSummary(stats, corpusName, 'csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => exportCorpusSummary(stats, corpusName, 'xlsx')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export XLSX
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Tokens (N)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats.totalTokens.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Excluding punctuation</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Unique Types (V)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.totalTypes.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Distinct vocabulary forms</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">TTR / STTR</span>
            <span className="text-[11px] text-slate-400">Diversity</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {(stats.ttr * 100).toFixed(1)}% <span className="text-xs font-normal text-slate-400">/ {(stats.sttr * 100).toFixed(1)}%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Type-Token Ratio & 1k Standardized</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Lexical Density</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {(stats.lexicalDensity * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Content words (N, V, Adj, Adv)</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Hapax Legomena</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats.hapaxCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{(stats.hapaxRatio * 100).toFixed(1)}% of total vocabulary (freq = 1)</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Average Sentence Length</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats.averageSentenceLength.toFixed(1)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Words per sentence across {stats.sentenceCount} sentences</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Mean Word Length</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {stats.averageWordLength.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Characters per token</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Quick Actions</span>
          <div className="space-y-1.5 mt-2">
            <button
              onClick={() => onSwitchTab('concordance')}
              className="w-full flex items-center justify-between text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              <span>KWIC Concordance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSwitchTab('collocations')}
              className="w-full flex items-center justify-between text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              <span>Word Sketch & Collocates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizations Row: Top Content Words & POS Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords / Content Words Visual Bar Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Top Frequent Content Lexemes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Non-stopword terms ranked by raw occurrences. Click to inspect collocations or concordance.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Rank 1-10</span>
          </div>

          <div className="space-y-2.5">
            {topContentWords.map((item, index) => {
              const widthPct = Math.max(8, Math.round((item.count / maxFreq) * 100));
              return (
                <div key={item.word} className="group flex items-center gap-3 text-xs">
                  <span className="w-5 text-right font-mono tabular-nums text-slate-400">
                    {index + 1}.
                  </span>
                  <div className="w-24 font-medium text-slate-800 dark:text-slate-200 truncate" title={item.word}>
                    {item.word}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-sm h-5 overflow-hidden flex items-center">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-sm transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => onExploreWord(item.word, 'concordance')}
                      title="View KWIC Concordance"
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white"
                    >
                      KWIC
                    </button>
                    <button
                      onClick={() => onExploreWord(item.word, 'collocations')}
                      title="Compute Word Sketch"
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white"
                    >
                      Sketch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Part-of-Speech Grammatical Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Grammatical Category Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated morphological & syntactic tag breakdown across the corpus
              </p>
            </div>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          {/* Stacked Bar Distribution Indicator */}
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex mb-4">
            {posCategories.map(cat => {
              const count = stats.posDistribution[cat.tag] || 0;
              const pct = (count / totalTaggedTokens) * 100;
              if (pct < 0.5) return null;
              return (
                <div
                  key={cat.tag}
                  className={`${cat.color} h-full`}
                  style={{ width: `${pct}%` }}
                  title={`${cat.label}: ${count} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Categorical Rows */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {posCategories.map(cat => {
              const count = stats.posDistribution[cat.tag] || 0;
              const pct = ((count / totalTaggedTokens) * 100).toFixed(1);
              return (
                <div
                  key={cat.tag}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {cat.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zipf's Law Rank-Frequency Distribution */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Lexical Rank-Frequency & Zipf's Law Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Observing power-law frequency drop-off: empirical frequency (bars) vs. theoretical $f_1 / r$ (markers)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Power Law Curve</span>
        </div>

        <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
          {zipfData.map((d) => {
            const barHeightPct = Math.max(4, Math.round((d.count / maxZipf) * 100));
            const zipfMarkerHeightPct = Math.max(4, Math.round((d.zipfExpected / maxZipf) * 100));

            return (
              <div key={d.word} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                  #{d.rank} <strong>{d.word}</strong>: {d.count} (Expected: {d.zipfExpected})
                </div>

                {/* Theoretical Zipf point indicator */}
                <div 
                  className="absolute w-2 h-0.5 bg-amber-500 rounded z-10 transition-all"
                  style={{ bottom: `${zipfMarkerHeightPct}%` }}
                  title={`Zipf expectation: ${d.zipfExpected}`}
                />

                {/* Empirical frequency bar */}
                <div
                  className="w-full bg-indigo-600/85 hover:bg-indigo-600 dark:bg-indigo-500/80 dark:hover:bg-indigo-400 rounded-t-sm transition-all"
                  style={{ height: `${barHeightPct}%` }}
                />
                
                {/* Word label */}
                <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center mt-1.5" title={d.word}>
                  {d.word}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-indigo-600 rounded-xs" />
            <span>Observed Frequency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded-xs" />
            <span>Zipf's Theoretical ($f_1 / r$)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
