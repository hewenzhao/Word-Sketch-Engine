import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Search, 
  Download, 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Sparkles
} from 'lucide-react';
import { Token, ConcordanceLine, PatternQueryPreset } from '../types/corpus';
import { searchConcordance, searchCQL } from '../lib/corpusEngine';
import { exportConcordanceData } from '../lib/exportUtils';

interface RegexPatternViewProps {
  tokens: Token[];
  corpusName: string;
}

const PRESETS: PatternQueryPreset[] = [
  {
    name: 'Adverbial Modifier (-ly)',
    description: 'Finds adverbs formed with the -ly morphological suffix',
    query: '\\b[a-zA-Z]+ly\\b',
    type: 'regex'
  },
  {
    name: 'Nominalization Suffixes (-tion, -ment, -ness)',
    description: 'Extracts abstract nominalizations common in academic prose',
    query: '\\b[a-zA-Z]+(tion|sion|ment|ness|ity)\\b',
    type: 'regex'
  },
  {
    name: 'Negative Prefixes (un-, in-, im-, dis-)',
    description: 'Finds antonyms and negated lexical items',
    query: '\\b(un|in|im|dis)[a-z]{3,}\\b',
    type: 'regex'
  },
  {
    name: 'Capitalized Proper Nouns / Names',
    description: 'Detects mid-sentence capitalized entities or names',
    query: '\\b[A-Z][a-z]{2,}\\b',
    type: 'regex'
  },
  {
    name: 'Adjective + Noun Bigram (CQL)',
    description: 'Finds attributive adjective modifying a subsequent noun',
    query: '[tag="ADJ"] [tag="NOUN"]',
    type: 'cql'
  },
  {
    name: 'Passive Voice Heuristic (CQL)',
    description: 'Form of "be" followed by a past participle / verb',
    query: '[lemma="be"] [tag="VERB"]',
    type: 'cql'
  },
  {
    name: 'Prepositional Phrase Specifier (CQL)',
    description: 'Preposition followed by Determiner and Noun',
    query: '[tag="PREP"] [tag="DET"] [tag="NOUN"]',
    type: 'cql'
  }
];

export const RegexPatternView: React.FC<RegexPatternViewProps> = ({
  tokens,
  corpusName
}) => {
  const [queryType, setQueryType] = useState<'regex' | 'cql'>('regex');
  const [patternInput, setPatternInput] = useState<string>('\\b[a-zA-Z]+(tion|sion)\\b');
  const [activePattern, setActivePattern] = useState<string>('\\b[a-zA-Z]+(tion|sion)\\b');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [regexError, setRegexError] = useState<string | null>(null);

  // Validate regex syntax on change
  const isValid = useMemo(() => {
    if (queryType === 'regex') {
      try {
        new RegExp(patternInput, caseSensitive ? '' : 'i');
        setRegexError(null);
        return true;
      } catch (err: any) {
        setRegexError(err.message || 'Invalid regular expression');
        return false;
      }
    } else {
      setRegexError(null);
      return patternInput.includes('[');
    }
  }, [patternInput, queryType, caseSensitive]);

  // Execute pattern search
  const matches: ConcordanceLine[] = useMemo(() => {
    if (!activePattern.trim()) return [];

    if (queryType === 'regex') {
      try {
        return searchConcordance(tokens, activePattern, {
          isRegex: true,
          caseSensitive,
          docName: corpusName
        });
      } catch {
        return [];
      }
    } else {
      return searchCQL(tokens, activePattern, {
        docName: corpusName
      });
    }
  }, [tokens, activePattern, queryType, caseSensitive, corpusName]);

  // Match frequency breakdown (unique matched words and counts)
  const matchBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of matches) {
      const lower = m.node.toLowerCase();
      map.set(lower, (map.get(lower) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, [matches]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && patternInput.trim()) {
      setActivePattern(patternInput.trim());
    }
  };

  const handleApplyPreset = (preset: PatternQueryPreset) => {
    setQueryType(preset.type);
    setPatternInput(preset.query);
    setActivePattern(preset.query);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportConcordanceData(matches, format, `pattern_${queryType}`);
  };

  return (
    <div className="space-y-6">
      {/* Search & Pattern Engine Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pattern Query Engine (Regex & CQL)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identify morphological affixes, syntactic schemas, and multi-word token sequences
            </p>
          </div>

          {/* Mode Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => {
                setQueryType('regex');
                setPatternInput('\\b[a-zA-Z]+ly\\b');
                setActivePattern('\\b[a-zA-Z]+ly\\b');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                queryType === 'regex'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Regular Expression (Regex)
            </button>
            <button
              onClick={() => {
                setQueryType('cql');
                setPatternInput('[tag="ADJ"] [tag="NOUN"]');
                setActivePattern('[tag="ADJ"] [tag="NOUN"]');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                queryType === 'cql'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Corpus Query Language (CQL)
            </button>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Code2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={patternInput}
                onChange={(e) => setPatternInput(e.target.value)}
                placeholder={
                  queryType === 'regex'
                    ? 'e.g. \\b[A-Za-z]+(tion|ment)\\b or \\b\\d+\\b'
                    : 'e.g. [tag="ADJ"] [tag="NOUN"] or [lemma="be"] [tag="VERB"]'
                }
                className="w-full text-sm font-mono pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!isValid}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              Execute Pattern Search
            </button>
          </div>

          {/* Validation Feedback & Options */}
          <div className="flex items-center justify-between text-xs">
            <div>
              {regexError ? (
                <div className="flex items-center gap-1.5 text-rose-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{regexError}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid {queryType.toUpperCase()} Syntax</span>
                </div>
              )}
            </div>

            {queryType === 'regex' && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Case Sensitive</span>
              </label>
            )}
          </div>
        </form>

        {/* Curated Presets Library */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
            Curated Pattern Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left"
                title={`${preset.description}: ${preset.query}`}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                  [{preset.type.toUpperCase()}]
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div>
          <span className="text-xs text-slate-400 block">Pattern Execution Results:</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {activePattern}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ({matches.length} matches · {matchBreakdown.length} unique types)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={matches.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={matches.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
          </button>
        </div>
      </div>

      {/* Distinct Matches Chips & Concordance Lines */}
      {matches.length > 0 && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Top Matched Lexical Types ({matchBreakdown.length})
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {matchBreakdown.slice(0, 30).map((item) => (
              <span
                key={item.word}
                className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
              >
                <span>{item.word}</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                  ({item.count})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KWIC Concordance Table for Matches */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {matches.length === 0 ? (
          <div className="p-12 text-center">
            <Code2 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No occurrences matched pattern
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Select one of the presets above or refine your regular expression.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-4 text-right w-[42%]">Left Context</th>
                  <th className="py-2.5 px-2 text-center w-[16%]">Matched Pattern</th>
                  <th className="py-2.5 px-4 text-left w-[42%]">Right Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {matches.map((line, idx) => (
                  <tr
                    key={line.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
