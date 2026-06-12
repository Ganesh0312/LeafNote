'use client';

import React, { use, useEffect, useState, useMemo } from 'react';
import { useNotes } from '../../../../../context/NoteContext';
import { useAuth } from '../../../../../context/AuthContext';
import { useToast } from '../../../../../context/ToastContext';
import {
  HelpCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  Check,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
  Layers,
  Sparkles,
  GraduationCap,
  MessageCircleQuestion,
} from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '../../../../../components/MarkdownRenderer';
import LoadingSkeleton from '../../../../../components/LoadingSkeleton';

export default function SubjectQuestionsPage({ params }) {
  const { subjectSlug } = use(params);
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    fetchSubjectBySlug,
    fetchQasBySubject,
    updateQa,
    deleteQa,
  } = useNotes();

  const [subject, setSubject] = useState(null);
  const [groupedTopics, setGroupedTopics] = useState([]);
  const [totalQas, setTotalQas] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search / filter
  const [qaSearch, setQaSearch] = useState('');
  const [qaSort, setQaSort] = useState('order');

  // Accordion open state: { qaId: bool }
  const [openQas, setOpenQas] = useState({});

  // Copied state
  const [copiedQaId, setCopiedQaId] = useState(null);

  // Inline edit state
  const [editingQaId, setEditingQaId] = useState(null);
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaTags, setQaTags] = useState('');
  const [qaOrder, setQaOrder] = useState(0);

  // Collapse/expand topic sections
  const [collapsedTopics, setCollapsedTopics] = useState({});
  const [collapsedSubtopics, setCollapsedSubtopics] = useState({});

  const loadData = async () => {
    setLoading(true);
    const subjectData = await fetchSubjectBySlug(subjectSlug);
    if (!subjectData) {
      showToast('Subject not found', 'error');
      setLoading(false);
      return;
    }
    setSubject(subjectData.subject);

    const qnaData = await fetchQasBySubject(subjectData.subject._id);
    if (qnaData) {
      setGroupedTopics(qnaData.topics || []);
      setTotalQas(qnaData.totalQas || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [subjectSlug]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCopyAnswer = (e, qaId, answerText) => {
    e.stopPropagation();
    navigator.clipboard.writeText(answerText);
    setCopiedQaId(qaId);
    showToast('Answer copied to clipboard!', 'info');
    setTimeout(() => setCopiedQaId(null), 2000);
  };

  const handleStartEditQa = (qa) => {
    setEditingQaId(qa._id);
    setQaQuestion(qa.question);
    setQaAnswer(qa.answer);
    setQaTags(qa.tags ? qa.tags.join(', ') : '');
    setQaOrder(qa.order || 0);
    // Open accordion if not open
    setOpenQas((prev) => ({ ...prev, [qa._id]: true }));
  };

  const handleUpdateQa = async (qaId, subtopicId) => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;
    const tagsArr = qaTags.split(',').map((t) => t.trim()).filter(Boolean);
    const res = await updateQa(qaId, subtopicId, { question: qaQuestion, answer: qaAnswer, tags: tagsArr, order: qaOrder });
    if (res.success) {
      showToast('Q&A updated', 'success');
      setEditingQaId(null);
      loadData();
    } else {
      showToast(res.error || 'Failed to update Q&A', 'error');
    }
  };

  const handleDeleteQa = async (qaId, subtopicId) => {
    if (!confirm('Are you sure you want to delete this Q&A card?')) return;
    const res = await deleteQa(qaId, subtopicId);
    if (res.success) {
      showToast('Q&A deleted', 'success');
      loadData();
    } else {
      showToast(res.error || 'Failed to delete Q&A', 'error');
    }
  };

  const toggleTopic = (topicId) =>
    setCollapsedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const toggleSubtopic = (subtopicId) =>
    setCollapsedSubtopics((prev) => ({ ...prev, [subtopicId]: !prev[subtopicId] }));

  // ── Derived / filtered data ───────────────────────────────────────────────

  const filteredTopics = useMemo(() => {
    const q = qaSearch.toLowerCase();
    return groupedTopics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((st) => ({
        ...st,
        qas: st.qas
          .filter((qa) => {
            if (!q) return true;
            return (
              qa.question.toLowerCase().includes(q) ||
              qa.answer.toLowerCase().includes(q) ||
              (qa.tags && qa.tags.some((t) => t.toLowerCase().includes(q)))
            );
          })
          .sort((a, b) => {
            if (qaSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (qaSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            return a.order - b.order;
          }),
      })).filter((st) => st.qas.length > 0),
    })).filter((topic) => topic.subtopics.length > 0);
  }, [groupedTopics, qaSearch, qaSort]);

  const filteredTotal = useMemo(
    () => filteredTopics.reduce((acc, t) => acc + t.subtopics.reduce((a, st) => a + st.qas.length, 0), 0),
    [filteredTopics]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton type="workspace" />;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10 h-[calc(100vh-4rem)]">
      <div className="max-w-4xl w-full mx-auto space-y-8 pb-20">

        {/* ── Tab navigation ── */}
        <div className="flex items-center gap-1 border-b border-zinc-900 pb-0">
          <Link
            href={`/subject/${subjectSlug}`}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 -mb-px transition"
          >
            <GraduationCap size={13} />
            <span>Topics</span>
          </Link>
          <Link
            href={`/subject/${subjectSlug}/questions`}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 border-emerald-500 text-emerald-400 -mb-px"
          >
            <MessageCircleQuestion size={13} />
            <span>Questions</span>
          </Link>
          <div className="ml-auto pb-1">
            <span className="text-xs text-zinc-500">
              {filteredTotal} question{filteredTotal !== 1 ? 's' : ''}
              {qaSearch && ` (filtered from ${totalQas})`}
            </span>
          </div>
        </div>

        {/* ── Page Header ── */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-semibold">
            <Sparkles size={12} />
            <span>Questions Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {subject?.name}
            </span>{' '}
            — All Questions
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            All Q&amp;A cards for this subject, organized by topic and subtopic. Click any question to reveal its answer.
          </p>
        </div>


        {/* ── Search & Sort bar ── */}
        {totalQas > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl">
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 px-3 py-2 rounded-lg text-zinc-400 w-full sm:w-72 focus-within:border-zinc-700 transition">
              <Search size={14} />
              <input
                type="text"
                value={qaSearch}
                onChange={(e) => setQaSearch(e.target.value)}
                placeholder="Search questions, answers, tags..."
                className="bg-transparent text-xs outline-none border-none text-white w-full placeholder-zinc-600"
              />
              {qaSearch && (
                <button onClick={() => setQaSearch('')} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto text-xs">
              <SlidersHorizontal size={14} className="text-zinc-500" />
              <span className="text-zinc-500">Sort:</span>
              <select
                value={qaSort}
                onChange={(e) => setQaSort(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="order">Manual Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {totalQas === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-zinc-800 rounded-2xl text-center">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <HelpCircle size={24} className="text-zinc-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-400">No questions yet</p>
              <p className="text-xs text-zinc-600 max-w-xs">
                Q&amp;A cards are added inside subtopic pages. Navigate to a subtopic and create the first card.
              </p>
            </div>
          </div>
        ) : filteredTotal === 0 ? (
          <div className="text-center py-12 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-xs">
            No questions match your search.
          </div>
        ) : (
          /* ── Topic sections ── */
          <div className="space-y-8">
            {filteredTopics.map((topic, topicIndex) => {
              const isTopicCollapsed = collapsedTopics[topic._id];
              const topicQaCount = topic.subtopics.reduce((a, st) => a + st.qas.length, 0);

              return (
                <div key={topic._id} className="space-y-4">
                  {/* Topic header */}
                  <button
                    onClick={() => toggleTopic(topic._id)}
                    className="w-full flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-black">
                        {topicIndex + 1}
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-bold text-zinc-100 group-hover:text-white transition flex items-center gap-2">
                          <BookOpen size={16} className="text-indigo-400" />
                          {topic.title}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-semibold">
                        {topicQaCount} Q&amp;A{topicQaCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition">
                        {isTopicCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </button>

                  {/* Subtopics under this topic */}
                  {!isTopicCollapsed && (
                    <div className="space-y-5 pl-4 border-l-2 border-zinc-900">
                      {topic.subtopics.map((subtopic) => {
                        const isSubtopicCollapsed = collapsedSubtopics[subtopic._id];
                        return (
                          <div key={subtopic._id} className="space-y-3">
                            {/* Subtopic header */}
                            <button
                              onClick={() => toggleSubtopic(subtopic._id)}
                              className="w-full flex items-center justify-between gap-2 group cursor-pointer py-1"
                            >
                              <div className="flex items-center gap-2">
                                <Layers size={14} className="text-emerald-400 flex-shrink-0" />
                                <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-white transition text-left">
                                  {subtopic.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] text-zinc-600 font-semibold">
                                  {subtopic.qas.length} Q{subtopic.qas.length !== 1 ? 's' : ''}
                                </span>
                                <Link
                                  href={`/subject/${subjectSlug}/topic/${topic.slug}/subtopic/${subtopic.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 transition"
                                >
                                  <span>View subtopic</span>
                                  <ChevronRight size={10} />
                                </Link>
                                <span className="text-zinc-700 group-hover:text-zinc-500 transition">
                                  {isSubtopicCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                </span>
                              </div>
                            </button>

                            {/* Q&A Accordion cards */}
                            {!isSubtopicCollapsed && (
                              <div className="space-y-2 pl-2">
                                {subtopic.qas.map((qa, qIndex) => {
                                  const isOpen = openQas[qa._id];
                                  const isEditingQa = editingQaId === qa._id;
                                  const isOwner =
                                    user &&
                                    (qa.createdBy?._id === user._id || qa.createdBy === user._id);

                                  return (
                                    <div
                                      key={qa._id}
                                      className={`border rounded-xl transition-all duration-200 ${
                                        isOpen
                                          ? 'border-zinc-800 bg-zinc-900/20'
                                          : 'border-zinc-900 bg-zinc-950'
                                      }`}
                                    >
                                      {isEditingQa ? (
                                        /* ── Edit Form ── */
                                        <div className="p-5 space-y-4">
                                          <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Question</label>
                                            <input
                                              type="text"
                                              value={qaQuestion}
                                              onChange={(e) => setQaQuestion(e.target.value)}
                                              className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-xs text-white outline-none focus:border-zinc-700"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Answer (Markdown)</label>
                                            <textarea
                                              value={qaAnswer}
                                              onChange={(e) => setQaAnswer(e.target.value)}
                                              rows={4}
                                              className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-xs text-white outline-none resize-none font-mono focus:border-zinc-700"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <label className="text-[9px] text-zinc-400 font-bold uppercase">Tags</label>
                                              <input
                                                type="text"
                                                value={qaTags}
                                                onChange={(e) => setQaTags(e.target.value)}
                                                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2 text-xs text-white outline-none focus:border-zinc-700"
                                                placeholder="tag1, tag2"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[9px] text-zinc-400 font-bold uppercase">Order</label>
                                              <input
                                                type="number"
                                                value={qaOrder}
                                                onChange={(e) => setQaOrder(parseInt(e.target.value) || 0)}
                                                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2 text-xs text-white outline-none focus:border-zinc-700"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2 justify-end">
                                            <button
                                              onClick={() => handleUpdateQa(qa._id, subtopic._id)}
                                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition"
                                            >
                                              <Save size={12} />
                                              <span>Save</span>
                                            </button>
                                            <button
                                              onClick={() => setEditingQaId(null)}
                                              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer transition"
                                            >
                                              <X size={12} />
                                              <span>Cancel</span>
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          {/* Accordion trigger */}
                                          <div
                                            onClick={() =>
                                              setOpenQas((prev) => ({ ...prev, [qa._id]: !prev[qa._id] }))
                                            }
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/10 transition rounded-xl"
                                          >
                                            <div className="flex items-center gap-3 pr-3 min-w-0">
                                              <span className="text-zinc-600 font-bold text-[10px] flex-shrink-0">
                                                Q{qIndex + 1}.
                                              </span>
                                              <span className="text-sm font-semibold text-zinc-200 truncate">
                                                {qa.question}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                              {/* Tags */}
                                              {qa.tags &&
                                                qa.tags.slice(0, 2).map((t, ti) => (
                                                  <span
                                                    key={ti}
                                                    className="hidden sm:inline bg-zinc-900 text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                                                  >
                                                    {t}
                                                  </span>
                                                ))}

                                              {/* Copy */}
                                              <button
                                                onClick={(e) => handleCopyAnswer(e, qa._id, qa.answer)}
                                                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white transition cursor-pointer"
                                              >
                                                {copiedQaId === qa._id ? (
                                                  <Check size={12} className="text-emerald-400" />
                                                ) : (
                                                  <Copy size={12} />
                                                )}
                                              </button>

                                              {/* Edit / Delete (owner only) */}
                                              {isOwner && (
                                                <div
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="flex items-center gap-0.5"
                                                >
                                                  <button
                                                    onClick={() => handleStartEditQa(qa)}
                                                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-indigo-400 transition cursor-pointer"
                                                  >
                                                    <Edit size={12} />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteQa(qa._id, subtopic._id)}
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

                                          {/* Accordion answer body */}
                                          {isOpen && (
                                            <div className="px-5 pb-5 pt-1 border-t border-zinc-900/50 bg-zinc-950/30 rounded-b-xl">
                                              <div className="pl-6 border-l-2 border-zinc-800 text-xs mt-3">
                                                <MarkdownRenderer content={qa.answer} />
                                              </div>
                                              {qa.tags && qa.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-zinc-900/40">
                                                  {qa.tags.map((t, ti) => (
                                                    <span
                                                      key={ti}
                                                      className="bg-zinc-900 text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded-md text-[9px]"
                                                    >
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
                        );
                      })}
                    </div>
                  )}

                  {/* Divider between topics */}
                  {topicIndex < filteredTopics.length - 1 && (
                    <div className="border-b border-zinc-900/60 pt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
