'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  Users,
  ArrowLeftRight,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Stores',
    href: '/stores',
    icon: Store,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const displayName = user.user_metadata?.full_name || user.email || 'User'
  const avatarUrl = user.user_metadata?.avatar_url
  const initials = getInitials(displayName)

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">StoreOS</p>
            <p className="text-xs text-slate-400">Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-medium text-slate-400 px-2 mb-2 uppercase tracking-wider">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all group',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn(
                'w-4 h-4 shrink-0',
                isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
              )} />
              {item.label}
              {isActive && (
                <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-7 h-7 rounded-full shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-blue-600">
                {initials}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      </div>
    </aside>
  )
}