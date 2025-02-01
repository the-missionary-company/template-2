import { Anthropic } from '@anthropic-ai/sdk';
import { StreamingTextResponse } from 'ai';

// Initialize Anthropic client
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    console.log('Received chat request');
    const { messages, model } = await req.json();
    console.log('Using model:', model);

    const response = await anthropicClient.messages.create({
      model: model || 'claude-3-sonnet',
      messages: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      system: `You are a helpful AI assistant focused on providing clear, accurate, and engaging responses. 
      You break down complex topics into understandable explanations and provide specific examples when helpful.
      You maintain a friendly and professional tone while ensuring your responses are thorough and well-structured.`,
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
    });

    console.log('Got response from Anthropic');

    // Convert the response stream to a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
              controller.enqueue(chunk.delta.text);
            }
          }
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
    });

    // Return a StreamingTextResponse with the converted stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
