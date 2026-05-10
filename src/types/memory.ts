import { Platform, ConversationTurn } from './platform';

export interface MemoryState {
  id: string;
  createdAt: number;
  sourcePlatform: Platform;
  pageTitle: string;
  pageUrl: string;
  rawTurns: ConversationTurn[];

  summary: {
    topic: string;
    keyFacts: string[];
    decisions: string[];
    openQuestions: string[];
    userGoal: string;
    lastAssistantOutput: string;
    tokenEstimate: number;
  };

  label: string;
  pinned: boolean;
}

export type MemoryStore = Record<string, MemoryState>;
