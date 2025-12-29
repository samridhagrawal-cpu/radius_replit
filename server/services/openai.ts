import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set. AI features will not work.');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[], options: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
} = {}): Promise<string> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 2000,
    jsonMode = false,
  } = options;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function analyzeWithGPT(prompt: string, options?: {
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const messages: ChatMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  return chat(messages, {
    jsonMode: options?.jsonMode,
    temperature: options?.temperature,
  });
}

