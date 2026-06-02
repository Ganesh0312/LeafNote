'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      {/* Dynamic Background visual ornaments */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-650/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-650/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Core Logo Identity */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-650 shadow-lg shadow-indigo-600/30 text-white transition hover:opacity-90 cursor-pointer">
            <BookOpen size={24} className="stroke-[2.5]" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-4">{title}</h1>
          <p className="text-sm text-zinc-400">{subtitle}</p>
        </div>

        {/* Card Component */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md">
          {children}
        </div>
      </div>
    </main>
  );
}
