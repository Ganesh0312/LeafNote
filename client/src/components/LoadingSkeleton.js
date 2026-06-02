import React from 'react';

export default function LoadingSkeleton({ type = 'workspace' }) {
  if (type === 'sidebar') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-7 bg-zinc-800 rounded w-full"></div>
          <div className="h-7 bg-zinc-800 rounded w-5/6 pl-4"></div>
          <div className="h-7 bg-zinc-800 rounded w-4/5 pl-8"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-full"></div>
        <div className="h-8 bg-zinc-800 rounded w-full"></div>
        <div className="h-8 bg-zinc-800 rounded w-full"></div>
      </div>
    );
  }

  // Default workspace skeleton
  return (
    <div className="space-y-6 p-6 animate-pulse max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
      
      {/* Title */}
      <div className="h-8 bg-zinc-800 rounded w-1/2"></div>
      
      {/* Metadata */}
      <div className="h-4 bg-zinc-800 rounded w-1/3 border-b border-zinc-900 pb-2"></div>
      
      {/* Content body */}
      <div className="space-y-3 pt-4">
        <div className="h-4 bg-zinc-800 rounded w-full"></div>
        <div className="h-4 bg-zinc-800 rounded w-full"></div>
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
      </div>

      {/* Accordions */}
      <div className="space-y-3 pt-6 border-t border-zinc-900">
        <div className="h-12 bg-zinc-800 rounded-xl w-full"></div>
        <div className="h-12 bg-zinc-800 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
