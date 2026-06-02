'use client';

import React, { useState, useRef } from 'react';
import { useNotes } from '../context/NoteContext';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Code,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Search,
  Eye,
  Edit3,
  X,
  Sparkles,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function MarkdownEditor({ value, onChange }) {
  const { subjects, topics, subtopics } = useNotes();
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const textareaRef = useRef(null);

  // Wiki autocomplete state
  const [showWikiSuggest, setShowWikiSuggest] = useState(false);
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiIndex, setWikiIndex] = useState(0);

  // Helper to insert formatting markup
  const insertText = (beforeStr, afterStr = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = beforeStr + (selected || '') + afterStr;
    const newValue = text.substring(0, start) + replacement + text.substring(end);

    onChange(newValue);

    // Focus and select newly inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + beforeStr.length + (selected ? selected.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Handler for toolbar buttons
  const handleFormat = (type) => {
    switch (type) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'h1':
        insertText('# ');
        break;
      case 'h2':
        insertText('## ');
        break;
      case 'h3':
        insertText('### ');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'code-block':
        insertText('```\n', '\n```');
        break;
      case 'list':
        insertText('- ');
        break;
      case 'list-ordered':
        insertText('1. ');
        break;
      case 'quote':
        insertText('> ');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          insertText('[', `](${url})`);
        }
        break;
      default:
        break;
    }
  };

  // Compile flat list of searchable notes
  const getSearchableNotes = (queryStr = '') => {
    const list = [];

    subjects.forEach((subj) => {
      const subjTopics = topics[subj._id] || [];
      subjTopics.forEach((topic) => {
        const topicSubtopics = subtopics[topic._id] || [];
        topicSubtopics.forEach((subt) => {
          list.push({
            id: subt._id,
            name: subt.title, // Updated schema rename
            path: `${subj.name} > ${topic.title} > ${subt.title}`,
            type: 'subtopic',
          });
        });
      });
    });

    if (queryStr.trim() === '') return list;

    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(queryStr.toLowerCase()) ||
        item.path.toLowerCase().includes(queryStr.toLowerCase())
    );
  };

  const handleSelectInternalLink = (item) => {
    insertText('[', `](/subtopics/${item.id})`);
    setShowLinkModal(false);
    setLinkSearchQuery('');
  };

  // Wiki Autocomplete Suggestion Selection
  const handleSelectWikiLink = (item) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const text = value;

    const beforeText = text.substring(0, wikiIndex);
    const afterText = text.substring(cursor);
    const linkStr = `[${item.name}](/subtopics/${item.id})`;

    onChange(beforeText + linkStr + afterText);
    setShowWikiSuggest(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = wikiIndex + linkStr.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Textarea Change to intercept [[ typing
  const handleTextareaChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(text);

    // Check if the user typed '[['
    const lastTwo = text.slice(Math.max(0, cursor - 2), cursor);
    if (lastTwo === '[[') {
      setShowWikiSuggest(true);
      setWikiIndex(cursor - 2);
      setWikiQuery('');
    } else if (showWikiSuggest) {
      const textFromStart = text.slice(wikiIndex + 2, cursor);
      if (textFromStart.includes('\n') || textFromStart.includes(']]')) {
        setShowWikiSuggest(false);
      } else {
        setWikiQuery(textFromStart);
      }
    }
  };

  const matchingWikiNotes = getSearchableNotes(wikiQuery).slice(0, 5);

  return (
    <div className="flex flex-col h-full border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden relative">
      {/* Editor Tabs & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-zinc-800 bg-zinc-950 p-2 gap-2">
        {/* Write/Preview Toggles */}
        <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 self-start">
          <button
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === 'write'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 size={13} />
            <span>Write</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>

        {/* Formatting Toolbar */}
        {activeTab === 'write' && (
          <div className="flex flex-wrap items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleFormat('bold')}
              title="Bold"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('italic')}
              title="Italic"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <Italic size={14} />
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <button
              type="button"
              onClick={() => handleFormat('h1')}
              title="H1"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer font-bold"
            >
              <Heading1 size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('h2')}
              title="H2"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer font-semibold"
            >
              <Heading2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('h3')}
              title="H3"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <Heading3 size={14} />
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <button
              type="button"
              onClick={() => handleFormat('code')}
              title="Inline Code"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <Code size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('code-block')}
              title="Code Block"
              className="p-1.5 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white text-xs cursor-pointer font-mono font-bold px-1"
            >
              C-B
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <button
              type="button"
              onClick={() => handleFormat('list')}
              title="Bullet List"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('list-ordered')}
              title="Numbered List"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('quote')}
              title="Blockquote"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <Quote size={14} />
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <button
              type="button"
              onClick={() => handleFormat('link')}
              title="Web Link"
              className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
            >
              <LinkIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              title="Internal Note Link"
              className="flex items-center gap-1 px-2 py-1 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-700 text-[10px] font-medium text-zinc-350 hover:text-white rounded cursor-pointer transition-all"
            >
              <Search size={10} />
              <span>Link Note</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[300px] flex flex-col relative">
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            placeholder="Write notes here in markdown (type [[ to link another note)..."
            className="w-full flex-1 p-4 bg-zinc-950/20 text-zinc-200 outline-none resize-none font-mono text-sm border-none leading-relaxed placeholder-zinc-650"
          />
        ) : (
          <div className="flex-1 p-4 overflow-y-auto bg-zinc-950/40">
            <MarkdownRenderer content={value} />
          </div>
        )}

        {/* Floating Wiki suggestion autocompletion list */}
        {showWikiSuggest && (
          <div className="absolute left-4 bottom-4 z-40 w-80 bg-zinc-900 border border-indigo-950 shadow-2xl rounded-xl p-2.5 space-y-1.5 animate-slide-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <Sparkles size={10} className="animate-pulse" />
                <span>Link Note Auto-Suggest</span>
              </span>
              <button onClick={() => setShowWikiSuggest(false)} className="text-zinc-550 hover:text-white">
                <X size={10} />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {matchingWikiNotes.length === 0 ? (
                <div className="text-[10px] text-zinc-500 py-2 text-center">No notes matching &quot;{wikiQuery}&quot;</div>
              ) : (
                matchingWikiNotes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectWikiLink(item)}
                    className="w-full text-left p-1.5 hover:bg-zinc-800 rounded text-[10px] flex flex-col border border-transparent hover:border-zinc-700 transition cursor-pointer"
                  >
                    <span className="font-semibold text-zinc-200">{item.name}</span>
                    <span className="text-[9px] text-zinc-500 truncate">{item.path}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
            {/* Header */}
            <div className="p-3 border-b border-zinc-855 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-250">Search Note to Link</span>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkSearchQuery('');
                }}
                className="p-1 text-zinc-500 hover:text-white rounded transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            {/* Search Input */}
            <div className="p-3 border-b border-zinc-855 bg-zinc-950/40">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-950 border border-zinc-850 px-3 py-2 text-zinc-400">
                <Search size={14} className="text-zinc-500" />
                <input
                  type="text"
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  placeholder="Type note title..."
                  className="bg-transparent text-sm w-full outline-none border-none text-white focus:ring-0"
                  autoFocus
                />
              </div>
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-zinc-950/20">
              {getSearchableNotes(linkSearchQuery).length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">No notes found.</div>
              ) : (
                getSearchableNotes(linkSearchQuery).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectInternalLink(item)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-900 flex flex-col gap-0.5 border border-transparent hover:border-zinc-800 transition cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-white">{item.name}</span>
                    <span className="text-[10px] text-zinc-550 truncate">{item.path}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
