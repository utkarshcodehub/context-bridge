import { Platform, ConversationTurn } from '../types/platform';
import { formatTurnsForPrompt, estimateTokens, truncateTurns } from './utils';

export const SYSTEM_PROMPT = `You are a conversation-context summariser for a cross-AI memory bridge tool.
Your output must be valid JSON with no markdown fences or code blocks.

Respond with ONLY valid JSON matching this exact structure:
{
  "topic": string,
  "keyFacts": string[],
  "decisions": string[],
  "openQuestions": string[],
  "userGoal": string,
  "lastAssistantOutput": string,
  "tokenEstimate": number
}`;

export function buildSummarisationPrompt(
  platform: Platform,
  turnCount: number,
  conversationText: string
): string {
  const charCount = conversationText.length;

  return `Below is a conversation exported from ${platform}. Summarise it into a JSON object.

Rules:
- "topic": one sentence, ≤15 words describing the conversation subject
- "keyFacts": 3-7 key facts established (empty array if none apply)
- "decisions": conclusions or choices made (empty array if none apply)
- "openQuestions": unresolved threads or planned next steps (empty array if none apply)
- "userGoal": inferred primary intent of the user, ≤20 words
- "lastAssistantOutput": the final assistant message verbatim, ≤400 chars
- "tokenEstimate": rough token count (character count ÷ 4)
- Use plain English, no markdown inside JSON strings

CONVERSATION (${turnCount} turns, ~${charCount} chars):
${conversationText}`;
}

export function buildInjectionPrompt(
  sourcePlatform: string,
  topic: string,
  userGoal: string,
  keyFacts: string[],
  decisions: string[],
  openQuestions: string[],
  lastAssistantOutput: string
): string {
  const factsList = keyFacts.length > 0 ? keyFacts.map((f) => `- ${f}`).join('\n') : '(none yet)';
  const decisionsList = decisions.length > 0 ? decisions.map((d) => `- ${d}`).join('\n') : '(none yet)';
  const questionsList = openQuestions.length > 0 ? openQuestions.map((q) => `- ${q}`).join('\n') : '(none)';

  return `I'm continuing a conversation from ${sourcePlatform}. Here's the context:

**Topic:** ${topic}
**My Goal:** ${userGoal}

**Key Facts Established:**
${factsList}

**Decisions Made:**
${decisionsList}

**Open Questions:**
${questionsList}

**Where we left off (last AI response):**
"${lastAssistantOutput}"

Please acknowledge this context and help me continue from where we left off.`;
}

export function prepareTurnsForSummarisation(turns: ConversationTurn[]): ConversationTurn[] {
  const capped = turns.slice(-40);
  return truncateTurns(capped, 12000);
}
