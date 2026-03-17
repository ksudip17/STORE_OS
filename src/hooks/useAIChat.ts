import { useState, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your business assistant. Ask me anything about your stores — like \"who owes me the most?\" or \"how much did I collect this month?\" or \"write a reminder for Ramesh bhai\".",
      timestamp: new Date(),
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    // Add loading placeholder
    const loadingMsg: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setIsLoading(true)

    try {
      // Build history for context (exclude welcome + loading)
      const history = messages
        .filter(m => m.id !== 'welcome' && !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim(), history }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Request failed')

      // Replace loading with real response
      setMessages(prev => prev.map(m =>
        m.id === 'loading'
          ? {
              id: Date.now().toString(),
              role: 'assistant' as const,
              content: data.reply,
              timestamp: new Date(),
              isLoading: false,
            }
          : m
      ))
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === 'loading'
          ? {
              id: Date.now().toString(),
              role: 'assistant' as const,
              content: `Sorry, something went wrong: ${err.message}`,
              timestamp: new Date(),
              isLoading: false,
            }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your business assistant. Ask me anything about your stores.",
      timestamp: new Date(),
    }])
  }, [])

  return { messages, sendMessage, isLoading, clearChat }
}