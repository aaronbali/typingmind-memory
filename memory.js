// Memory.js
export const config = {
    name: 'Memory Extension',
    variables: [{
      key: 'DATABASE_URL',
      name: 'Database Connection String',
      description: 'Neon PostgreSQL connection string'
    }]
  };
  
  import { createClient } from '@neondatabase/serverless';

import { createClient } from '@neondatabase/serverless';

const client = createClient(process.env.DATABASE_URL);

async function getAllMemories() {
  const { rows } = await client.query('SELECT content FROM memories ORDER BY created_at DESC');
  return rows.map(r => r.content).join('\n\n');
}

function summarizeChat(message, response) {
  const prompt = `Please extract key points and insights from this conversation:
User: ${message}
Assistant: ${response}

Format: Provide a concise bulleted summary of the main points, insights, and any important information worth remembering.`;
  
  // Using TypingMind's built-in chat.sendMessage for summarization
  return chat.sendMessage(prompt);
}

export const beforeSend = async ({ messages, prompt }) => {
  const memories = await getAllMemories();
  return {
    messages,
    prompt: `Previous memories:\n${memories}\n\nCurrent conversation:\n${prompt}`
  };
};

export const afterReceive = async ({ message, response }) => {
  const summary = await summarizeChat(message, response);
  await client.query('INSERT INTO memories (content) VALUES ($1)', [summary]);
  return { message, response };
};