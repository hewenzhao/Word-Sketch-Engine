/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CorpusManager } from './components/CorpusManager';
import { Dashboard } from './components/Dashboard';
import { ConcordanceView } from './components/ConcordanceView';
import { CollocationsView } from './components/CollocationsView';
import { NgramsFrequencyView } from './components/NgramsFrequencyView';
import { RegexPatternView } from './components/RegexPatternView';
import { ComparativeAnalysisView } from './components/ComparativeAnalysisView';
import { CorpusDocument, CorpusStats } from './types/corpus';
import { tokenizeText, computeCorpusStats } from './lib/corpusEngine';
import { SAMPLE_CORPORA } from './lib/sampleCorpora';

export default function App() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lexisketch_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lexisketch_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lexisketch_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Initializing documents with pre-loaded samples
  const [documents, setDocuments] = useState<CorpusDocument[]>(() => {
    return SAMPLE_CORPORA.map((s) => {
      const tokens = tokenizeText(s.text);
      const wordTokens = tokens.filter(t => t.tag !== 'PUNCT');
      const types = new Set(wordTokens.map(t => t.lower)).size;
      const sentenceCount = Math.max(1, Math.max(...tokens.map(t => t.sentenceIndex), 0) + 1);

      return {
        id: s.id,
        name: s.name,
        sizeBytes: new Blob([s.text]).size,
        rawText: s.text,
        tokens,
        wordCount: wordTokens.length,
        sentenceCount,
        typeCount: types,
        uploadedAt: new Date().toISOString()
      };
    });
  });

  const [activeDocId, setActiveDocId] = useState<string>('sample-academic');
  const [referenceDocId, setReferenceDocId] = useState<string>('sample-literary');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCorpusManagerOpen, setIsCorpusManagerOpen] = useState<boolean>(false);

  // Jump queries for cross-view navigation
  const [jumpConcordanceQuery, setJumpConcordanceQuery] = useState<string>('corpus');
  const [jumpCollocationNode, setJumpCollocationNode] = useState<string>('corpus');

  // Currently active study document
  const activeDocument = useMemo(() => {
    return documents.find(d => d.id === activeDocId) || documents[0];
  }, [documents, activeDocId]);

  // Statistical summary of active document
  const activeStats: CorpusStats = useMemo(() => {
    if (!activeDocument) {
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
        posDistribution: { NOUN: 0, VERB: 0, ADJ: 0, ADV: 0, PRON: 0, DET: 0, PREP: 0, CONJ: 0, NUM: 0, PUNCT: 0, OTHER: 0 }
      };
    }
    return computeCorpusStats(activeDocument.tokens);
  }, [activeDocument]);

  // Add custom or uploaded document
  const handleAddDocument = (name: string, rawText: string) => {
    const tokens = tokenizeText(rawText);
    const wordTokens = tokens.filter(t => t.tag !== 'PUNCT');
    const types = new Set(wordTokens.map(t => t.lower)).size;
    const sentenceCount = Math.max(1, Math.max(...tokens.map(t => t.sentenceIndex), 0) + 1);

    const newDoc: CorpusDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      sizeBytes: new Blob([rawText]).size,
      rawText,
      tokens,
      wordCount: wordTokens.length,
      sentenceCount,
      typeCount: types,
      uploadedAt: new Date().toISOString()
    };

    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) return;
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocId === id) {
      const remaining = documents.filter(d => d.id !== id);
      if (remaining.length > 0) setActiveDocId(remaining[0].id);
    }
    if (referenceDocId === id) {
      const remaining = documents.filter(d => d.id !== id);
      if (remaining.length > 0) setReferenceDocId(remaining[0].id);
    }
  };

  // Load a pre-set sample
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_CORPORA.find(s => s.id === sampleId);
    if (!sample) return;
    if (documents.some(d => d.id === sample.id)) {
      setActiveDocId(sample.id);
      return;
    }
    const tokens = tokenizeText(sample.text);
    const wordTokens = tokens.filter(t => t.tag !== 'PUNCT');
    const types = new Set(wordTokens.map(t => t.lower)).size;
    const sentenceCount = Math.max(1, Math.max(...tokens.map(t => t.sentenceIndex), 0) + 1);

    const newDoc: CorpusDocument = {
      id: sample.id,
      name: sample.name,
      sizeBytes: new Blob([sample.text]).size,
      rawText: sample.text,
      tokens,
      wordCount: wordTokens.length,
      sentenceCount,
      typeCount: types,
      uploadedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  };

  // Cross-view word navigation
  const handleExploreWord = (word: string, targetView: 'concordance' | 'collocations') => {
    if (targetView === 'concordance') {
      setJumpConcordanceQuery(word);
      setActiveTab('concordance');
    } else {
      setJumpCollocationNode(word);
      setActiveTab('collocations');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(prev => !prev)}
        corpusName={activeDocument?.name || 'Corpus'}
        totalTokens={activeDocument?.wordCount || 0}
        openCorpusManager={() => setIsCorpusManagerOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={activeStats}
            tokens={activeDocument?.tokens || []}
            corpusName={activeDocument?.name || 'Corpus'}
            onExploreWord={handleExploreWord}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'concordance' && (
          <ConcordanceView
            key={`concordance-${activeDocId}-${jumpConcordanceQuery}`}
            tokens={activeDocument?.tokens || []}
            initialQuery={jumpConcordanceQuery}
            corpusName={activeDocument?.name || 'Corpus'}
          />
        )}

        {activeTab === 'collocations' && (
          <CollocationsView
            key={`collocations-${activeDocId}-${jumpCollocationNode}`}
            tokens={activeDocument?.tokens || []}
            initialNode={jumpCollocationNode}
            onJumpToConcordance={(query) => {
              setJumpConcordanceQuery(query);
              setActiveTab('concordance');
            }}
          />
        )}

        {activeTab === 'ngrams' && (
          <NgramsFrequencyView
            tokens={activeDocument?.tokens || []}
            onJumpToConcordance={(query) => {
              setJumpConcordanceQuery(query);
              setActiveTab('concordance');
            }}
          />
        )}

        {activeTab === 'regex' && (
          <RegexPatternView
            tokens={activeDocument?.tokens || []}
            corpusName={activeDocument?.name || 'Corpus'}
          />
        )}

        {activeTab === 'comparative' && (
          <ComparativeAnalysisView
            documents={documents}
            activeStudyDocId={activeDocId}
            activeRefDocId={referenceDocId}
            onSelectStudyDoc={setActiveDocId}
            onSelectRefDoc={setReferenceDocId}
            onJumpToConcordance={(word) => {
              setJumpConcordanceQuery(word);
              setActiveTab('concordance');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">LexiSketch</span>
            <span>·</span>
            <span>Corpus Linguistics & Distributional Lexicography Workbench</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCorpusManagerOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Manage Texts ({documents.length} loaded)
            </button>
            <span>·</span>
            <span>UTF-8 Tokenized & Indexed</span>
          </div>
        </div>
      </footer>

      {/* Corpus Manager Modal */}
      <CorpusManager
        isOpen={isCorpusManagerOpen}
        onClose={() => setIsCorpusManagerOpen(false)}
        documents={documents}
        activeDocId={activeDocId}
        onSelectActiveDoc={setActiveDocId}
        referenceDocId={referenceDocId}
        onSelectReferenceDoc={setReferenceDocId}
        onAddDocument={handleAddDocument}
        onDeleteDocument={handleDeleteDocument}
        onLoadSample={handleLoadSample}
      />
    </div>
  );
}
