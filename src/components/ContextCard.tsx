import React from 'react';
import { MemoryState } from '../types/memory';
import PlatformBadge from './PlatformBadge';

interface ContextCardProps {
  memory: MemoryState;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function fmtTokens(n: number): string {
  return n >= 1000 ? `~${(n / 1000).toFixed(1)}k` : `~${n}`;
}

export default function ContextCard({ memory, isSelected, onSelect, onDelete, onPin }: ContextCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border cursor-pointer transition-all select-none overflow-hidden ${
        isSelected
          ? 'border-blue-400 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      style={isSelected ? { background: '#eff6ff' } : { background: '#fff' }}
    >
      {/* Top row: platform + time + actions */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={memory.sourcePlatform} />
          <span className="text-xs text-gray-400">{timeAgo(memory.createdAt)}</span>
          {memory.pinned && (
            <span className="text-xs font-medium text-blue-500">Pinned</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            title={memory.pinned ? 'Unpin' : 'Pin'}
            className={`p-1.5 rounded-md transition-colors ${
              memory.pinned ? 'text-blue-500 bg-blue-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={memory.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title + goal */}
      <div className="px-3 pb-2">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-0.5">
          {memory.label}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{memory.summary.userGoal}</p>
      </div>

      {/* Key facts pills */}
      {memory.summary.keyFacts.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {memory.summary.keyFacts.slice(0, 3).map((fact, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={fact}
            >
              {fact}
            </span>
          ))}
          {memory.summary.keyFacts.length > 3 && (
            <span className="text-xs text-gray-400 px-1 py-0.5">
              +{memory.summary.keyFacts.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer: counts + token estimate */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {memory.summary.keyFacts.length} facts
          </span>
          {memory.summary.decisions.length > 0 && (
            <span className="text-xs text-gray-400">
              {memory.summary.decisions.length} decisions
            </span>
          )}
          {memory.summary.openQuestions.length > 0 && (
            <span className="text-xs text-gray-400">
              {memory.summary.openQuestions.length} open
            </span>
          )}
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: '#f3f0ff', color: '#7c3aed' }}
        >
          {fmtTokens(memory.summary.tokenEstimate)} tokens
        </span>
      </div>
    </div>
  );
}
