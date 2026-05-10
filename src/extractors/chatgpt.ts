import { ConversationTurn } from '../types/platform';
import { BaseExtractor } from './base';

export class ChatGPTExtractor extends BaseExtractor {
  extract(): ConversationTurn[] {
    const turns: ConversationTurn[] = [];

    // Primary selector: collapsible message root
    let messages = this.querySelectorAllSafe('div[data-testid="collapsible-user-message-root"]');

    // Fallback: look for elements with data-message-author-role
    if (messages.length === 0) {
      const roledElements = this.querySelectorAllSafe('[data-message-author-role]');
      messages = roledElements.map((el) => el.closest('div[data-testid="collapsible-user-message-root"]')).filter((el) => el !== null) as HTMLElement[];
    }

    messages.forEach((message) => {
      const role = this.extractRole(message);
      const content = this.extractContent(message, role);

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

  private extractRole(message: HTMLElement): 'user' | 'assistant' {
    const roleElement = message.querySelector('[data-message-author-role]');
    const role = roleElement?.getAttribute('data-message-author-role');
    return role === 'user' ? 'user' : 'assistant';
  }

  private extractContent(message: HTMLElement, role: 'user' | 'assistant'): string {
    // Get the content div (usually has class containing 'collapsible-user-message-content')
    const contentDiv = message.querySelector('div[data-testid="collapsible-user-message-content"]');
    if (contentDiv) {
      const text = (contentDiv as HTMLElement).innerText;
      return this.cleanContent(text);
    }

    // Fallback: get all text content
    const allText = message.innerText;
    return this.cleanContent(allText);
  }
}
