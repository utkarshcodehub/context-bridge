export abstract class BaseInjector {
  abstract inject(text: string): void;

  protected injectIntoContentEditable(element: HTMLElement, text: string): void {
    element.focus();

    // Use execCommand for contenteditable elements
    // This fires the beforeinput event that React/ProseMirror listens to
    document.execCommand('selectAll', false, undefined);
    document.execCommand('insertText', false, text);

    // Fallback if execCommand doesn't work
    if (!element.textContent?.includes(text)) {
      element.textContent = text;
      element.dispatchEvent(new InputEvent('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Move cursor to end
    setTimeout(() => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    }, 100);
  }

  protected injectIntoReactInput(
    element: HTMLInputElement | HTMLTextAreaElement,
    text: string
  ): void {
    const nativeInputValueSetter =
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

    nativeInputValueSetter?.call(element, text);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
