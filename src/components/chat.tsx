'use client'

import { ChatHandler, Message } from '@llamaindex/chat-ui'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { DietChatPayload } from '@/types/diet'

export interface DietChatSectionProps {
  profile: DietChatPayload
}

export function DietChatSection({ profile }: DietChatSectionProps) {
  const handler = useDietChat(profile)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const isProcessing = handler.status === 'streaming' || handler.status === 'submitted'
  const canSend = draft.trim().length > 0 && !isProcessing

  useEffect(() => {
    const container = listRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [handler.messages])

  const sendDraft = useCallback(async () => {
    const trimmed = draft.trim()
    if (!trimmed || isProcessing) return

    const messageId = createMessageId()
    setDraft('')

    await handler.sendMessage({
      id: messageId,
      role: 'user',
      parts: [{ type: 'text', text: trimmed }],
    })
  }, [draft, handler, isProcessing])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void sendDraft()
    },
    [sendDraft]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void sendDraft()
      }
    },
    [sendDraft]
  )

  const renderedMessages = useMemo(() => {
    return handler.messages.map(message => {
      const isAssistant = message.role !== 'user'
      const text = message.parts
        .filter(isTextPart)
        .map(part => part.text)
        .join('\n')
        .trim()

      return (
        <div
          key={message.id}
          className={clsx('flex w-full', isAssistant ? 'justify-start' : 'justify-end')}
        >
          <div
            className={clsx(
              'relative max-w-full rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-lg transition md:max-w-2xl',
              isAssistant
                ? 'bg-[#1A2038] text-white'
                : 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white'
            )}
          >
            {isAssistant ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
                className="prose prose-invert max-w-none text-sm"
              >
                {text}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap break-words">{text}</div>
            )}
          </div>
        </div>
      )
    })
  }, [handler.messages])

  const typingIndicator = isProcessing ? (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-2 rounded-3xl bg-[#1A2038] px-5 py-3 text-sm text-white/70">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
        The coach is thinking...
      </div>
    </div>
  ) : null

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-6">
          {handler.messages.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/60">
              The coach is loading your intake details. You can ask a question now or wait for their follow-up.
            </div>
          ) : (
            renderedMessages
          )}
          {typingIndicator}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[#050816] p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-[#0A1024] px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/40"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-white transition hover:bg-[#1d4ed8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5 19.5 12 4.5 4.5 7.5 12l-3 7.5Z"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

type InternalStatus = 'ready' | 'submitted' | 'streaming'
type InternalMessage = Message & { hidden?: boolean }
type SendTextOptions = { hidden?: boolean }

function useDietChat(profile: DietChatPayload): ChatHandler {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<InternalStatus>('ready')
  const messagesRef = useRef<InternalMessage[]>([])
  const inFlightRef = useRef(false)

  const reset = useCallback(() => {
    messagesRef.current = []
    setMessages([])
    setStatus('ready')
    inFlightRef.current = false
  }, [])

  const appendMessage = useCallback((message: Message, hidden = false) => {
    const payload: InternalMessage = hidden ? { ...message, hidden: true } : message
    messagesRef.current = [...messagesRef.current, payload]
    setMessages(messagesRef.current.filter(entry => !entry.hidden) as Message[])
  }, [])

  const sendText = useCallback(
    async (text: string, options?: SendTextOptions) => {
      const trimmed = text.trim()
      if (!trimmed) return
      if (inFlightRef.current) return

      const userMessage: Message = {
        id: createMessageId(),
        role: 'user',
        parts: [{ type: 'text', text: trimmed }],
      }

      appendMessage(userMessage, Boolean(options?.hidden))
      setStatus('submitted')
      inFlightRef.current = true

      try {
        setStatus('streaming')
        const response = await fetch('/api/diet-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile,
            messages: messagesRef.current.map(toApiMessage),
          }),
        })

        const payload = await response.json().catch(() => ({}))
        const replyRaw = typeof payload === 'object' && payload !== null ? (payload as { reply?: unknown }).reply : undefined
        const assistantText = typeof replyRaw === 'string' ? replyRaw.trim() : ''

        if (!response.ok) {
          appendMessage({
            id: createMessageId(),
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text:
                  assistantText ||
                  `The nutrition coach is unavailable (status ${response.status}). Please try again shortly.`,
              },
            ],
          })
          setStatus('ready')
          return
        }

        const assistantMessage: Message = {
          id: createMessageId(),
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text:
                assistantText ||
                'I was unable to generate a response. Please try asking again.',
            },
          ],
        }

        appendMessage(assistantMessage)
        setStatus('ready')
      } catch (error) {
        console.error(error)
        appendMessage({
          id: createMessageId(),
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text:
                'Something went wrong while reaching the nutrition coach. Please retry.',
            },
          ],
        })
        setStatus('ready')
      } finally {
        inFlightRef.current = false
      }
    },
    [appendMessage, profile]
  )

  useEffect(() => {
    reset()
    const intro = buildProfileMessage(profile)
    void sendText(intro, { hidden: true })
  }, [profile, reset, sendText])

  const derivedStatus: ChatHandler['status'] = status

  return {
    messages,
    status: derivedStatus,
    sendMessage: async (message: Message) => {
      const text = message.parts
        .filter(isTextPart)
        .map(part => part.text)
        .join('\n')
        .trim()

      if (!text) return
      await sendText(text)
    },
  }
}

function createMessageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const markdownComponents: Components = {
  h1: ({ node, ...props }) => <h1 className="mb-3 mt-4 text-xl font-semibold" {...props} />,
  h2: ({ node, ...props }) => <h2 className="mb-3 mt-4 text-lg font-semibold" {...props} />,
  h3: ({ node, ...props }) => <h3 className="mb-2 mt-4 text-base font-semibold" {...props} />,
  p: ({ node, ...props }) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
  ul: ({ node, ordered, ...props }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" {...props} />
  ),
  ol: ({ node, ordered, ...props }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  code: ({ node, inline, ...props }) => (
    <code
      className={clsx(
        'rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.8rem] text-emerald-200',
        inline ? 'inline' : 'block px-4 py-3'
      )}
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="mb-4 overflow-hidden overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full text-sm" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th className="bg-white/10 px-3 py-2 text-left font-semibold" {...props} />
  ),
  td: ({ node, ...props }) => <td className="border-t border-white/10 px-3 py-2" {...props} />,
}

function toApiMessage(message: Message) {
  return {
    role: message.role,
    content: message.parts
      .filter(isTextPart)
      .map(part => part.text)
      .join('\n'),
  }
}

type TextMessagePart = {
  type: 'text'
  text: string
  [key: string]: unknown
}

function isTextPart(part: Message['parts'][number]): part is TextMessagePart {
  return part.type === 'text'
}

function buildProfileMessage(profile: DietChatPayload) {
  const { form, height, weight, weeklyBudgetRange } = profile

  const cuisineList = form.cuisines.length
    ? form.cuisines.join(', ')
    : 'None specified'

  const summary = [
    `Age: ${form.age}`,
    `Sex: ${form.sex || 'N/A'}`,
    `Height: ${height.unit === 'cm' ? `${height.value ?? 'unknown'} cm` : `${height.feet ?? '??'} ft ${height.inches ?? 0} in`}`,
    `Weight: ${weight.value ?? 'unknown'} ${weight.unit}`,
    `Activity level: ${form.activityLevel || 'N/A'}`,
    `Goal: ${form.mainGoal}`,
    `Diet style: ${form.dietStyle || 'No preference'}`,
    `Budget: ${describeBudget(weeklyBudgetRange)}`,
    `Cuisine bias: ${cuisineList}`,
    `Location: ${form.country || 'N/A'} (${form.countryCode || '??'})`,
    form.dislikedFoods ? `Dislikes: ${form.dislikedFoods}` : null,
    form.medicalNote ? `Medical: ${form.medicalNote}` : null,
  ]
    .filter(Boolean)
    .join('\n- ')

  return [
    'You are the nutrition AI coach.',
    'Here is the latest profile you must use as primary context:',
    `- ${summary}`,
    'Follow the workflow:',
    '1. Acknowledge the intake summary in friendly tone.',
    '2. Ask one clarifying question at a time until you can produce a confident 7-day diet plan (breakfast, lunch, dinner, snacks) obeying restrictions.',
    '3. After the questions are complete, deliver the plan in Markdown with per-day structure, calories estimates, and key nutrients.',
    '4. Offer to adjust the plan when the user replies.',
  'Remember to consider Spoonacular cuisine tags, Gemini reasoning, PDFBolt formatting, and Brevo delivery for next actions (describe what you will do, we will call those services separately).',
  ].join('\n')
}

function describeBudget(range: DietChatPayload['weeklyBudgetRange']) {
  if (range.min == null && range.max == null) return 'No limit'
  if (range.min == null) return `< $${range.max}`
  if (range.max == null) return `$${range.min}+`
  return `$${range.min} - $${range.max}`
}
