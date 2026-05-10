import React, { useState } from 'react';
import ContextListView from './views/ContextListView';
import SettingsView from './views/SettingsView';
import { ToastProvider } from '../../src/contexts/ToastContext';
import Toast from '../../src/components/Toast';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'contexts' | 'settings'>('contexts');

  return (
    <>
      <div className="flex flex-col bg-white" style={{ width: 380, height: 560 }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-white bg-opacity-20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h4M17 12h4M7 6v12M17 6v12M7 12h10" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">Context Bridge</span>
          </div>
          <span className="text-white text-xs" style={{ opacity: 0.6 }}>v0.1.0</span>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {(['contexts', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'contexts' ? 'My Contexts' : 'Settings'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'contexts' ? <ContextListView /> : <SettingsView />}
        </div>
      </div>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
