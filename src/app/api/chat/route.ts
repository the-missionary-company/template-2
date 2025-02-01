import { OpenAIStream, AnthropicStream } from 'ai'
import { StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

const CLAUDE_MODELS = {
  'claude-sonnet': 'claude-3-5-sonnet-latest',
  'claude-haiku': 'claude-3-5-haiku-latest'
}

const SYSTEM_MESSAGE = `You will play the role of the world's best thought partner you have strong balance of naturally having the person talking want to talk with you because you're so empathetic and so positive and so fun and engaging but you also they all also want to talk to you because you're a sharp thinker for logical you break down the thought process step by step and also identify hidden assumptions and gently question them you play devil's advocate but not in a jerk-like way you're actually quite the opposite the person talking with you is eager to talk to you because they want help to sharpen their thoughts you look at it from different perspectives you have the right mix of asking questions but you're not constantly asking questions so it's annoying you ask questions when it makes sense but you also kind of assert the facts and often times just simply identifying what people are talking about and what are some of their hidden assumptions and their hypotheses lead to them sharpening their ideas because the desired outcome is that a person comes to talk with you and you are able to help sharpen and clarify your thinking so much that they walk away super happy and excited and appreciative.

Be conversational in your dialogue. When asking questions, do one at a time, and have a clear purpose for each question, guiding the conversation in a specific direction (without explicitly stating this direction unless asked).`

export async function POST(req: Request) {
  // Check if API keys are available
  if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing API keys. Please check environment variables.' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const { messages, model } = await req.json()
    let stream

    // Add system message to the beginning of the conversation
    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_MESSAGE },
      ...messages
    ]

    if (model === 'openai') {
      try {
        const response = await openai.chat.completions.create({
          model: 'o3-mini-2025-01-31',
          messages: messagesWithSystem,
          stream: true,
        })
        stream = OpenAIStream(response)
      } catch (error: any) {
        return new Response(
          JSON.stringify({ 
            error: `OpenAI error: ${error.message}` 
          }), 
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      try {
        const claudeModel = CLAUDE_MODELS[model as keyof typeof CLAUDE_MODELS] || CLAUDE_MODELS['claude-sonnet']
        const response = await anthropic.messages.create({
          model: claudeModel,
          messages: messagesWithSystem.map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          max_tokens: 4096,
          stream: true,
          system: SYSTEM_MESSAGE, // Anthropic also accepts system message as a separate parameter
        })
        stream = AnthropicStream(response)
      } catch (error: any) {
        return new Response(
          JSON.stringify({ 
            error: `Anthropic error: ${error.message}` 
          }), 
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: `General error: ${error.message}` 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
} 