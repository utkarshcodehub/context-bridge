import React, { useEffect, useState } from 'react';
import { MemoryState } from '../../../src/types/memory';
import ActionBar from '../../../src/components/ActionBar';
import ContextCard from '../../../src/components/ContextCard';
import EmptyState from '../../../src/components/EmptyState';

function sortMemories(list: MemoryState[]): MemoryState[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });
}

export default function ContextListView() {
  const [memories, setMemories] = useState<MemoryState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
      if (response?.memories) setMemories(sortMemories(response.memories));
      setLoading(false);
    });
  }, []);

  const handleDelete = (id: string) => {
    chrome.runtime.sendMessage({ type: 'DELETE_MEMORY', id });
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handlePin = (id: string) => {
    const memory = memories.find((m) => m.id === id);
    if (!memory) return;
    const updates = { pinned: !memory.pinned };
    chrome.runtime.sendMessage({ type: 'UPDATE_MEMORY', id, updates });
    setMemories((prev) => sortMemories(prev.map((m) => m.id === id ? { ...m, ...updates } : m)));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-4 w-14 bg-gray-200 rounded-full" />
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-4/5 bg-gray-200 rounded" />
            <div className="h-3 w-3/5 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ActionBar selectedMemoryId={selectedId} />
      {memories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {memories.map((memory) => (
            <ContextCard
              key={memory.id}
              memory={memory}
              isSelected={selectedId === memory.id}
              onSelect={() => setSelectedId(selectedId === memory.id ? null : memory.id)}
              onDelete={() => handleDelete(memory.id)}
              onPin={() => handlePin(memory.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
