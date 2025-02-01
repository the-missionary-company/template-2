import { ChatInterface } from './components/ChatInterface'
import { Providers } from './components/Providers'

export default function Home() {
  return (
    <Providers>
      <main className="min-h-screen bg-gray-950">
        <ChatInterface />
      </main>
    </Providers>
  )
}
