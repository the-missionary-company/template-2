export async function GET() {
  return new Response(
    JSON.stringify({
      openaiKey: !!process.env.OPENAI_API_KEY,
      anthropicKey: !!process.env.ANTHROPIC_API_KEY
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
} 