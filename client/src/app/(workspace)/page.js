'use client';

import React, { useState } from 'react';
import { useNotes } from '../../context/NoteContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  GraduationCap,
  ChevronRight,
  Sparkles,
  BookMarked,
  User,
  MessageCircleQuestion,
  Layers,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceHomePage() {
  const { subjects, loading } = useNotes();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.description &&
        subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSubjectInitials = (name) => {
    if (!name) return 'SB';
    const clean = name.trim();
    if (clean.toLowerCase() === 'javascript') return 'JS';
    if (clean.toLowerCase() === 'node' || clean.toLowerCase() === 'node.js') return 'ND';
    return clean.substring(0, 2).toUpperCase();
  };

  const getSubjectColorStyles = (name) => {
    const n = name.toLowerCase();
    if (n.includes('js') || n.includes('javascript')) {
      return {
        bg: 'from-amber-600/10 to-yellow-600/5 hover:border-yellow-500/30',
        badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        topicsBtn: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
        questionsBtn: 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800',
      };
    }
    if (n.includes('node')) {
      return {
        bg: 'from-emerald-600/10 to-green-600/5 hover:border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        topicsBtn: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
        questionsBtn: 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800',
      };
    }
    if (n.includes('react') || n.includes('next')) {
      return {
        bg: 'from-cyan-600/10 to-blue-600/5 hover:border-cyan-500/30',
        badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
        topicsBtn: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20',
        questionsBtn: 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800',
      };
    }
    return {
      bg: 'from-indigo-600/10 to-purple-600/5 hover:border-indigo-500/30',
      badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      topicsBtn: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20',
      questionsBtn: 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800',
    };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 sm:p-6 lg:p-10 space-y-8 sm:space-y-12">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 -z-10 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-indigo-650/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-emerald-650/5 blur-[120px] pointer-events-none" />

      {/* Hero Header Banner */}
      <div className="max-w-4xl space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-400 font-semibold">
          <Sparkles size={12} />
          <span>Interactive Study Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Welcome to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            NoteMaker
          </span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
          A premium, hierarchical markdown workspace. Organize knowledge by Subjects → Topics → Subtopics → Q&amp;As.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2.5 focus-within:border-zinc-700 transition">
          <Search size={14} className="text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects..."
            className="bg-transparent text-xs w-full outline-none border-none text-white placeholder-zinc-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white cursor-pointer flex-shrink-0">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Public Subjects Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap size={18} className="text-emerald-400 flex-shrink-0" />
            <span>Explore Subjects &amp; Technologies</span>
          </h2>
          <span className="text-xs text-zinc-500 flex-shrink-0">{filteredSubjects.length} subjects</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-zinc-900/40 border border-zinc-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl text-zinc-500 text-xs">
            No subjects matching your search. Create one in the sidebar!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredSubjects.map((subj) => {
              const styles = getSubjectColorStyles(subj.name);
              const initials = getSubjectInitials(subj.name);
              const isOwner =
                user && (subj.createdBy?._id === user._id || subj.createdBy === user._id);

              return (
                <div
                  key={subj._id}
                  className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-zinc-900 bg-gradient-to-br ${styles.bg} transition-all duration-300 shadow-xl hover:-translate-y-1 min-h-[220px]`}
                >
                  {/* Top section — clickable to subject */}
                  <Link href={`/subject/${subj.slug}`} className="flex flex-col gap-4 flex-1">
                    {/* Top row: badge and owner chip */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center font-black text-sm tracking-tight ${styles.badge} shadow-md`}
                      >
                        {initials}
                      </div>
                      {isOwner && (
                        <span className="bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          Owner
                        </span>
                      )}
                    </div>

                    {/* Title and description */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm sm:text-base text-zinc-100 group-hover:text-white transition line-clamp-1">
                        {subj.name}
                      </h3>
                      <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition line-clamp-2 leading-relaxed">
                        {subj.description || 'No description available for this subject.'}
                      </p>
                    </div>
                  </Link>

                  {/* Bottom row: meta + quick-action buttons */}
                  <div className="mt-4 pt-4 border-t border-zinc-900/60 space-y-3">
                    {/* Creator row */}
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                      <User size={10} className="text-zinc-600" />
                      <span>{subj.createdBy?.username || 'System'}</span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/subject/${subj.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer ${styles.topicsBtn}`}
                      >
                        <Layers size={12} />
                        <span>Topics</span>
                      </Link>
                      <Link
                        href={`/subject/${subj.slug}/questions`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer ${styles.questionsBtn}`}
                      >
                        <MessageCircleQuestion size={12} />
                        <span>Questions</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Resources Section */}
      <div className="bg-gradient-to-r from-zinc-950 to-indigo-950/20 border border-zinc-900 rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <BookMarked size={16} className="text-indigo-400 flex-shrink-0" />
            <span>Contribute to the Workspace</span>
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Create an account to start compiling notes. Draft Markdown content, link relevant notes, and build Q&amp;A flashcards for exam review.
          </p>
        </div>
        {!user && (
          <Link
            href="/register"
            className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/20 w-full sm:w-auto text-center"
          >
            Sign Up Now
          </Link>
        )}
      </div>
    </div>
  );
}
