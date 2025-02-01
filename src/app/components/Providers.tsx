'use client'

// Try both import styles to see which one works
import { DeepgramContextProvider } from '@/lib/contexts/DeepgramContext'
// or if it's a default export:
// import DeepgramProvider from '@/lib/contexts/DeepgramContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  if (!DeepgramContextProvider) {
    console.error('DeepgramContextProvider is undefined')
    return <>{children}</>
  }

  return (
    <DeepgramContextProvider>
      {children}
    </DeepgramContextProvider>
  )
} 