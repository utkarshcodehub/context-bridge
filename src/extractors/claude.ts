import { ConversationTurn } from '../types/platform';
import { BaseExtractor } from './base';

export class ClaudeExtractor extends BaseExtractor {
  extract(): ConversationTurn[] {
    const turns: ConversationTurn[] = [];

    // Primary: look for Claude-specific turn containers
    let humanTurns = this.querySelectorAllSafe('div[data-testid="human-turn"]');
    let aiTurns = this.querySelectorAllSafe('div[data-testid="ai-turn"]');

    // Fallback: look for class-based selectors
    if (humanTurns.length === 0) {
      humanTurns = this.querySelectorAllSafe('div.human-turn');
      aiTurns = this.querySelectorAllSafe('div.ai-turn');
    }

    // Fallback: look for elements with specific data attributes
    if (humanTurns.length === 0) {
      const container = this.querySelectorSafe('div[class*="overflow-y-auto"]');
      if (container) {
        const allTurns = this.querySelectorAllSafe('div[class*="py-"]');
        humanTurns = allTurns.filter((el) => {
          const text = el.innerText.toLowerCase();
          return text.length > 0 && !el.querySelector('svg[class*="claude"]');
        });
      }
    }

    // Interleave human and AI turns by order
    const allTurns: Array<{ element: HTMLElement; role: 'user' | 'assistant' }> = [];

    humanTurns.forEach((el) => allTurns.push({ element: el, role: 'user' }));
    aiTurns.forEach((el) => allTurns.push({ element: el, role: 'assistant' }));

    // Sort by DOM position
    allTurns.sort((a, b) => {
      const compareResult = a.element.compareDocumentPosition(b.element);
      return compareResult & 4 ? -1 : 1; // 4 means 'a comes before b'
    });

    allTurns.forEach(({ element, role }) => {
      const content = this.extractContent(element);
      if (content) {
        turns.push({
          role,
          content,
          index: turns.length,
        });
      }
    });

    return turns;
  }

  private extractContent(element: HTMLElement): string {
    // Try to find markdown or text content
    const mdContent = element.querySelector('div[class*="markdown"]');
    if (mdContent) return this.cleanContent((mdContent as HTMLElement).innerText);

    const textContent = element.querySelector('p, div[class*="text"]');
    if (textContent) return this.cleanContent((textContent as HTMLElement).innerText);

    return this.cleanContent(element.innerText);
  }
}
