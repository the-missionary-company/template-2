import { Anthropic } from '@anthropic-ai/sdk';
import { StreamingTextResponse } from 'ai';

// Initialize Anthropic client
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function anthropic(model: string) {
  return async function(messages: any[]) {
    try {
      const response = await anthropicClient.messages.create({
        model: model,
        messages: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        max_tokens: 4096,
        stream: true,
      });

      // Convert the response stream to a ReadableStream
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
              controller.enqueue(chunk.delta.text);
            }
          }
          controller.close();
        },
      });

      // Return a StreamingTextResponse with the converted stream
      return new StreamingTextResponse(stream);
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  };
} 