'use client'

import { useState, useRef, useEffect } from 'react'
import { useAIChat } from '@/hooks/useAIChat'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Bot,
  User,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

// Suggested questions shown at start
const SUGGESTIONS = [
  'Who owes me the most?',
  'How much did I collect this month?',
  'Which customers haven\'t paid in a while?',
  'Write a payment reminder for my top due customer',
  'What\'s my total outstanding due?',
]

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading, clearChat } = useAIChat()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const msg = input
    setInput('')
    await sendMessage(msg)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showSuggestions = messages.length <= 1

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700',
          'flex items-center justify-center shadow-lg',
          'transition-all duration-200',
          open && 'scale-0 opacity-0'
        )}
        title="AI Assistant"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </button>

      {/* Chat panel */}
      <div className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-[380px] h-[560px]',
        'bg-white rounded-2xl border border-slate-200 shadow-xl',
        'flex flex-col overflow-hidden',
        'transition-all duration-200 origin-bottom-right',
        open
          ? 'scale-100 opacity-100'
          : 'scale-95 opacity-0 pointer-events-none'
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                AI Assistant
              </p>
              <p className="text-xs text-blue-100">
                Knows your business data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5 text-white/70" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2.5',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                msg.role === 'user'
                  ? 'bg-blue-100'
                  : 'bg-slate-100'
              )}>
                {msg.role === 'user'
                  ? <User className="w-3 h-3 text-blue-600" />
                  : <Bot className="w-3 h-3 text-slate-500" />
                }
              </div>

              {/* Bubble */}
              <div className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5',
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-100 text-slate-800 rounded-tl-sm'
              )}>
                {msg.isLoading ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p className={cn(
                      'text-xs mt-1',
                      msg.role === 'user'
                        ? 'text-blue-200'
                        : 'text-slate-400'
                    )}>
                      {format(msg.timestamp, 'HH:mm')}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Suggestion chips — shown only at start */}
          {showSuggestions && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-slate-400 text-center">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your business..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0',
                input.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {isLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-1.5">
            Powered by GPT-4o mini · Your data stays private
          </p>
        </div>
      </div>
    </>
  )
}