'use client';

import React, { use, useEffect, useState } from 'react';
import { useNotes } from '../../../../context/NoteContext';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { useRouter } from 'next/navigation';
import { BookOpen, Edit, Trash2, Plus, ArrowRight, Loader, Info, HelpCircle, GraduationCap, X } from 'lucide-react';
import Link from 'next/link';
import LoadingSkeleton from '../../../../components/LoadingSkeleton';

export default function SubjectDetailPage({ params }) {
  const { subjectSlug } = use(params);
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    fetchSubjectBySlug,
    createTopic,
    updateSubject,
    deleteSubject,
    fetchSubjects,
  } = useNotes();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Subject state
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

  // Add Topic state
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSubjectBySlug(subjectSlug);
    if (data) {
      setSubject(data.subject);
      setTopics(data.topics);
      setSubjectName(data.subject.name);
      setSubjectDesc(data.subject.description || '');
    } else {
      showToast('Subject not found', 'error');
      router.push('/');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [subjectSlug]);

  if (loading) {
    return <LoadingSkeleton type="workspace" />;
  }

  if (!subject) return null;

  const canCreate = hasPermission('create');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    const res = await updateSubject(subject._id, subjectName, subjectDesc, subject.isPublic);
    if (res.success) {
      showToast('Subject updated successfully', 'success');
      setIsEditingSubject(false);
      // Reload slugs might have changed, redirect to new slug if name changed
      await fetchSubjects();
      loadData();
    } else {
      showToast(res.error || 'Failed to update subject', 'error');
    }
  };

  const handleDeleteSubject = async () => {
    if (!confirm('Are you sure you want to delete this Subject? This will delete ALL topics, subtopics, and Q&As inside it. This action CANNOT be undone.')) {
      return;
    }
    const res = await deleteSubject(subject._id);
    if (res.success) {
      showToast('Subject and all sub-entities deleted', 'success');
      await fetchSubjects();
      router.push('/');
    } else {
      showToast(res.error || 'Failed to delete subject', 'error');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;

    const res = await createTopic(topicTitle, subject._id, topicDesc, '', topics.length);
    if (res.success) {
      showToast('Topic created successfully', 'success');
      setShowAddTopic(false);
      setTopicTitle('');
      setTopicDesc('');
      loadData();
    } else {
      showToast(res.error || 'Failed to create topic', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10 flex flex-col h-[calc(100vh-4rem)]">
      {/* Subject Header */}
      <div className="max-w-4xl w-full mx-auto space-y-6 flex-1">

        {/* Actions bar */}
        {(canUpdate || canDelete) && (
          <div className="flex items-center justify-end gap-2 border-b border-zinc-900 pb-3">
            <button
              onClick={() => setIsEditingSubject(!isEditingSubject)}
              className="flex items-center gap-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer font-semibold"
            >
              <Edit size={12} className="text-indigo-400" />
              <span>Edit Subject</span>
            </button>
            <button
              onClick={handleDeleteSubject}
              className="flex items-center gap-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer font-semibold"
            >
              <Trash2 size={12} className="text-red-400" />
              <span>Delete Subject</span>
            </button>
          </div>
        )}

        {/* Edit Form */}
        {isEditingSubject ? (
          <form onSubmit={handleUpdateSubject} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Edit Subject Details</h3>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Subject Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Description</label>
              <textarea
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none resize-none focus:border-zinc-700"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer">Save Changes</button>
              <button type="button" onClick={() => setIsEditingSubject(false)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-400" />
              <span>{subject.name}</span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
              {subject.description || 'No description available for this subject.'}
            </p>
          </div>
        )}

        {/* Topics List Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pt-6 pb-2">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <GraduationCap size={18} className="text-emerald-400" />
            <span>Topics under Subject</span>
          </h2>
          {canCreate && !showAddTopic && (
            <button
              onClick={() => setShowAddTopic(true)}
              className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer font-semibold"
            >
              <Plus size={14} className="text-emerald-400" />
              <span>Add Topic</span>
            </button>
          )}
        </div>

        {/* Add Topic Form */}
        {showAddTopic && (
          <form onSubmit={handleCreateTopic} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
              <span className="text-xs font-bold text-emerald-400">New Topic Card</span>
              <button type="button" onClick={() => setShowAddTopic(false)} className="text-zinc-550 hover:text-white"><X size={14} /></button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Topic Title</label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="Calculus, Mechanics, Database Systems..."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Short Description</label>
              <textarea
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                placeholder="What is this topic about?"
                rows={2}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none resize-none focus:border-zinc-700"
              />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2.5 text-xs font-semibold cursor-pointer">
              <Plus size={14} />
              <span>Create Topic</span>
            </button>
          </form>
        )}

        {/* Topics grid list */}
        {topics.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl text-zinc-550 text-xs">
            No topics added to this subject yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((t) => (
              <Link
                key={t._id}
                href={`/subject/${subjectSlug}/topic/${t.slug}`}
                className="group p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/25 hover:border-zinc-800 transition-all duration-300 flex justify-between items-center cursor-pointer"
              >
                <div className="space-y-1.5 pr-4">
                  <h3 className="font-bold text-sm text-zinc-200 group-hover:text-white transition line-clamp-1">{t.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{t.description || 'No description available for this topic.'}</p>
                </div>
                <span className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 group-hover:bg-indigo-650 group-hover:border-indigo-600 text-zinc-500 group-hover:text-white transition duration-300">
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
