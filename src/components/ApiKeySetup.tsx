import React, { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

interface ApiKeySetupProps {
  onKeyUpdated?: () => void;
}

export default function ApiKeySetup({ onKeyUpdated }: ApiKeySetupProps) {
  const [hasKey, setHasKey] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_API_KEY_STATUS' }, (response) => {
      setHasKey(response?.hasKey || false);
    });
  }, []);

  const handleSave = async () => {
    if (!input.trim()) {
      setError('Please enter an API key');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await chrome.runtime.sendMessage({ type: 'SAVE_API_KEY', key: input.trim() });
      setHasKey(true);
      setInput('');
      showToast('API key saved successfully', 'success');
      onKeyUpdated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save API key';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear API key?')) return;
    try {
      await chrome.runtime.sendMessage({ type: 'SAVE_API_KEY', key: '' });
      setHasKey(false);
      showToast('API key cleared', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to clear API key';
      showToast(message, 'error');
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">Groq API Key</h3>

      {hasKey ? (
        <div className="space-y-2">
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✓ API key configured
          </div>
          <button
            onClick={handleClear}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            Replace Key
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder="gsk_..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !input.trim()}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Key'}
          </button>
          <p className="text-xs text-gray-500">
            Get your free key from{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              console.groq.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
