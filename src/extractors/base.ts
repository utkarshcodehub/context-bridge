import { ConversationTurn, Platform } from '../types/platform';

export interface IExtractor {
  extract(): ConversationTurn[];
}

export abstract class BaseExtractor implements IExtractor {
  abstract extract(): ConversationTurn[];

  protected cleanContent(text: string): string {
    return text
      .trim()
      .replace(/\n+/g, ' ')
      .substring(0, 10000);
  }

  protected querySelectorSafe(selector: string): HTMLElement | null {
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  }

  protected querySelectorAllSafe(selector: string): HTMLElement[] {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch {
      return [];
    }
  }
}
