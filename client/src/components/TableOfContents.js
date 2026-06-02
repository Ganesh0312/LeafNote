'use client';

import React, { useState, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    const lines = content.split('\n');
    const parsedHeadings = [];
    let inCodeBlock = false;

    lines.forEach((line) => {
      // Check for code blocks so we don't parse comments as headings
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) return;

      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/\[\[(.*?)\]\]/g, '$1').trim(); // clean double-bracket links if present
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        parsedHeadings.push({ level, text, id });
      }
    });

    setHeadings(parsedHeadings);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Set active to the first intersecting heading
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px', // Adjust offsets to match navbar height
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update history hash without jump
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="w-64 flex-shrink-0 hidden lg:block bg-zinc-950/20 border-l border-zinc-900/80 p-6 overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
        <AlignLeft size={14} className="text-indigo-400" />
        <span>On this page</span>
      </div>
      <nav className="space-y-2.5">
        {headings.map((heading, i) => {
          const isActive = heading.id === activeId;
          const indent = heading.level === 2 ? 'pl-3' : heading.level === 3 ? 'pl-6' : '';

          return (
            <a
              key={i}
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`block text-xs transition duration-200 hover:text-zinc-200 line-clamp-2 ${indent} ${
                isActive
                  ? 'text-indigo-400 font-bold border-l-2 border-indigo-500 pl-2 -ml-2'
                  : 'text-zinc-550'
              }`}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
