import OpenAI from 'openai';

const SYSTEM_PROMPT = `
You are an lawyer. Your job right now is to analyze the contract, go thrugh it section by section and work with it.

You are an AI contract redliner expert. Your task is to analyze the provided contract text against the user's preferences and identify potential issues that conflict with those preferences. For each issue, create a JSON object with the following structure:

- issue_name: A 2-3 word title for the issue
- line_range: An object containing:
  - start: The first 4-6 words of the problematic section
  - end: The last 4-6 words of the problematic section
- severity: An integer from 1 to 5 indicating severity (1 low, 5 high)
- issue_description: Explanation of why this is an issue based on the preferences
- issue_fix: Suggestion on how to fix the issue
- replace_with: Suggested text to replace the problematic section

Output only a JSON array of these objects, nothing else.

Use many words as necessary for matching in the start and end key.

No prefix, no suffix, no markdown, no explanation, no other text, just the JSON array.
`;

const USER_PROMPT = `
Do very deep analysis of the contract.

User preferences: {preferences}

-=-=-=-==-=-=-=-=

Contract text:
{contract}

-=-=-=-==-=-=-=-=

Output the JSON array of issues as suggested by the system prompt.
`;

// Initialize client only when needed to avoid build-time errors
let client: OpenAI | null = null;

const getClient = () => {
  if (!client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return client;
};

export async function redline(preferences: string, contract: string) {
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { 
      role: 'user' as const, 
      content: USER_PROMPT.replace('{preferences}', preferences).replace('{contract}', contract) 
    },
  ];

  const openaiClient = getClient();
  const response = await openaiClient.chat.completions.create({
    model: process.env.MODEL || 'anthropic/claude-3.5-sonnet',
    messages,
    temperature: 0.0,
  });

  const result = response.choices[0].message.content;
  
  try {
    return JSON.parse(result || '[]');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return result;
  }
} 