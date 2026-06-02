'use client';

import React, { use, useEffect, useState } from 'react';
import { useNotes } from '../../../../../../context/NoteContext';
import { useAuth } from '../../../../../../context/AuthContext';
import { useToast } from '../../../../../../context/ToastContext';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '../../../../../../components/MarkdownRenderer';
import MarkdownEditor from '../../../../../../components/MarkdownEditor';
import TableOfContents from '../../../../../../components/TableOfContents';
import LoadingSkeleton from '../../../../../../components/LoadingSkeleton';

export default function TopicDetailPage({ params }) {
  const { subjectSlug, topicSlug } = use(params);
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    fetchTopicBySlug,
    createSubtopic,
    updateTopic,
    deleteTopic,
    fetchSubjects,
  } = useNotes();

  const [topic, setTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Topic Content states
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicContent, setTopicContent] = useState('');

  // Add Subtopic states
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [subtopicTitle, setSubtopicTitle] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTopicBySlug(topicSlug);
    if (data) {
      setTopic(data.topic);
      setSubtopics(data.subtopics);
      setTopicTitle(data.topic.title);
      setTopicDesc(data.topic.description || '');
      setTopicContent(data.topic.content || '');
    } else {
      showToast('Topic not found', 'error');
      router.push(`/subject/${subjectSlug}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [topicSlug]);

  if (loading) {
    return <LoadingSkeleton type="workspace" />;
  }

  if (!topic) return null;

  const isOwner = user && (topic.createdBy?._id === user._id || topic.createdBy === user._id);

  const handleUpdateTopic = async () => {
    const res = await updateTopic(topic._id, topic.subject?._id, {
      title: topicTitle,
      description: topicDesc,
      content: topicContent,
    });
    if (res.success) {
      showToast('Topic saved successfully', 'success');
      setIsEditingTopic(false);
      await fetchSubjects();
      loadData();
    } else {
      showToast(res.error || 'Failed to save topic', 'error');
    }
  };

  const handleDeleteTopic = async () => {
    if (!confirm('Are you sure you want to delete this Topic? This will delete ALL subtopics and Q&As inside it.')) return;
    const res = await deleteTopic(topic._id, topic.subject?._id);
    if (res.success) {
      showToast('Topic deleted successfully', 'success');
      await fetchSubjects();
      router.push(`/subject/${subjectSlug}`);
    } else {
      showToast(res.error || 'Failed to delete topic', 'error');
    }
  };

  const handleCreateSubtopic = async (e) => {
    e.preventDefault();
    if (!subtopicTitle.trim()) return;

    const res = await createSubtopic(subtopicTitle, topic._id, '', subtopics.length);
    if (res.success) {
      showToast('Subtopic created successfully', 'success');
      setShowAddSubtopic(false);
      setSubtopicTitle('');
      loadData();
    } else {
      showToast(res.error || 'Failed to create subtopic', 'error');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Scrollable workspace content */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10 flex flex-col h-[calc(100vh-4rem)]">
        <div className="max-w-4xl w-full mx-auto space-y-8 flex-1 pb-16">
          
          {/* Breadcrumb / Back button */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <Link
              href={`/subject/${subjectSlug}`}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to {topic.subject?.name}</span>
            </Link>

            {isOwner && !isEditingTopic && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingTopic(true)}
                  className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer font-semibold"
                >
                  <Edit size={12} className="text-indigo-400" />
                  <span>Edit Topic</span>
                </button>
                <button
                  onClick={handleDeleteTopic}
                  className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer font-semibold"
                >
                  <Trash2 size={12} className="text-red-400" />
                  <span>Delete Topic</span>
                </button>
              </div>
            )}
          </div>

          {/* Topic Detail Header */}
          {isEditingTopic ? (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Edit Topic Details</h3>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Topic Title</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Topic Description</label>
                <input
                  type="text"
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <FileText size={22} className="text-indigo-400" />
                <span>{topic.title}</span>
              </h1>
              {topic.description && (
                <p className="text-sm text-zinc-400 max-w-2xl">{topic.description}</p>
              )}
            </div>
          )}

          {/* Topic Markdown Notes content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Topic Notes</h2>
              {isEditingTopic && (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateTopic}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-505 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    <Save size={12} />
                    <span>Save Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTopic(false);
                      setTopicTitle(topic.title);
                      setTopicDesc(topic.description || '');
                      setTopicContent(topic.content || '');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    <X size={12} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingTopic ? (
              <div className="h-[400px]">
                <MarkdownEditor value={topicContent} onChange={setTopicContent} />
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-zinc-900/80 rounded-xl p-5 min-h-[100px]">
                <MarkdownRenderer content={topicContent} placeholder="_No notes added to this topic yet. Click 'Edit Topic' above to add some._" />
              </div>
            )}
          </div>

          {/* Subtopics lists */}
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Subtopic Notes Tree</h2>
              {isOwner && !showAddSubtopic && (
                <button
                  onClick={() => setShowAddSubtopic(true)}
                  className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer font-semibold"
                >
                  <Plus size={14} className="text-emerald-400" />
                  <span>Add Subtopic</span>
                </button>
              )}
            </div>

            {/* Add Subtopic Form */}
            {showAddSubtopic && (
              <form onSubmit={handleCreateSubtopic} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                  <span className="text-xs font-bold text-emerald-400">New Subtopic Card</span>
                  <button type="button" onClick={() => setShowAddSubtopic(false)} className="text-zinc-550 hover:text-white"><X size={14} /></button>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Subtopic Title</label>
                  <input
                    type="text"
                    value={subtopicTitle}
                    onChange={(e) => setSubtopicTitle(e.target.value)}
                    placeholder="E.g. Derivatives, Integration rules, SQL Indexes..."
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                    required
                  />
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-xs font-semibold cursor-pointer">
                  <Plus size={14} />
                  <span>Add Subtopic</span>
                </button>
              </form>
            )}

            {subtopics.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl text-zinc-550 text-xs">
                No subtopics created for this topic yet.
              </div>
            ) : (
              <div className="space-y-2">
                {subtopics.map((st) => (
                  <Link
                    key={st._id}
                    href={`/subject/${subjectSlug}/topic/${topicSlug}/subtopic/${st.slug}`}
                    className="group flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/20 hover:border-zinc-800 transition duration-200 cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition">{st.title}</span>
                    <span className="text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition duration-200">
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Table of Contents Sidebar */}
      <TableOfContents content={topicContent} />
    </div>
  );
}
