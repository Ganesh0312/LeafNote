'use client';

import React, { use, useEffect, useState } from 'react';
import { useNotes } from '../../../../../../../../context/NoteContext';
import { useAuth } from '../../../../../../../../context/AuthContext';
import { useToast } from '../../../../../../../../context/ToastContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Search,
  SlidersHorizontal,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '../../../../../../../../components/MarkdownRenderer';
import MarkdownEditor from '../../../../../../../../components/MarkdownEditor';
import TableOfContents from '../../../../../../../../components/TableOfContents';
import LoadingSkeleton from '../../../../../../../../components/LoadingSkeleton';

export default function SubtopicDetailPage({ params }) {
  const { subjectSlug, topicSlug, subtopicSlug } = use(params);
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    fetchSubtopicBySlug,
    fetchTopicBySlug,
    updateSubtopic,
    deleteSubtopic,
    createQa,
    updateQa,
    deleteQa,
    fetchSubjects,
  } = useNotes();

  const [subtopic, setSubtopic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Next/Prev navigation slugs
  const [prevSubtopic, setPrevSubtopic] = useState(null);
  const [nextSubtopic, setNextSubtopic] = useState(null);

  // Edit Subtopic Content states
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [subtopicTitle, setSubtopicTitle] = useState('');
  const [subtopicContent, setSubtopicContent] = useState('');

  // Q&A Accordion, creation, and search states
  const [openQas, setOpenQas] = useState({});
  const [editingQaId, setEditingQaId] = useState(null);
  const [showAddQa, setShowAddQa] = useState(false);
  const [qaSearch, setQaSearch] = useState('');
  const [qaSort, setQaSort] = useState('order'); // order, newest, oldest
  const [copiedQaId, setCopiedQaId] = useState(null);

  // Q&A Form inputs
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaTags, setQaTags] = useState('');
  const [qaOrder, setQaOrder] = useState(0);

  const loadData = async () => {
    setLoading(true);
    // Fetch current subtopic and its Q&As
    const data = await fetchSubtopicBySlug(subtopicSlug);
    if (data) {
      setSubtopic(data);
      setSubtopicTitle(data.title);
      setSubtopicContent(data.content || '');
      setOpenQas({});
      setEditingQaId(null);
      setShowAddQa(false);

      // Fetch parent topic subtopics list for next/prev navigation
      const topicData = await fetchTopicBySlug(topicSlug);
      if (topicData && topicData.subtopics) {
        const idx = topicData.subtopics.findIndex((st) => st.slug === subtopicSlug);
        setPrevSubtopic(idx > 0 ? topicData.subtopics[idx - 1] : null);
        setNextSubtopic(idx < topicData.subtopics.length - 1 ? topicData.subtopics[idx + 1] : null);
      }
    } else {
      showToast('Subtopic not found', 'error');
      router.push(`/subject/${subjectSlug}/topic/${topicSlug}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [subtopicSlug]);

  if (loading) {
    return <LoadingSkeleton type="workspace" />;
  }

  if (!subtopic) return null;

  const isOwner = user && (subtopic.createdBy?._id === user._id || subtopic.createdBy === user._id);

  const handleUpdateSubtopic = async () => {
    const res = await updateSubtopic(subtopic._id, subtopic.topic?._id, {
      title: subtopicTitle,
      content: subtopicContent,
    });
    if (res.success) {
      showToast('Subtopic notes saved', 'success');
      setIsEditingNote(false);
      await fetchSubjects();
      loadData();
    } else {
      showToast(res.error || 'Failed to save subtopic', 'error');
    }
  };

  const handleDeleteSubtopic = async () => {
    if (!confirm('Are you sure you want to delete this Subtopic? This will delete all its Q&As.')) return;
    const res = await deleteSubtopic(subtopic._id, subtopic.topic?._id);
    if (res.success) {
      showToast('Subtopic deleted successfully', 'success');
      await fetchSubjects();
      router.push(`/subject/${subjectSlug}/topic/${topicSlug}`);
    } else {
      showToast(res.error || 'Failed to delete subtopic', 'error');
    }
  };

  // Q&A Handlers
  const handleAddQa = async (e) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;

    const tagsArr = qaTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const res = await createQa(
      qaQuestion,
      qaAnswer,
      subtopic._id,
      subtopic.topic?._id,
      tagsArr,
      qaOrder
    );

    if (res.success) {
      showToast('Q&A Card added', 'success');
      setQaQuestion('');
      setQaAnswer('');
      setQaTags('');
      setQaOrder(0);
      setShowAddQa(false);
      loadData();
    } else {
      showToast(res.error || 'Failed to add Q&A', 'error');
    }
  };

  const handleStartEditQa = (qa) => {
    setEditingQaId(qa._id);
    setQaQuestion(qa.question);
    setQaAnswer(qa.answer);
    setQaTags(qa.tags ? qa.tags.join(', ') : '');
    setQaOrder(qa.order || 0);
  };

  const handleUpdateQa = async (qaId) => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;

    const tagsArr = qaTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const res = await updateQa(qaId, subtopic._id, {
      question: qaQuestion,
      answer: qaAnswer,
      tags: tagsArr,
      order: qaOrder,
    });

    if (res.success) {
      showToast('Q&A updated', 'success');
      setEditingQaId(null);
      loadData();
    } else {
      showToast(res.error || 'Failed to update Q&A', 'error');
    }
  };

  const handleDeleteQa = async (qaId) => {
    if (!confirm('Are you sure you want to delete this Q&A card?')) return;
    const res = await deleteQa(qaId, subtopic._id);
    if (res.success) {
      showToast('Q&A deleted', 'success');
      loadData();
    } else {
      showToast(res.error || 'Failed to delete Q&A', 'error');
    }
  };

  const handleCopyAnswer = (e, qaId, answerText) => {
    e.stopPropagation();
    navigator.clipboard.writeText(answerText);
    setCopiedQaId(qaId);
    showToast('Copied answer to clipboard!', 'info');
    setTimeout(() => setCopiedQaId(null), 2000);
  };

  // Q&A Search & Filter Logic
  const filteredQas = (subtopic.qas || [])
    .filter((qa) => {
      const query = qaSearch.toLowerCase();
      const matchQuestion = qa.question.toLowerCase().includes(query);
      const matchAnswer = qa.answer.toLowerCase().includes(query);
      const matchTags = qa.tags && qa.tags.some((t) => t.toLowerCase().includes(query));
      return matchQuestion || matchAnswer || matchTags;
    })
    .sort((a, b) => {
      if (qaSort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (qaSort === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // sort by order
      return a.order - b.order;
    });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Scrollable workspace content */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10 flex flex-col h-[calc(100vh-4rem)]">
        <div className="max-w-4xl w-full mx-auto space-y-8 flex-1 pb-16">
          
          {/* Breadcrumb navigation */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <Link
              href={`/subject/${subjectSlug}/topic/${topicSlug}`}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to {subtopic.topic?.title}</span>
            </Link>

            {isOwner && !isEditingNote && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer font-semibold"
                >
                  <Edit size={12} className="text-indigo-400" />
                  <span>Edit Note</span>
                </button>
                <button
                  onClick={handleDeleteSubtopic}
                  className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer font-semibold"
                >
                  <Trash2 size={12} className="text-red-400" />
                  <span>Delete Note</span>
                </button>
              </div>
            )}
          </div>

          {/* Subtopic header */}
          {isEditingNote ? (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-3">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Subtopic Title</label>
              <input
                type="text"
                value={subtopicTitle}
                onChange={(e) => setSubjectName ? setSubtopicTitle(e.target.value) : setSubtopicTitle(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                required
              />
            </div>
          ) : (
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <FileText size={22} className="text-indigo-400" />
                <span>{subtopic.title}</span>
              </h1>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 pt-1">
                <span>By:</span>
                <span className="text-zinc-450 font-semibold">{subtopic.createdBy?.username || 'Unknown'}</span>
                <span>•</span>
                <span>Last updated:</span>
                <span className="text-zinc-455 font-semibold">{new Date(subtopic.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Subtopic Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Subtopic Notes</h2>
              {isEditingNote && (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateSubtopic}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-650 hover:bg-indigo-600 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    <Save size={12} />
                    <span>Save Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNote(false);
                      setSubtopicTitle(subtopic.title);
                      setSubtopicContent(subtopic.content || '');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    <X size={12} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingNote ? (
              <div className="h-[400px]">
                <MarkdownEditor value={subtopicContent} onChange={setSubtopicContent} />
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-zinc-900/80 rounded-xl p-5 min-h-[100px]">
                <MarkdownRenderer content={subtopicContent} placeholder="_No notes added to this subtopic yet. Click 'Edit Note' to add some._" />
              </div>
            )}
          </div>

          {/* Q&A section */}
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={18} className="text-emerald-400" />
                <span>Q&A Accordion Cards</span>
              </h2>
              {isOwner && !showAddQa && (
                <button
                  onClick={() => setShowAddQa(true)}
                  className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-zinc-350 hover:text-white hover:bg-zinc-800 transition cursor-pointer font-semibold"
                >
                  <Plus size={14} className="text-emerald-400" />
                  <span>Add Q&A Card</span>
                </button>
              )}
            </div>

            {/* Q&A Add Form */}
            {showAddQa && (
              <form onSubmit={handleAddQa} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                  <span className="text-xs font-bold text-emerald-400">New Q&A Flashcard</span>
                  <button type="button" onClick={() => setShowAddQa(false)} className="text-zinc-550 hover:text-white"><X size={14} /></button>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Question</label>
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="Enter the question..."
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Answer (Markdown Supported)</label>
                  <textarea
                    value={qaAnswer}
                    onChange={(e) => setQaAnswer(e.target.value)}
                    placeholder="Enter detailed answer..."
                    rows={4}
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none resize-none font-mono focus:border-zinc-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={qaTags}
                      onChange={(e) => setQaTags(e.target.value)}
                      placeholder="math, dynamic, theory"
                      className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Sorting Order</label>
                    <input
                      type="number"
                      value={qaOrder}
                      onChange={(e) => setQaOrder(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2.5 text-xs font-semibold cursor-pointer">
                  <Plus size={14} />
                  <span>Create Q&A Card</span>
                </button>
              </form>
            )}

            {/* Q&A Filter panel */}
            {(subtopic.qas && subtopic.qas.length > 0) && (
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-900/10 border border-zinc-900 rounded-xl">
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg text-zinc-400 w-full sm:w-64 focus-within:border-zinc-700">
                  <Search size={14} />
                  <input
                    type="text"
                    value={qaSearch}
                    onChange={(e) => setQaSearch(e.target.value)}
                    placeholder="Search Q&As or tags..."
                    className="bg-transparent text-xs outline-none border-none text-white w-full placeholder-zinc-650"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto text-xs">
                  <SlidersHorizontal size={14} className="text-zinc-500" />
                  <span className="text-zinc-500">Sort by:</span>
                  <select
                    value={qaSort}
                    onChange={(e) => setQaSort(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 text-zinc-350 text-xs rounded px-2 py-1 outline-none focus:border-zinc-700"
                  >
                    <option value="order">Manual Order</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            )}

            {/* Accordion Cards lists */}
            {filteredQas.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl text-zinc-550 text-xs">
                No Q&A cards match the current filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQas.map((qa, index) => {
                  const isOpen = openQas[qa._id];
                  const isEditingQa = editingQaId === qa._id;

                  return (
                    <div
                      key={qa._id}
                      className={`border rounded-xl transition-all ${
                        isOpen ? 'border-zinc-800 bg-zinc-900/25' : 'border-zinc-900 bg-zinc-950'
                      }`}
                    >
                      {isEditingQa ? (
                        <div className="p-5 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Question</label>
                            <input
                              type="text"
                              value={qaQuestion}
                              onChange={(e) => setQaQuestion(e.target.value)}
                              className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Answer (Markdown)</label>
                            <textarea
                              value={qaAnswer}
                              onChange={(e) => setQaAnswer(e.target.value)}
                              rows={4}
                              className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-xs text-white outline-none resize-none font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-400 font-bold uppercase">Tags (comma-separated)</label>
                              <input
                                type="text"
                                value={qaTags}
                                onChange={(e) => setQaTags(e.target.value)}
                                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-xs text-white outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-400 font-bold uppercase">Order</label>
                              <input
                                type="number"
                                value={qaOrder}
                                onChange={(e) => setQaOrder(parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-xs text-white outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdateQa(qa._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              <Save size={12} />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingQaId(null)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                            >
                              <X size={12} />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Accordion trigger row */}
                          <div
                            onClick={() => setOpenQas((prev) => ({ ...prev, [qa._id]: !prev[qa._id] }))}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/10 transition rounded-t-xl"
                          >
                            <div className="flex items-center gap-3 pr-4">
                              <span className="text-zinc-500 font-bold text-xs">Q{index + 1}.</span>
                              <span className="text-sm font-semibold text-zinc-200">{qa.question}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {/* Tags pill */}
                              {qa.tags && qa.tags.slice(0, 2).map((t, ti) => (
                                <span key={ti} className="hidden sm:inline bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                                  {t}
                                </span>
                              ))}

                              {/* Copy answer */}
                              <button
                                onClick={(e) => handleCopyAnswer(e, qa._id, qa.answer)}
                                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white transition cursor-pointer"
                              >
                                {copiedQaId === qa._id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              </button>

                              {isOwner && (
                                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 mr-1">
                                  <button
                                    onClick={() => handleStartEditQa(qa)}
                                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-indigo-400 transition cursor-pointer"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQa(qa._id)}
                                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                              <span className="text-zinc-500">
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </span>
                            </div>
                          </div>

                          {/* Accordion content */}
                          {isOpen && (
                            <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/40 text-xs">
                              <div className="pl-6 border-l border-zinc-850">
                                <MarkdownRenderer content={qa.answer} />
                              </div>
                              {/* Bottom tags bar */}
                              {qa.tags && qa.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-zinc-900/40">
                                  {qa.tags.map((t, ti) => (
                                    <span key={ti} className="bg-zinc-900 text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded-md text-[9px]">
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Next/Prev Navigation arrows */}
          <div className="flex items-center justify-between border-t border-zinc-900 pt-6 mt-8">
            {prevSubtopic ? (
              <Link
                href={`/subject/${subjectSlug}/topic/${topicSlug}/subtopic/${prevSubtopic.slug}`}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900/40 border border-zinc-900 px-4 py-2.5 rounded-xl hover:bg-zinc-900/80 hover:border-zinc-800 transition duration-300 font-semibold cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Prev: {prevSubtopic.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextSubtopic ? (
              <Link
                href={`/subject/${subjectSlug}/topic/${topicSlug}/subtopic/${nextSubtopic.slug}`}
                className="flex items-center gap-1.5 text-xs text-zinc-450 hover:text-white bg-indigo-650/15 border border-indigo-900/40 px-4 py-2.5 rounded-xl hover:bg-indigo-650/30 hover:border-indigo-800 transition duration-300 font-semibold text-indigo-400 cursor-pointer"
              >
                <span>Next: {nextSubtopic.title}</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Floating Table of Contents Sidebar */}
      <TableOfContents content={subtopicContent} />
    </div>
  );
}
