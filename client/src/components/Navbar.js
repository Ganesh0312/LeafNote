'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from './ThemeProvider';
import {
  BookOpen,
  LogOut,
  User as UserIcon,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Shield,
  Menu,
} from 'lucide-react';

export default function Navbar({ onMenuToggle, showMenuBtn = false }) {
  const { user, logout, isMasterAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">

        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger — only shown when sidebar exists */}
          {showMenuBtn && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu size={16} />
            </button>
          )}

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-white transition hover:opacity-90 min-w-0"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/30 text-white">
              <BookOpen size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-base sm:text-xl hidden xs:block">
              Note<span className="text-indigo-400">Maker</span>
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Username pill — desktop only */}
              <div className="hidden md:flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 border border-zinc-800 text-sm text-zinc-300">
                <UserIcon size={13} className="text-indigo-400" />
                <span className="font-semibold text-zinc-200 text-xs sm:text-sm">{user.username}</span>
                {isMasterAdmin && (
                  <span className="ml-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>

              {/* Admin Panel link */}
              {isMasterAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600/10 border border-amber-500/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-amber-400 hover:bg-amber-600/20 hover:text-amber-300 transition cursor-pointer"
                >
                  <Shield size={13} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <UserPlus size={14} />
                <span className="hidden xs:inline">Start</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
