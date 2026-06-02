'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { usePathname } from 'next/navigation';

export default function WorkspaceLayout({ children }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Hierarchy Navigation - Hidden on Homepage */}
        {!isHomepage && <Sidebar />}

        {/* Dynamic Inner Right Side Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-900/10">
          {children}
        </main>
      </div>
    </div>
  );
}
