'use client';

import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import { useAuth } from '../context/AuthContext';
import {
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownEditor from './MarkdownEditor';

export default function Workspace() {
  const { user } = useAuth();
  const { selectedSubtopic, updateSubtopic } = useNotes();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  // Q&A States
  const [openQas, setOpenQas] = useState({});
  const [editingQaId, setEditingQaId] = useState(null);
  const [showAddQa, setShowAddQa] = useState(false);

  // Q&A Form inputs
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');

  // Sync state with selected subtopic changes
  useEffect(() => {
    if (selectedSubtopic) {
      setNoteContent(selectedSubtopic.content || '');
      setIsEditingNote(false);
      setOpenQas({});
      setEditingQaId(null);
      setShowAddQa(false);
    }
  }, [selectedSubtopic]);

  if (!selectedSubtopic) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900/10 text-center">
        <div className="max-w-md space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 mx-auto border border-indigo-900 shadow-xl">
            <HelpCircle size={28} />
          </div>
          <h3 className="text-xl font-bold text-white">Select a note to start reading</h3>
          <p className="text-sm text-zinc-400">
            Expand the Subjects and Topics in the sidebar on the left and select a subtopic note. Or, register to start creating your own notes.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = selectedSubtopic.createdBy?._id === user?._id || selectedSubtopic.createdBy === user?._id;

  const handleSaveNote = async () => {
    const res = await updateSubtopic(selectedSubtopic._id, selectedSubtopic.topic?._id, {
      content: noteContent,
    });
    if (res.success) {
      setIsEditingNote(false);
    } else {
      alert(res.error || 'Failed to save note');
    }
  };

  const toggleQa = (qaId) => {
    setOpenQas((prev) => ({ ...prev, [qaId]: !prev[qaId] }));
  };

  // Q&A CRUD operations (saves directly to the Subtopic document)
  const handleAddQa = async (e) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;

    const newQa = { question: qaQuestion, answer: qaAnswer };
    const updatedQas = [...(selectedSubtopic.qas || []), newQa];

    const res = await updateSubtopic(selectedSubtopic._id, selectedSubtopic.topic?._id, {
      qas: updatedQas,
    });

    if (res.success) {
      setShowAddQa(false);
      setQaQuestion('');
      setQaAnswer('');
    } else {
      alert(res.error || 'Failed to add Q&A');
    }
  };

  const handleStartEditQa = (qa) => {
    setEditingQaId(qa._id);
    setQaQuestion(qa.question);
    setQaAnswer(qa.answer);
  };

  const handleSaveEditQa = async (qaId) => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;

    const updatedQas = (selectedSubtopic.qas || []).map((qa) =>
      qa._id === qaId ? { ...qa, question: qaQuestion, answer: qaAnswer } : qa
    );

    const res = await updateSubtopic(selectedSubtopic._id, selectedSubtopic.topic?._id, {
      qas: updatedQas,
    });

    if (res.success) {
      setEditingQaId(null);
      setQaQuestion('');
      setQaAnswer('');
    } else {
      alert(res.error || 'Failed to update Q&A');
    }
  };

  const handleDeleteQa = async (qaId) => {
    if (!confirm('Are you sure you want to delete this Q&A?')) return;

    const updatedQas = (selectedSubtopic.qas || []).filter((qa) => qa._id !== qaId);

    const res = await updateSubtopic(selectedSubtopic._id, selectedSubtopic.topic?._id, {
      qas: updatedQas,
    });

    if (!res.success) {
      alert(res.error || 'Failed to delete Q&A');
    }
  };

  const subject = selectedSubtopic.topic?.subject;
  const topic = selectedSubtopic.topic;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 flex flex-col h-[calc(100vh-4rem)]">
      {/* Workspace Header */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <span className="hover:text-zinc-350">{subject?.name || 'Subject'}</span>
          <ArrowRight size={10} className="text-zinc-650" />
          <span className="hover:text-zinc-350">{topic?.name || 'Topic'}</span>
          <ArrowRight size={10} className="text-zinc-650" />
          <span className="text-zinc-300 font-semibold">{selectedSubtopic.name}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              {isEditingNote ? (
                <>
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Note</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNote(false);
                      setNoteContent(selectedSubtopic.content || '');
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition cursor-pointer"
                >
                  <Edit size={14} className="text-indigo-400" />
                  <span>Edit Note</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 p-6 space-y-8 max-w-4xl w-full mx-auto">
        {/* Creator Info Banner */}
        <div className="text-xs text-zinc-500 flex items-center gap-1 border-b border-zinc-900 pb-2">
          <span>Created by:</span>
          <span className="text-zinc-400 font-semibold">{selectedSubtopic.createdBy?.username || 'Unknown'}</span>
          <span>•</span>
          <span>Last updated:</span>
          <span className="text-zinc-400 font-semibold">{new Date(selectedSubtopic.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Notes Content Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-400" />
            <span>Notes Markdown</span>
          </h2>

          {isEditingNote ? (
            <div className="h-[450px]">
              <MarkdownEditor value={noteContent} onChange={setNoteContent} />
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-6 min-h-[150px]">
              <MarkdownRenderer content={selectedSubtopic.content} />
            </div>
          )}
        </section>

        {/* Q&A Section */}
        <section className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle size={18} className="text-emerald-400" />
              <span>Questions & Answers</span>
            </h2>
            {isOwner && !showAddQa && (
              <button
                onClick={() => setShowAddQa(true)}
                className="flex items-center gap-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <Plus size={14} className="text-emerald-400" />
                <span>Add Q&A</span>
              </button>
            )}
          </div>

          {/* Add Q&A Form */}
          {showAddQa && (
            <form onSubmit={handleAddQa} className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <span className="text-xs font-semibold text-emerald-400">New Q&A Card</span>
                <button
                  type="button"
                  onClick={() => setShowAddQa(false)}
                  className="p-1 hover:text-white text-zinc-500 rounded transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Question</label>
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="What is the concept?"
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none focus:border-zinc-700 placeholder-zinc-650"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Answer (Supports Markdown)</label>
                <textarea
                  value={qaAnswer}
                  onChange={(e) => setQaAnswer(e.target.value)}
                  placeholder="Explain with concepts and examples..."
                  rows={4}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2.5 text-sm text-white outline-none resize-none focus:border-zinc-700 placeholder-zinc-650 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-xs font-semibold shadow-lg shadow-emerald-600/10 transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Card</span>
              </button>
            </form>
          )}

          {/* Q&A Cards Accordion */}
          {(!selectedSubtopic.qas || selectedSubtopic.qas.length === 0) ? (
            <div className="text-center py-8 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-xl text-zinc-550 text-xs">
              No Q&As added for this note yet.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedSubtopic.qas.map((qa, index) => {
                const isOpen = openQas[qa._id];
                const isEditingQa = editingQaId === qa._id;

                return (
                  <div
                    key={qa._id}
                    className={`border rounded-xl transition-all ${
                      isOpen ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-900 bg-zinc-950'
                    }`}
                  >
                    {isEditingQa ? (
                      <div className="p-4 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase">Question</label>
                          <input
                            type="text"
                            value={qaQuestion}
                            onChange={(e) => setQaQuestion(e.target.value)}
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase">Answer (Markdown)</label>
                          <textarea
                            value={qaAnswer}
                            onChange={(e) => setQaAnswer(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-850 p-2 text-xs text-white outline-none resize-none font-mono"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveEditQa(qa._id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <Save size={12} />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingQaId(null)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-855 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                          >
                            <X size={12} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Accordion Question Row */}
                        <div
                          onClick={() => toggleQa(qa._id)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/20 transition rounded-t-xl"
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <span className="text-zinc-600 font-bold text-xs">Q{index + 1}.</span>
                            <span className="text-sm font-semibold text-zinc-200">{qa.question}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {isOwner && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 mr-2"
                              >
                                <button
                                  onClick={() => handleStartEditQa(qa)}
                                  className="p-1 text-zinc-500 hover:text-indigo-400 rounded transition cursor-pointer"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteQa(qa._id)}
                                  className="p-1 text-zinc-500 hover:text-red-400 rounded transition cursor-pointer"
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

                        {/* Accordion Answer Content */}
                        {isOpen && (
                          <div className="p-4 border-t border-zinc-900/80 bg-zinc-950/40 text-xs">
                            <div className="pl-6 border-l border-zinc-850">
                              <MarkdownRenderer content={qa.answer} />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
