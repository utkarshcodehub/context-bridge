import { BaseInjector } from './base';

export class ClaudeInjector extends BaseInjector {
  inject(text: string): void {
    // Claude uses a ProseMirror editor with contenteditable div
    let input = document.querySelector<HTMLElement>('div[contenteditable="true"]');

    // Fallback: look for ProseMirror container
    if (!input) {
      const proseMirror = document.querySelector<HTMLElement>('.ProseMirror');
      input = proseMirror?.querySelector<HTMLElement>('div[contenteditable="true"]') || null;
    }

    // Fallback: look for data-testid or class patterns specific to Claude
    if (!input) {
      input = document.querySelector<HTMLElement>('div[class*="ProseMirror"] div[contenteditable]');
    }

    if (!input) {
      console.warn('Claude input not found');
      return;
    }

    this.injectIntoContentEditable(input, text);
  }
}
