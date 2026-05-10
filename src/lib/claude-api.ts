import { ConversationTurn } from '../types/platform';
import { MemoryState } from '../types/memory';
import { buildSummarisationPrompt, prepareTurnsForSummarisation, SYSTEM_PROMPT } from './prompt-templates';
import { Platform } from '../types/platform';
import { estimateTokens, formatTurnsForPrompt } from './utils';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;

interface GroqMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{ message: { content: string } }>;
  error?: { type: string; message: string };
}

export async function summariseConversation(
  turns: ConversationTurn[],
  platform: Platform,
  apiKey: string
): Promise<MemoryState['summary']> {
  const preparedTurns = prepareTurnsForSummarisation(turns);
  const conversationText = formatTurnsForPrompt(preparedTurns);
  const prompt = buildSummarisationPrompt(platform, preparedTurns.length, conversationText);

  const messages: GroqMessage[] = [
    {
      role: 'user',
      content: `${SYSTEM_PROMPT}\n\n${prompt}`,
    },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    let errorMessage = '';

    if (response.status === 401) {
      errorMessage = 'Invalid API key. Get a free one at https://console.groq.com';
    } else if (response.status === 429) {
      errorMessage = 'API rate limit exceeded. Try again in a few moments.';
    } else if (response.status === 500) {
      errorMessage = 'Groq API is experiencing issues. Please try again.';
    } else {
      try {
        const error = (await response.json()) as GroqResponse;
        if (error.error) {
          errorMessage = error.error.message;
        }
      } catch {
        errorMessage = `API error (${response.status})`;
      }
    }

    throw new Error(errorMessage || `Groq API error: ${response.status}`);
  }

  const data = (await response.json()) as GroqResponse;
  const text = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(text);
    return {
      topic: parsed.topic || 'Untitled',
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts : [],
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      openQuestions: Array.isArray(parsed.openQuestions) ? parsed.openQuestions : [],
      userGoal: parsed.userGoal || 'Unknown',
      lastAssistantOutput: parsed.lastAssistantOutput || '',
      tokenEstimate: typeof parsed.tokenEstimate === 'number' ? parsed.tokenEstimate : estimateTokens(conversationText),
    };
  } catch {
    throw new Error(`Failed to parse Groq API response as JSON: ${text}`);
  }
}
