import React from 'react';
import { Platform } from '../types/platform';

const CONFIG: Record<Platform, { bg: string; text: string; dot: string; label: string }> = {
  [Platform.ChatGPT]: { bg: '#f0fdf4', text: '#15803d', dot: '#4ade80', label: 'ChatGPT' },
  [Platform.Claude]:  { bg: '#fff7ed', text: '#c2410c', dot: '#fb923c', label: 'Claude'  },
  [Platform.Gemini]:  { bg: '#eff6ff', text: '#1d4ed8', dot: '#60a5fa', label: 'Gemini'  },
};

export default function PlatformBadge({ platform }: { platform: Platform }) {
  const c = CONFIG[platform];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}
