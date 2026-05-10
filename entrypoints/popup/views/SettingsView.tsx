import React, { useEffect, useState } from 'react';
import ApiKeySetup from '../../../src/components/ApiKeySetup';
import { useToast } from '../../../src/contexts/ToastContext';
import { MemoryState } from '../../../src/types/memory';

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export default function SettingsView() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [memories, setMemories] = useState<MemoryState[]>([]);
  const [storageBytes, setStorageBytes] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_API_KEY_STATUS' }, (r) => {
      setHasApiKey(r?.hasKey || false);
    });
    chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (r) => {
      setMemories(r?.memories || []);
    });
    chrome.storage.local.getBytesInUse(null, (bytes) => {
      setStorageBytes(bytes);
    });
  }, []);

  const totalTokens = memories.reduce((sum, m) => sum + (m.summary.tokenEstimate || 0), 0);

  const handleClearAll = async () => {
    if (!confirm('Delete all saved contexts? This cannot be undone.')) return;
    setClearing(true);
    try {
      await new Promise<void>((resolve) => {
        chrome.runtime.sendMessage({ type: 'CLEAR_ALL_MEMORIES' }, () => resolve());
      });
      setMemories([]);
      setStorageBytes(0);
      showToast('All contexts cleared', 'success');
    } catch {
      showToast('Failed to clear contexts', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      <ApiKeySetup onKeyUpdated={() => setHasApiKey(true)} />

      {/* Storage stats */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Storage</span>
        </div>
        <div className="divide-y divide-gray-100">
          <StatRow label="Saved contexts" value={`${memories.length}`} />
          <StatRow
            label="Total tokens stored"
            value={totalTokens >= 1000 ? `~${(totalTokens / 1000).toFixed(1)}k` : `~${totalTokens}`}
          />
          <StatRow
            label="Storage used"
            value={storageBytes !== null ? fmtBytes(storageBytes) : '—'}
          />
          <StatRow label="Storage limit" value="10 MB" muted />
        </div>
      </div>

      {/* Danger zone */}
      <button
        onClick={handleClearAll}
        disabled={clearing || memories.length === 0}
        className="w-full px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-40 transition"
      >
        {clearing ? 'Clearing…' : `Clear All Contexts${memories.length > 0 ? ` (${memories.length})` : ''}`}
      </button>

      {/* Footer */}
      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>Context Bridge v0.1.0 · Powered by Groq</p>
        <p>All data stored locally on your device</p>
      </div>
    </div>
  );
}

function StatRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-medium ${muted ? 'text-gray-400' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
