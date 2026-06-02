'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from './ThemeProvider';
import { BookOpen, LogOut, User as UserIcon, LogIn, UserPlus, Sun, Moon, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isMasterAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-650 shadow-lg shadow-indigo-600/30 text-white">
              <BookOpen size={18} className="stroke-[2.5]" />
            </div>
            <span>
              Note<span className="text-indigo-400">Maker</span>
            </span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 border border-zinc-800 text-sm text-zinc-300 md:flex">
                <UserIcon size={14} className="text-indigo-400" />
                <span className="font-semibold text-zinc-200">{user.username}</span>
                {isMasterAdmin && (
                  <span className="ml-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>
              {isMasterAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600/10 border border-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-600/20 hover:text-amber-300 transition cursor-pointer"
                >
                  <Shield size={14} />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
