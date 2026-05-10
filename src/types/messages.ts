import { Platform } from './platform';
import { MemoryState } from './memory';

export type ExtractRequestMsg = {
  type: 'EXTRACT_REQUEST';
  platform: Platform;
  tabId: number;
};

export type ExtractResponseMsg = {
  type: 'EXTRACT_RESPONSE';
  success: boolean;
  memoryId?: string;
  error?: string;
};

export type InjectRequestMsg = {
  type: 'INJECT_REQUEST';
  memoryId: string;
  platform: Platform;
  tabId: number;
};

export type InjectResponseMsg = {
  type: 'INJECT_RESPONSE';
  success: boolean;
  error?: string;
};

export type GetMemoriesMsg = { type: 'GET_MEMORIES' };
export type GetMemoriesResponseMsg = { type: 'GET_MEMORIES_RESPONSE'; memories: MemoryState[] };

export type DeleteMemoryMsg = { type: 'DELETE_MEMORY'; id: string };
export type UpdateMemoryMsg = { type: 'UPDATE_MEMORY'; id: string; updates: Partial<import('./memory').MemoryState> };
export type SaveApiKeyMsg = { type: 'SAVE_API_KEY'; key: string };
export type GetApiKeyStatusMsg = { type: 'GET_API_KEY_STATUS' };
export type ApiKeyStatusResponseMsg = { type: 'API_KEY_STATUS'; hasKey: boolean };
export type ClearAllMemoriesMsg = { type: 'CLEAR_ALL_MEMORIES' };

export type BridgeMessage =
  | ExtractRequestMsg
  | ExtractResponseMsg
  | InjectRequestMsg
  | InjectResponseMsg
  | GetMemoriesMsg
  | GetMemoriesResponseMsg
  | DeleteMemoryMsg
  | UpdateMemoryMsg
  | SaveApiKeyMsg
  | GetApiKeyStatusMsg
  | ApiKeyStatusResponseMsg
  | ClearAllMemoriesMsg;
