import React, { useEffect, useState } from 'react';
import { Platform } from '../types/platform';
import { useToast } from '../contexts/ToastContext';
import PlatformBadge from './PlatformBadge';

interface ActionBarProps {
  selectedMemoryId: string | null;
}

export default function ActionBar({ selectedMemoryId }: ActionBarProps) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null);
  const [saving, setSaving] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) {
        setCurrentPlatform(Platform.ChatGPT);
      } else if (url.includes('claude.ai')) {
        setCurrentPlatform(Platform.Claude);
      } else if (url.includes('gemini.google.com')) {
        setCurrentPlatform(Platform.Gemini);
      }
    });
  }, []);

  const getActiveTab = () =>
    new Promise<chrome.tabs.Tab>((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) resolve(tabs[0]);
        else reject(new Error('No active tab'));
      });
    });

  const handleSave = async () => {
    if (!currentPlatform) return;
    setSaving(true);
    try {
      const tab = await getActiveTab();
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'EXTRACT_REQUEST', platform: currentPlatform, tabId: tab.id },
          (r) => resolve(r || { success: false, error: 'No response' })
        );
      });
      if (!response.success) {
        showToast(response.error || 'Failed to save context', 'error');
      } else {
        showToast('Context saved!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save context', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInject = async () => {
    if (!currentPlatform || !selectedMemoryId) return;
    setInjecting(true);
    try {
      const tab = await getActiveTab();
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'INJECT_REQUEST', memoryId: selectedMemoryId, platform: currentPlatform, tabId: tab.id },
          (r) => resolve(r || { success: false, error: 'No response' })
        );
      });
      if (!response.success) {
        showToast(response.error || 'Failed to inject context', 'error');
      } else {
        showToast('Context injected into input!', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to inject context', 'error');
    } finally {
      setInjecting(false);
    }
  };

  if (!currentPlatform) {
    return (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-xs text-gray-500">Open ChatGPT, Claude, or Gemini to use Context Bridge</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-gray-100 bg-gray-50 space-y-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Active on</span>
        <PlatformBadge platform={currentPlatform} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-50 transition"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {saving ? 'Saving…' : 'Save Context'}
        </button>
        <button
          onClick={handleInject}
          disabled={injecting || !selectedMemoryId}
          title={!selectedMemoryId ? 'Select a context card first' : 'Inject into current input'}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-500 text-white rounded-lg text-xs font-medium hover:bg-violet-600 disabled:opacity-50 transition"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v13M9 12l3 3 3-3" />
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          {injecting ? 'Injecting…' : 'Inject'}
        </button>
      </div>
      {!selectedMemoryId && (
        <p className="text-xs text-center text-gray-400">Select a context card to enable Inject</p>
      )}
    </div>
  );
}
