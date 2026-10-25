import React from 'react';
import { BookOpen, Moon, Sun, FolderKanban, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  corpusName: string;
  totalTokens: number;
  openCorpusManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  corpusName,
  totalTokens,
  openCorpusManager
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'concordance', label: 'Concordance (KWIC)' },
    { id: 'collocations', label: 'Collocations & Sketch' },
    { id: 'ngrams', label: 'Frequency & N-grams' },
    { id: 'regex', label: 'Regex & CQL Patterns' },
    { id: 'comparative', label: 'Comparative Analysis' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              LexiSketch
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Corpus Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Corpus Info Badge / Switcher Button */}
            <button
              onClick={openCorpusManager}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Manage corpora and upload files"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">{corpusName}</span>
              <span className="text-slate-400 dark:text-slate-500 font-mono tabular-nums text-[11px]">
                ({totalTokens.toLocaleString()} words)
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-4 border-t border-slate-100 dark:border-slate-800 text-xs no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
