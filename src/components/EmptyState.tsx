import React from 'react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center h-full">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f3f0ff 100%)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 12h4M17 12h4M7 6v12M17 6v12M7 12h10" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1.5">No saved contexts yet</h3>
      <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
        Open a conversation on ChatGPT, Claude, or Gemini and click{' '}
        <span className="font-medium text-blue-500">Save Context</span> to bridge it here.
      </p>
      <div className="mt-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          ChatGPT
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
          Claude
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          Gemini
        </span>
      </div>
    </div>
  );
}
