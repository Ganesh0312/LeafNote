'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function WorkspaceLayout({ children }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Top Navigation — pass toggle for mobile */}
      <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} showMenuBtn={!isHomepage} />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Desktop Sidebar (lg+) ── */}
        {!isHomepage && (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        )}

        {/* ── Mobile Sidebar Drawer ── */}
        {!isHomepage && (
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer Panel */}
            <div
              className={`fixed top-0 left-0 z-50 h-full w-72 bg-zinc-950 border-r border-zinc-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Close button inside drawer */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
              <Sidebar />
            </div>
          </>
        )}

        {/* Dynamic Inner Right Side Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-900/10">
          {children}
        </main>
      </div>
    </div>
  );
}
