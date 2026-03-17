import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, history } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 2. Fetch business data
    const { data: stores } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)

    const storeIds = stores?.map(s => s.id) ?? []

    const { data: customers } = storeIds.length
      ? await supabase
          .from('customers')
          .select('*')
          .in('store_id', storeIds)
      : { data: [] }

    const customerIds = customers?.map(c => c.id) ?? []

    const { data: transactions } = customerIds.length
      ? await supabase
          .from('transactions')
          .select('*')
          .in('customer_id', customerIds)
          .order('date', { ascending: false })
          .limit(100)
      : { data: [] }

    // 3. Build context
    const totalDue = customers
      ?.filter(c => c.balance < 0)
      .reduce((s, c) => s + Math.abs(c.balance), 0) ?? 0

    const totalAdvance = customers
      ?.filter(c => c.balance > 0)
      .reduce((s, c) => s + c.balance, 0) ?? 0

    const topDueCustomers = [...(customers ?? [])]
      .filter(c => c.balance < 0)
      .sort((a, b) => a.balance - b.balance)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        phone: c.phone,
        due: Math.abs(c.balance),
        store: stores?.find(s => s.id === c.store_id)?.name,
      }))

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlySales = (transactions ?? [])
      .filter(tx => tx.type === 'sale' && new Date(tx.date) >= monthStart)
      .reduce((s, tx) => s + tx.amount, 0)

    const monthlyPayments = (transactions ?? [])
      .filter(tx => tx.type === 'payment' && new Date(tx.date) >= monthStart)
      .reduce((s, tx) => s + tx.amount, 0)

    const recentTransactions = (transactions ?? [])
      .slice(0, 20)
      .map(tx => ({
        customer: customers?.find(c => c.id === tx.customer_id)?.name,
        type: tx.type,
        amount: tx.amount,
        product: tx.product,
        date: new Date(tx.date).toLocaleDateString('en-IN'),
      }))

    // 4. System prompt
    const systemPrompt = `You are a smart business assistant for a store management app called StoreOS.
You are talking to the owner of these stores. Be concise, helpful, and specific.
Always use Indian Rupee (₹) for amounts. Keep answers under 4 sentences unless asked for a list.
If asked to generate a reminder message, write it in a friendly but firm tone.

=== BUSINESS DATA ===
Owner: ${user.email}
Stores: ${JSON.stringify(stores?.map(s => ({ name: s.name, type: s.type })))}
Total customers: ${customers?.length ?? 0}
Total outstanding due: ₹${totalDue.toLocaleString('en-IN')}
Total advance balance: ₹${totalAdvance.toLocaleString('en-IN')}

Top customers by due:
${topDueCustomers.map(c =>
  `- ${c.name} (${c.store}): ₹${c.due.toLocaleString('en-IN')} due | Phone: ${c.phone || 'N/A'}`
).join('\n')}

This month's sales: ₹${monthlySales.toLocaleString('en-IN')}
This month's payments received: ₹${monthlyPayments.toLocaleString('en-IN')}

Recent transactions:
${recentTransactions.map(tx =>
  `- ${tx.customer}: ${tx.type} ₹${tx.amount} ${tx.product ? `(${tx.product})` : ''} on ${tx.date}`
).join('\n')}

All customers:
${(customers ?? []).map(c => {
  const store = stores?.find(s => s.id === c.store_id)
  return `- ${c.name} | ${store?.name} | Balance: ₹${c.balance} | Phone: ${c.phone || 'N/A'}`
}).join('\n')}
=== END DATA ===`

    // 5. Call Groq — OpenAI-compatible API
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // free, very capable
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history ?? []).slice(-6).map((h: any) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content
    if (!reply) throw new Error('No response from AI')

    return NextResponse.json({ reply })

  } catch (err: any) {
    console.error('AI route error:', err)
    return NextResponse.json(
      { error: err.message || 'AI request failed' },
      { status: 500 }
    )
  }
}