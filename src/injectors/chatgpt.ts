import { BaseInjector } from './base';

export class ChatGPTInjector extends BaseInjector {
  inject(text: string): void {
    // ChatGPT uses a contenteditable div with id="prompt-textarea"
    const input = document.querySelector<HTMLElement>('#prompt-textarea');

    if (!input) {
      console.warn('ChatGPT input not found');
      return;
    }

    this.injectIntoContentEditable(input, text);
  }
}
