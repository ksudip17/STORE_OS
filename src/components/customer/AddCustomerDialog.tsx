'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, UserPlus, MapPin, Phone, User, IndianRupee } from 'lucide-react'
import { createCustomer } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function AddCustomerDialog({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [balType, setBalType] = useState<'none' | 'due' | 'advance'>('none')
  const [balAmount, setBalAmount] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [nameError, setNameError] = useState('')
  const router = useRouter()

  function handleClose() {
    setName('')
    setPhone('')
    setAddress('')
    setBalType('none')
    setBalAmount('0')
    setNameError('')
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Name is required')
      return
    }
    setNameError('')
    setSubmitting(true)
    try {
      const amount = parseFloat(balAmount) || 0
      const initialBalance =
        balType === 'due' ? -amount :
        balType === 'advance' ? amount : 0
      await createCustomer({
        store_id: storeId,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        initial_balance: initialBalance,
      })
      toast.success(name + ' added successfully!')
      handleClose()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add customer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="w-4 h-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add New Customer</h2>
              <p className="text-xs text-blue-200 mt-0.5">Fill in the customer details below</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
            <div className={cn('flex items-center gap-2.5 bg-slate-50 border rounded-lg px-3 py-2.5 transition-colors', nameError ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400')}>
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Samir Thapa"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 shrink-0">
                <span className="text-sm">NP</span>
                <span className="text-sm text-slate-600 font-medium">+977</span>
              </div>
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-blue-400 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-blue-400 transition-colors">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Thamel, Kathmandu"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Opening Balance <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
            <p className="text-xs text-slate-400">If this customer already has a balance before joining</p>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              <button type="button" onClick={() => setBalType('none')} className={cn('py-1.5 px-2 rounded-md text-xs font-medium transition-all', balType === 'none' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>Fresh Start</button>
              <button type="button" onClick={() => setBalType('due')} className={cn('py-1.5 px-2 rounded-md text-xs font-medium transition-all', balType === 'due' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700')}>Has Due</button>
              <button type="button" onClick={() => setBalType('advance')} className={cn('py-1.5 px-2 rounded-md text-xs font-medium transition-all', balType === 'advance' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700')}>Has Advance</button>
            </div>
            {balType !== 'none' && (
              <div className={cn('flex items-center gap-2.5 border rounded-lg px-3 py-2.5', balType === 'due' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                <IndianRupee className={cn('w-4 h-4 shrink-0', balType === 'due' ? 'text-red-400' : 'text-green-400')} />
                <input
                  type="number"
                  min="0"
                  value={balAmount}
                  onChange={e => setBalAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none font-medium"
                />
                <span className={cn('text-xs font-medium shrink-0', balType === 'due' ? 'text-red-500' : 'text-green-500')}>
                  {balType === 'due' ? 'Customer owes you' : 'Customer paid ahead'}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Add Customer
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
