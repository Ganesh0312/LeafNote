'use client';

import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Book,
  File,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  BookOpen,
  Home,
} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const {
    subjects,
    topics,
    subtopics,
    fetchTopics,
    fetchSubtopics,
    fetchSubjectBySlug,
    createTopic,
    updateTopic,
    deleteTopic,
    createSubtopic,
    deleteSubtopic,
    updateSubtopic,
    fetchSubjects,
  } = useNotes();

  // Extract slugs from URL: /subject/[subjectSlug]/topic/[topicSlug]/subtopic/[subtopicSlug]
  const parts = pathname.split('/').filter(Boolean);
  const subjectSlug = parts[1]; // e.g. 'javascript'
  const topicSlug = parts[3];   // e.g. 'scope-and-closures'
  const subtopicSlug = parts[5]; // e.g. 'lexical-scope-mechanics'

  // Active subject derived from global subjects list
  const activeSubject = subjects.find((s) => s.slug === subjectSlug) || null;

  // Topic accordion open state
  const [openTopics, setOpenTopics] = useState({});

  // Inline forms state
  const [activeForm, setActiveForm] = useState(null);
  const [formVal, setFormVal] = useState('');

  // When subject changes, fetch its topics and auto-open the active topic
  useEffect(() => {
    if (activeSubject?._id) {
      fetchTopics(activeSubject._id);
    }
  }, [activeSubject?._id]);

  // Auto-open the active topic and fetch its subtopics
  useEffect(() => {
    if (!activeSubject?._id) return;
    const subjTopics = topics[activeSubject._id] || [];
    if (topicSlug && subjTopics.length > 0) {
      const activeTopic = subjTopics.find((t) => t.slug === topicSlug);
      if (activeTopic) {
        setOpenTopics((prev) => ({ ...prev, [activeTopic._id]: true }));
        if (!subtopics[activeTopic._id]) {
          fetchSubtopics(activeTopic._id);
        }
      }
    }
  }, [topics, topicSlug, activeSubject?._id]);

  const toggleTopic = (topic) => {
    const isOpen = !openTopics[topic._id];
    setOpenTopics((prev) => ({ ...prev, [topic._id]: isOpen }));
    if (isOpen && !subtopics[topic._id]) {
      fetchSubtopics(topic._id);
    }
    router.push(`/subject/${subjectSlug}/topic/${topic.slug}`);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formVal.trim()) return;

    let res;
    if (activeForm.type === 'add-topic') {
      const subjTopics = topics[activeSubject._id] || [];
      res = await createTopic(formVal, activeSubject._id, '', '', subjTopics.length);
    } else if (activeForm.type === 'add-subtopic') {
      const topicSubtopics = subtopics[activeForm.id] || [];
      res = await createSubtopic(formVal, activeForm.id, '', topicSubtopics.length);
      setOpenTopics((prev) => ({ ...prev, [activeForm.id]: true }));
    } else if (activeForm.type === 'edit-topic') {
      const topic = (topics[activeSubject._id] || []).find((t) => t._id === activeForm.id);
      res = await updateTopic(activeForm.id, activeSubject._id, { title: formVal });
    } else if (activeForm.type === 'edit-subtopic') {
      const subtopic = Object.values(subtopics).flat().find((st) => st._id === activeForm.id);
      res = await updateSubtopic(activeForm.id, subtopic?.topic, { title: formVal });
    }

    if (res?.success) {
      setActiveForm(null);
      setFormVal('');
      await fetchSubjects();
      if (activeSubject?._id) fetchTopics(activeSubject._id);
    }
  };

  const handleCancelForm = () => {
    setActiveForm(null);
    setFormVal('');
  };

  const startForm = (type, id, initialVal = '') => {
    setActiveForm({ type, id });
    setFormVal(initialVal);
  };

  const isOwner = (item) => {
    if (!user || !item) return false;
    const creatorId = item.createdBy?._id || item.createdBy;
    return creatorId === user._id;
  };

  if (!activeSubject) return null;

  const subjTopics = topics[activeSubject._id] || [];

  return (
    <aside className="w-72 flex-shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col h-[calc(100vh-4rem)]">
      {/* Sidebar Header — Subject Name */}
      <div className="p-4 border-b border-zinc-900 space-y-2">
        {/* Back to Home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition font-semibold"
        >
          <Home size={11} />
          <span>All Subjects</span>
        </Link>

        {/* Active Subject Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
              <BookOpen size={13} className="text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-white truncate">{activeSubject.name}</span>
          </div>

          {/* Add Topic button */}
          {user && isOwner(activeSubject) && (
            <button
              onClick={() => startForm('add-topic', activeSubject._id)}
              title="Add Topic"
              className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-indigo-400 transition cursor-pointer"
            >
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Topic & Subtopic Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 select-none">

        {/* Inline Add Topic Form */}
        {activeForm?.type === 'add-topic' && (
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-2 mb-2">
            <input
              type="text"
              value={formVal}
              onChange={(e) => setFormVal(e.target.value)}
              placeholder="New topic title..."
              className="w-full text-xs bg-transparent outline-none text-white placeholder-zinc-500"
              autoFocus
            />
            <button type="submit" className="p-0.5 text-green-400 cursor-pointer hover:text-green-300"><Check size={13} /></button>
            <button type="button" onClick={handleCancelForm} className="p-0.5 text-red-400 cursor-pointer hover:text-red-300"><X size={13} /></button>
          </form>
        )}

        {subjTopics.length === 0 && !activeForm && (
          <div className="text-zinc-600 text-[10px] text-center py-6">
            No topics yet.{user ? ' Click + to add one.' : ''}
          </div>
        )}

        {/* Topics List */}
        {subjTopics.map((topic) => {
          const isTopicOpen = openTopics[topic._id];
          const topicSubtopics = subtopics[topic._id] || [];
          const isActiveTopic = topic.slug === topicSlug;
          const isEditingTopic = activeForm?.type === 'edit-topic' && activeForm.id === topic._id;

          return (
            <div key={topic._id}>
              {/* Topic Row */}
              {isEditingTopic ? (
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 mb-1">
                  <input
                    type="text"
                    value={formVal}
                    onChange={(e) => setFormVal(e.target.value)}
                    className="w-full text-xs bg-transparent outline-none text-white"
                    autoFocus
                  />
                  <button type="submit" className="p-0.5 text-green-400 cursor-pointer"><Check size={12} /></button>
                  <button type="button" onClick={handleCancelForm} className="p-0.5 text-red-400 cursor-pointer"><X size={12} /></button>
                </form>
              ) : (
                <div
                  className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-all ${
                    isActiveTopic
                      ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-900/50'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white border border-transparent'
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-zinc-600 flex-shrink-0">
                      {isTopicOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    </span>
                    <Book size={12} className={isActiveTopic ? 'text-indigo-400' : 'text-emerald-500'} />
                    <span className="truncate font-medium">{topic.title}</span>
                  </div>

                  {/* Topic Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0 pl-1">
                    {user && isOwner(activeSubject) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startForm('add-subtopic', topic._id); }}
                        title="Add Note"
                        className="p-0.5 rounded hover:text-indigo-400 text-zinc-600 cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    )}
                    {isOwner(topic) && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); startForm('edit-topic', topic._id, topic.title); }}
                          title="Rename"
                          className="p-0.5 rounded hover:text-indigo-400 text-zinc-600 cursor-pointer"
                        >
                          <Edit size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this topic?')) deleteTopic(topic._id, activeSubject._id);
                          }}
                          title="Delete"
                          className="p-0.5 rounded hover:text-red-400 text-zinc-600 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Subtopics Container */}
              {isTopicOpen && (
                <div className="ml-5 pl-3 border-l border-zinc-900 mt-0.5 mb-1 space-y-0.5">
                  {/* Inline Add Subtopic */}
                  {activeForm?.type === 'add-subtopic' && activeForm.id === topic._id && (
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 my-1">
                      <input
                        type="text"
                        value={formVal}
                        onChange={(e) => setFormVal(e.target.value)}
                        placeholder="Note title..."
                        className="w-full text-[11px] bg-transparent outline-none text-white placeholder-zinc-500"
                        autoFocus
                      />
                      <button type="submit" className="p-0.5 text-green-400 cursor-pointer"><Check size={11} /></button>
                      <button type="button" onClick={handleCancelForm} className="p-0.5 text-red-400 cursor-pointer"><X size={11} /></button>
                    </form>
                  )}

                  {topicSubtopics.length === 0 && activeForm?.id !== topic._id && (
                    <div className="text-[10px] text-zinc-700 py-1 pl-1">No notes yet</div>
                  )}

                  {/* Subtopics List */}
                  {topicSubtopics.map((subt) => {
                    const isActiveSubt = subt.slug === subtopicSlug;
                    const isEditingSubt = activeForm?.type === 'edit-subtopic' && activeForm.id === subt._id;

                    return (
                      <div key={subt._id}>
                        {isEditingSubt ? (
                          <form onSubmit={handleFormSubmit} className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-1 my-0.5">
                            <input
                              type="text"
                              value={formVal}
                              onChange={(e) => setFormVal(e.target.value)}
                              className="w-full text-[10px] bg-transparent outline-none text-white"
                              autoFocus
                            />
                            <button type="submit" className="text-green-400 cursor-pointer"><Check size={10} /></button>
                            <button type="button" onClick={handleCancelForm} className="text-red-400 cursor-pointer"><X size={10} /></button>
                          </form>
                        ) : (
                          <div
                            className={`group flex items-center justify-between rounded px-2 py-1 text-[11px] cursor-pointer transition-all ${
                              isActiveSubt
                                ? 'bg-indigo-900/30 text-indigo-300 font-semibold'
                                : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-white'
                            }`}
                            onClick={() =>
                              router.push(`/subject/${subjectSlug}/topic/${topic.slug}/subtopic/${subt.slug}`)
                            }
                          >
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <File size={11} className={isActiveSubt ? 'text-indigo-400' : 'text-zinc-600'} />
                              <span className="truncate">{subt.title}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
                              {isOwner(subt) && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); startForm('edit-subtopic', subt._id, subt.title); }}
                                    className="p-0.5 hover:text-indigo-400 text-zinc-600 cursor-pointer"
                                  >
                                    <Edit size={10} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Delete this note?')) deleteSubtopic(subt._id, topic._id);
                                    }}
                                    className="p-0.5 hover:text-red-400 text-zinc-600 cursor-pointer"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
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
    </aside>
  );
}
