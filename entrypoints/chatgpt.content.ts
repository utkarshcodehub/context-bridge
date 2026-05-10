import { ChatGPTExtractor } from '../src/extractors/chatgpt';
import { ChatGPTInjector } from '../src/injectors/chatgpt';
import type { BridgeMessage } from '../src/types/messages';

// @ts-ignore - defineContentScript is provided by WXT at build time
export default defineContentScript({
  matches: ['https://chat.openai.com/*', 'https://chatgpt.com/*'],
  main() {
    chrome.runtime.onMessage.addListener((message: BridgeMessage, _sender, sendResponse) => {
      try {
        if (message.type === 'EXTRACT_REQUEST') {
          const extractor = new ChatGPTExtractor();
          const turns = extractor.extract();
          sendResponse({ turns });
          return true;
        }

        if (message.type === 'INJECT_REQUEST' && 'promptText' in message && typeof (message as Record<string, unknown>).promptText === 'string') {
          const injector = new ChatGPTInjector();
          injector.inject((message as Record<string, unknown>).promptText as string);
          sendResponse({ success: true });
          return true;
        }
      } catch (error) {
        console.error('Content script error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        sendResponse({ success: false, error: errorMessage });
      }
      return true;
    });
  },
});
