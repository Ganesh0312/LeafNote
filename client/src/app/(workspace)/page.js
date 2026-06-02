'use client';

import React, { useState } from 'react';
import { useNotes } from '../../context/NoteContext';
import { useAuth } from '../../context/AuthContext';
import { Search, BookOpen, GraduationCap, ChevronRight, Sparkles, BookMarked, User, Clock } from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceHomePage() {
  const { subjects, loading } = useNotes();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to get first two letters of subject name
  const getSubjectInitials = (name) => {
    if (!name) return 'SB';
    const clean = name.trim();
    if (clean.toLowerCase() === 'javascript') return 'JS';
    if (clean.toLowerCase() === 'node' || clean.toLowerCase() === 'node.js') return 'ND';
    return clean.substring(0, 2).toUpperCase();
  };

  // Helper to style cards based on technology name
  const getSubjectColorStyles = (name) => {
    const n = name.toLowerCase();
    if (n.includes('js') || n.includes('javascript')) {
      return {
        bg: 'from-amber-600/10 to-yellow-600/5 hover:border-yellow-500/30',
        badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        iconGlow: 'bg-yellow-500/5',
      };
    }
    if (n.includes('node')) {
      return {
        bg: 'from-emerald-600/10 to-green-600/5 hover:border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        iconGlow: 'bg-emerald-500/5',
      };
    }
    if (n.includes('react') || n.includes('next')) {
      return {
        bg: 'from-cyan-600/10 to-blue-600/5 hover:border-cyan-500/30',
        badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
        iconGlow: 'bg-cyan-500/5',
      };
    }
    return {
      bg: 'from-indigo-600/10 to-purple-600/5 hover:border-indigo-500/30',
      badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      iconGlow: 'bg-indigo-500/5',
    };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10 space-y-12">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 -z-10 h-80 w-80 rounded-full bg-indigo-650/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 h-80 w-80 rounded-full bg-emerald-650/5 blur-[120px] pointer-events-none" />

      {/* Hero Header Banner */}
      <div className="max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-400 font-semibold">
          <Sparkles size={12} />
          <span>Interactive Study Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">NoteMaker</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          A premium, hierarchical markdown workspace for note-taking. Build structured knowledge trees organized by Subjects, Topics, Subtopics, and Question & Answers (Q&As).
        </p>

        {/* {!user && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <span>Get Started Free</span>
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/login"
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        )} */}
      </div>

      {/* Search Input Banner */}
      {/* <div className="max-w-2xl space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Search Knowledge Base</h2>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-900/30 border border-zinc-900 px-4 py-3 text-zinc-400 focus-within:border-zinc-800 transition">
          <Search size={18} className="text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a subject name or keyword..."
            className="bg-transparent text-sm w-full outline-none border-none text-white placeholder-zinc-650"
          />
        </div>
      </div> */}

      {/* Public Subjects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap size={20} className="text-emerald-400" />
            <span>Explore Subjects & Technologies</span>
          </h2>
          <span className="text-xs text-zinc-500">{filteredSubjects.length} subjects found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-44 bg-zinc-900/40 border border-zinc-900 animate-pulse rounded-2xl"></div>
            <div className="h-44 bg-zinc-900/40 border border-zinc-900 animate-pulse rounded-2xl"></div>
            <div className="h-44 bg-zinc-900/40 border border-zinc-900 animate-pulse rounded-2xl"></div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl text-zinc-550 text-xs">
            No subjects matching your search. Create one in the sidebar!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subj) => {
              const styles = getSubjectColorStyles(subj.name);
              const initials = getSubjectInitials(subj.name);
              const isOwner = user && (subj.createdBy?._id === user._id || subj.createdBy === user._id);

              return (
                <Link
                  key={subj._id}
                  href={`/subject/${subj.slug}`}
                  className={`group relative flex flex-col justify-between p-6 rounded-2xl border border-zinc-900 bg-gradient-to-br ${styles.bg} transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1 min-h-[220px]`}
                >
                  <div className="space-y-4">
                    {/* Top row: badge and initials */}
                    <div className="flex items-center justify-between">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm tracking-tight ${styles.badge} shadow-md`}>
                        {initials}
                      </div>
                      {isOwner && (
                        <span className="bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          Owner
                        </span>
                      )}
                    </div>

                    {/* Middle row: title and description */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-zinc-100 group-hover:text-white transition line-clamp-1">
                        {subj.name}
                      </h3>
                      <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition line-clamp-3 leading-relaxed">
                        {subj.description || 'No description available for this subject.'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom row: meta details */}
                  <div className="flex items-center justify-between pt-4 text-[10px] text-zinc-500 font-medium border-t border-zinc-900/60 mt-4">
                    <div className="flex items-center gap-1.5">
                      <User size={10} className="text-zinc-600" />
                      <span>{subj.createdBy?.username || 'System'}</span>
                    </div>
                    <span className="flex items-center gap-0.5 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition duration-200">
                      <span>Explore Topics</span>
                      <ChevronRight size={10} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Resources Section */}
      <div className="bg-gradient-to-r from-zinc-950 to-indigo-950/20 border border-zinc-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-1.5">
            <BookMarked size={16} className="text-indigo-400" />
            <span>Contribute to the Workspace</span>
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Create an account to start compiling notes. Logged-in creators can draft Markdown content, link relevant notes together, and construct useful Q&A flashcards for exam review.
          </p>
        </div>
        {!user && (
          <Link
            href="/register"
            className="flex-shrink-0 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl px-5 py-3 text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-650/10"
          >
            Sign Up Now
          </Link>
        )}
      </div>
    </div>
  );
}
