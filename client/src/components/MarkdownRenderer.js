'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useNotes } from '../context/NoteContext';

export default function MarkdownRenderer({ content, placeholder }) {
  const { loadSubtopicDetails } = useNotes();

  const CustomLink = ({ href, children, ...props }) => {
    // Intercept internal note navigation links
    const isInternal = href && (href.startsWith('/subtopics/') || href.includes('/subtopics/'));

    if (isInternal) {
      const subtopicId = href.split('/').pop();
      const handleClick = (e) => {
        e.preventDefault();
        loadSubtopicDetails(subtopicId);
      };

      return (
        <a
          href={href}
          onClick={handleClick}
          className="text-indigo-400 hover:text-indigo-350 underline underline-offset-4 cursor-pointer font-medium"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-350 underline underline-offset-4 font-medium"
        {...props}
      >
        {children}
      </a>
    );
  };

  // Custom headings helper to assign slugified IDs for TOC anchors
  const CustomHeading = (level) => {
    const Tag = `h${level}`;
    return ({ children, ...props }) => {
      const text = React.Children.toArray(children).join('');
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return <Tag id={id} {...props}>{children}</Tag>;
    };
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: CustomLink,
          h1: CustomHeading(1),
          h2: CustomHeading(2),
          h3: CustomHeading(3),
        }}
      >
        {content || placeholder || '_No notes content written yet. Click "Edit Note" above to write some notes!_'}
      </ReactMarkdown>
    </div>
  );
}
