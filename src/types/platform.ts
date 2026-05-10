export enum Platform {
  ChatGPT = 'chatgpt',
  Claude = 'claude',
  Gemini = 'gemini',
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  index: number;
}
