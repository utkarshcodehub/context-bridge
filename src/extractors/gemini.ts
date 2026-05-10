import { ConversationTurn } from '../types/platform';
import { BaseExtractor } from './base';

export class GeminiExtractor extends BaseExtractor {
  extract(): ConversationTurn[] {
    const turns: ConversationTurn[] = [];

    // Primary: Gemini uses custom elements
    let queryElements = this.querySelectorAllSafe('user-query-content');
    let responseElements = this.querySelectorAllSafe('model-response');

    // Fallback: look for ms-chat-turn elements (used in some Gemini versions)
    if (queryElements.length === 0) {
      const chatTurns = this.querySelectorAllSafe('ms-chat-turn');
      chatTurns.forEach((turn) => {
        const isUser = turn.querySelector('div[role="user"]') !== null;
        if (isUser) {
          queryElements.push(turn);
        } else {
          responseElements.push(turn);
        }
      });
    }

    // Interleave user and model responses by DOM order
    const allTurns: Array<{ element: HTMLElement; role: 'user' | 'assistant' }> = [];

    queryElements.forEach((el) => allTurns.push({ element: el, role: 'user' }));
    responseElements.forEach((el) => allTurns.push({ element: el, role: 'assistant' }));

    // Sort by DOM position
    allTurns.sort((a, b) => {
      const compareResult = a.element.compareDocumentPosition(b.element);
      return compareResult & 4 ? -1 : 1;
    });

    allTurns.forEach(({ element, role }) => {
      const content = this.extractContent(element, role);
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

  private extractContent(element: HTMLElement, role: 'user' | 'assistant'): string {
    if (role === 'user') {
      const queryText = element.querySelector('div[class*="text"]');
      if (queryText) return this.cleanContent((queryText as HTMLElement).innerText);
    }

    // For assistant messages, look for markdown content
    const mdContent = element.querySelector('div[class*="markdown"]');
    if (mdContent) return this.cleanContent((mdContent as HTMLElement).innerText);

    // Fallback: get all text
    return this.cleanContent(element.innerText);
  }
}
