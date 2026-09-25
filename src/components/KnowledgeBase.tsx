import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Search, 
  Tag, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { KnowledgeDoc, UserRole } from '../types';

interface KnowledgeBaseProps {
  userRole: UserRole;
  onSelectQuestionInAI?: (question: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  userRole,
  onSelectQuestionInAI
}) => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal to add new knowledge document
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState<'faq' | 'pricing' | 'specifications' | 'policy' | 'operations'>('faq');
  const [newContent, setNewContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchKnowledgeDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
        if (data.length > 0 && !selectedDoc) {
          setSelectedDoc(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching knowledge documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeDocs();
  }, []);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          source: newSource || 'Internal Administrative SOP',
          category: newCategory,
          content: newContent
        })
      });

      if (res.ok) {
        const created: KnowledgeDoc = await res.json();
        setDocs(prev => [created, ...prev]);
        setSelectedDoc(created);
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewSource('');
        setNewContent('');
      }
    } catch (err) {
      console.error('Error adding knowledge document:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDocs = docs.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">RAG Knowledge Base Documents</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {docs.length} Active Indexes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official knowledge store for grounding Gemini AI answers regarding printing rates, turnaround times, refund policies, and paper standards.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Document</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search knowledge documents or policies..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'faq', 'pricing', 'specifications', 'policy', 'operations'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Document List on Left, Document Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List */}
        <div className="lg:col-span-4 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDoc?.doc_id === doc.doc_id;
            return (
              <div
                key={doc.doc_id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {doc.content}
                </p>
                <p className="text-[10px] text-slate-500 mt-2 truncate">
                  Source: {doc.source}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Full Document Content Viewer */}
        <div className="lg:col-span-8 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-sm">
          {selectedDoc ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {selectedDoc.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{selectedDoc.doc_id}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                    <span>Source: {selectedDoc.source}</span>
                    <span>·</span>
                    <span>Indexed: {new Date(selectedDoc.uploaded_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              {/* Document Text */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedDoc.content}
              </div>

              {/* Grounding Info Banner */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="text-xs text-slate-300">
                    This document is actively chunked and embedded in the live RAG index.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">Select a knowledge document on the left to inspect its contents.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">Add Knowledge Document</h3>
            <p className="text-xs text-slate-400 mb-6">
              Ingest a new printing FAQ, operational handbook section, or pricing update into the RAG vector index.
            </p>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thesis Binding Guidelines 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="faq">FAQ</option>
                    <option value="pricing">Pricing</option>
                    <option value="specifications">Specifications</option>
                    <option value="policy">Policy & Refund</option>
                    <option value="operations">Operations & Kiosks</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Source Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. Office of Registrar"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Document Content</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Enter full text, instructions, numbered points, or guidelines to be indexed for RAG..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-colors"
                >
                  {isSaving ? 'Indexing & Chunking...' : 'Ingest Document into RAG'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
