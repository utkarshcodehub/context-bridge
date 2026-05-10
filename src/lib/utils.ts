import { ConversationTurn } from '../types/platform';

export function truncateTurns(turns: ConversationTurn[], maxChars = 12000): ConversationTurn[] {
  if (turns.length === 0) return [];

  const reversed = [...turns].reverse();
  let charCount = 0;
  const kept: ConversationTurn[] = [];

  for (const turn of reversed) {
    const turnChars = turn.content.length;
    if (charCount + turnChars > maxChars && kept.length > 0) break;
    charCount += turnChars;
    kept.unshift(turn);
  }

  return kept.length > 0 ? kept : turns.slice(-2);
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function formatTurnsForPrompt(turns: ConversationTurn[]): string {
  return turns
    .map((turn) => `[${turn.role === 'user' ? 'User' : 'Assistant'}]: ${turn.content}`)
    .join('\n\n');
}
