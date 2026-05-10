import { BaseInjector } from './base';

export class GeminiInjector extends BaseInjector {
  inject(text: string): void {
    // Gemini uses a rich-textarea custom element
    let input = document.querySelector<HTMLElement>('rich-textarea div[contenteditable="true"]');

    // Fallback: try to access through shadow DOM
    if (!input) {
      const richTextarea = document.querySelector<HTMLElement>('rich-textarea');
      if (richTextarea?.shadowRoot) {
        input = richTextarea.shadowRoot.querySelector<HTMLElement>('div[contenteditable="true"]');
      }
    }

    // Fallback: look for any contenteditable in the page
    if (!input) {
      const allEditable = document.querySelectorAll<HTMLElement>('div[contenteditable="true"]');
      // Pick the last one (usually the active input)
      if (allEditable.length > 0) {
        input = allEditable[allEditable.length - 1];
      }
    }

    if (!input) {
      console.warn('Gemini input not found');
      return;
    }

    this.injectIntoContentEditable(input, text);
  }
}
