import type { BridgeMessage } from '../src/types/messages';
import { ConversationTurn, Platform } from '../src/types/platform';
import { summariseConversation } from '../src/lib/claude-api';
import * as storage from '../src/lib/storage';
import { buildInjectionPrompt } from '../src/lib/prompt-templates';

async function handleMessage(
  message: BridgeMessage,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  if (message.type === 'EXTRACT_REQUEST') {
    const tabId = message.tabId;
    if (!tabId) throw new Error('No tab ID provided');

    const [tabInfo, extractResponse] = await Promise.all([
      chrome.tabs.get(tabId),
      chrome.tabs.sendMessage(tabId, message),
    ]);

    if (!extractResponse?.turns || !Array.isArray(extractResponse.turns)) {
      throw new Error('Failed to extract conversation turns');
    }

    const turns: ConversationTurn[] = extractResponse.turns;
    const apiKey = await storage.getApiKey();
    if (!apiKey) throw new Error('API key not configured');

    const summary = await summariseConversation(turns, message.platform, apiKey);
    const memory = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      sourcePlatform: message.platform,
      pageTitle: tabInfo.title || 'Untitled',
      pageUrl: tabInfo.url || '',
      rawTurns: turns,
      summary,
      label: summary.topic,
      pinned: false,
    };

    await storage.saveMemory(memory);
    return { success: true, memoryId: memory.id };
  }

  if (message.type === 'INJECT_REQUEST') {
    const memory = await storage.getMemory(message.memoryId);
    if (!memory) throw new Error('Memory not found');

    const promptText = buildInjectionPrompt(
      memory.sourcePlatform,
      memory.summary.topic,
      memory.summary.userGoal,
      memory.summary.keyFacts,
      memory.summary.decisions,
      memory.summary.openQuestions,
      memory.summary.lastAssistantOutput
    );

    const tabId = message.tabId;
    if (!tabId) throw new Error('No tab ID provided');

    await chrome.tabs.sendMessage(tabId, {
      type: 'INJECT_REQUEST',
      promptText,
      platform: message.platform,
    });

    return { success: true };
  }

  if (message.type === 'GET_MEMORIES') {
    const memories = await storage.getAllMemories();
    return { memories };
  }

  if (message.type === 'DELETE_MEMORY') {
    await storage.deleteMemory(message.id);
    return { success: true };
  }

  if (message.type === 'UPDATE_MEMORY') {
    await storage.updateMemory(message.id, message.updates);
    return { success: true };
  }

  if (message.type === 'SAVE_API_KEY') {
    await storage.saveApiKey(message.key);
    return { success: true };
  }

  if (message.type === 'GET_API_KEY_STATUS') {
    const hasKey = await storage.hasApiKey();
    return { hasKey };
  }

  if (message.type === 'CLEAR_ALL_MEMORIES') {
    await storage.clearAllMemories();
    return { success: true };
  }

  return { success: true };
}

// @ts-ignore - defineBackground is provided by WXT at build time
export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: BridgeMessage, sender, sendResponse) => {
    handleMessage(message, sender)
      .then((result) => {
        if (typeof result === 'object' && result !== null) {
          sendResponse({ success: true, ...(result as Record<string, unknown>) });
        } else {
          sendResponse({ success: true });
        }
      })
      .catch((error) => {
        console.error('Background handler error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  });
});
