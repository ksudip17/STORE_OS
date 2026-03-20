'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  BarChart2,
  Shield,
  Zap,
} from 'lucide-react'
import Logo from '@/components/shared/Logo'

const FEATURES = [
  {
    icon: TrendingDown,
    color: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Udharo Tracking',
    desc: 'Know exactly who owes you and how much — across all your stores.',
  },
  {
    icon: Sparkles,
    color: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'AI Assistant',
    desc: 'Ask "Who owes me the most?" and get instant answers in plain language.',
  },
  {
    icon: BarChart2,
    color: 'bg-purple-50',
    iconColor: 'text-purple-500',
    title: 'Analytics',
    desc: 'Monthly sales charts, top due customers, payment trends.',
  },
  {
    icon: Users,
    color: 'bg-green-50',
    iconColor: 'text-green-500',
    title: 'Multi-store',
    desc: 'Manage your Kathmandu store and Pokhara branch from one account.',
  },
  {
    icon: Shield,
    color: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Secure and Private',
    desc: 'Your data is yours only. Row-level security on every single record.',
  },
  {
    icon: Zap,
    color: 'bg-teal-50',
    iconColor: 'text-teal-500',
    title: 'Real-time Updates',
    desc: 'Balances update live — add a sale on mobile, see it on desktop instantly.',
  },
]

const RECENT_TX = [
  { name: 'Samir Thapa',   type: 'sale',    amount: 'Rs. 1,200', product: 'Sugar 10kg',   time: 'Today' },
  { name: 'Bina Maharjan', type: 'payment', amount: 'Rs. 3,500', product: 'Payment',       time: 'Yesterday' },
  { name: 'Raj Shrestha',  type: 'sale',    amount: 'Rs. 650',   product: 'Oil + Lentils', time: '2 days ago' },
  { name: 'Sita Gurung',   type: 'payment', amount: 'Rs. 2,000', product: 'Payment',       time: '3 days ago' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
  setLoading(true)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    toast.error(error.message)
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollTo('features')}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            AI-powered store management
          </div>

          <h1 className="text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight mb-4">
            Your digital khata.{' '}
            <span className="text-blue-600">Smarter than ever.</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
            Track customer credit, record sales, collect payments — across
            all your stores. Ask anything about your business in plain language.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-5 py-3 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm px-5 py-3 rounded-xl border border-slate-200 transition-colors"
            >
              See features
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Free to use · No credit card · 30 seconds setup
          </p>
        </div>

        {/* Right — app preview */}
        <div className="hidden lg:block">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <Logo size="sm" />
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-red-500 mb-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Total Due
                </p>
                <p className="text-xl font-semibold text-red-600">Rs. 47,200</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-500 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Advance
                </p>
                <p className="text-xl font-semibold text-green-600">Rs. 8,500</p>
              </div>
            </div>

            <div className="px-4 pb-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Recent transactions
              </p>
              {RECENT_TX.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                      {tx.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{tx.name}</p>
                      <p className="text-xs text-slate-400">{tx.product} · {tx.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${tx.type === 'sale' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'sale' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>

            <div className="m-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3">
              <p className="text-xs text-blue-200 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Assistant
              </p>
              <p className="text-sm text-white leading-relaxed">
                "Samir Thapa has Rs. 5,400 outstanding. No payment in the last 15 days."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              Everything you need to run your store
            </h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              Replace your physical khata with something smarter.
              All stores, all customers, one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 ${f.color} rounded-lg flex items-center justify-center mb-3`}>
                  <f.icon className={`w-4 h-4 ${f.iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              How it works
            </h2>
            <p className="text-slate-500 text-sm">3 simple steps to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign in with Google',
                desc: 'Login with your Google account. Takes less than 30 seconds, no setup needed.',
                color: 'bg-blue-600',
              },
              {
                step: '02',
                title: 'Add your store and customers',
                desc: 'Create your store. Add customers like Samir Thapa, Bina Maharjan — anyone who buys on credit.',
                color: 'bg-indigo-600',
              },
              {
                step: '03',
                title: 'Track sales and payments',
                desc: 'Record a sale or payment in seconds. Balance updates automatically. AI answers your questions.',
                color: 'bg-purple-600',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-semibold text-sm">{item.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Start for free today
          </h2>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Physical khata gets lost or damaged. Your digital khata
            never will — and AI helps you understand it better.
          </p>
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Get started free with Google
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
                  <rect width="52" height="52" rx="14" fill="#185FA5"/>
                  <path d="M13 32 L26 15 L39 32" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M9 36 L43 36" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="26" cy="15" r="3.5" fill="#FAC775"/>
                </svg>
                <span className="text-white font-semibold">StoreOS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A smart store management system for shop owners.
                Track credit, manage customers, understand your business.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Product
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Features',     id: 'features' },
                  { label: 'How it works', id: 'how-it-works' },
                  { label: 'Dashboard',    id: '' },
                  { label: 'Analytics',    id: '' },
                ].map(item => (
                  <li key={item.label}>
                    <button
                      onClick={() => item.id ? scrollTo(item.id) : signInWithGoogle()}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Support
              </p>
              <ul className="space-y-2.5">
                {['Contact', 'Privacy Policy', 'Terms of Use', 'Report a bug'].map(item => (
                  <li key={item}>
                    <button className="text-xs text-slate-400 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developer */}
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Developer
              </p>
              <ul className="space-y-2.5">
                {['GitHub Repo', 'Tech Stack', 'LinkedIn', 'Portfolio'].map(item => (
                  <li key={item}>
                    <button className="text-xs text-slate-400 hover:text-white transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © 2026 StoreOS · Built in Nepal 🇳🇵
            </p>
            <p className="text-xs text-slate-500">
              Built with Next.js · Supabase · Groq AI
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}