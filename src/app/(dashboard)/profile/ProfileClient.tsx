'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'
import { LogOut, User, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Props {
  user: SupabaseUser
  profile: any
}

export default function ProfileClient({ user, profile }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const displayName = user.user_metadata?.full_name || user.email || 'User'
  const avatarUrl   = user.user_metadata?.avatar_url
  const initials    = getInitials(displayName)

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Profile</h1>

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {initials}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {displayName}
            </h2>
            <p className="text-sm text-slate-500">Store Owner</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-slate-700">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <User className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Auth Provider</p>
              <p className="text-sm text-slate-700 capitalize">
                {user.app_metadata?.provider ?? 'Google'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Member Since</p>
              <p className="text-sm text-slate-700">
                {format(new Date(user.created_at), 'dd MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Account Actions
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Sign out from all devices
        </p>
        <Button
          variant="outline"
          className="border-red-200 text-red-500 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}