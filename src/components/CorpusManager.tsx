import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, Plus, Trash2, Library, X } from 'lucide-react';
import { CorpusDocument } from '../types/corpus';
import { SAMPLE_CORPORA } from '../lib/sampleCorpora';

interface CorpusManagerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: CorpusDocument[];
  activeDocId: string;
  onSelectActiveDoc: (id: string) => void;
  referenceDocId: string;
  onSelectReferenceDoc: (id: string) => void;
  onAddDocument: (name: string, text: string) => void;
  onDeleteDocument: (id: string) => void;
  onLoadSample: (sampleId: string) => void;
}

export const CorpusManager: React.FC<CorpusManagerProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onSelectActiveDoc,
  referenceDocId,
  onSelectReferenceDoc,
  onAddDocument,
  onDeleteDocument,
  onLoadSample
}) => {
  const [pasteName, setPasteName] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.txt') || file.type.includes('text') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content && content.trim()) {
            onAddDocument(file.name.replace(/\.[^/.]+$/, ''), content);
          }
        };
        reader.readAsText(file, 'UTF-8');
      }
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const name = pasteName.trim() || `User Text (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    onAddDocument(name, pasteText);
    setPasteName('');
    setPasteText('');
    setShowPasteForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Corpus Workbench & Text Manager
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload UTF-8 text files, choose study and reference corpora, or load standard reference samples
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Upload & Ingestion Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain,.md"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Click or drag & drop UTF-8 (.txt) files
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Multi-file supported. Texts are tokenized and indexed locally.
              </p>
            </div>

            {/* Pre-loaded Sample Corpora Quick Ingestion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/30 dark:bg-slate-800/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Library className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Sample Reference Corpora
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pre-compiled multi-genre linguistic datasets ready for exploration and contrastive research.
                </p>
                <div className="space-y-2">
                  {SAMPLE_CORPORA.map((s) => {
                    const isLoaded = documents.some(d => d.id === s.id);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-400">{s.category}</span>
                        </div>
                        <button
                          onClick={() => onLoadSample(s.id)}
                          disabled={isLoaded}
                          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                            isLoaded
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}
                        >
                          {isLoaded ? 'Loaded' : 'Load Sample'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Paste Raw Text Toggle & Form */}
          <div>
            {!showPasteForm ? (
              <button
                onClick={() => setShowPasteForm(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" /> Or paste custom text directly
              </button>
            ) : (
              <form onSubmit={handlePasteSubmit} className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Paste Corpus Text
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasteForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Corpus Name (e.g., Editorial Corpus, Patient Interviews, Novel Extract)"
                  value={pasteName}
                  onChange={(e) => setPasteName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                />
                <textarea
                  rows={4}
                  placeholder="Paste raw UTF-8 text here for automatic tokenization and linguistic tagging..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    Ingest & Tokenize Text
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Current Loaded Documents Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Active Corpora ({documents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Designate primary Study Corpus and Reference Corpus for contrastive keyness
              </p>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No corpus loaded yet.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload a .txt file or load one of the standard samples above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Corpus Name</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Tokens (N)</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Types (V)</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Sentences</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Study Role</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Reference Role</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {documents.map((doc) => {
                      const isStudy = doc.id === activeDocId;
                      const isRef = doc.id === referenceDocId;

                      return (
                        <tr
                          key={doc.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            isStudy ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate" title={doc.name}>{doc.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {doc.wordCount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {doc.typeCount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {doc.sentenceCount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onSelectActiveDoc(doc.id)}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                isStudy
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {isStudy ? 'Active Study' : 'Set as Study'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onSelectReferenceDoc(doc.id)}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                isRef
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {isRef ? 'Active Reference' : 'Set as Ref'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              disabled={documents.length <= 1}
                              title={documents.length <= 1 ? "At least one corpus must remain" : "Delete corpus"}
                              className={`p-1.5 rounded transition-colors ${
                                documents.length <= 1
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current Analysis Target: <strong className="text-slate-800 dark:text-slate-200 font-medium">{documents.find(d => d.id === activeDocId)?.name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
