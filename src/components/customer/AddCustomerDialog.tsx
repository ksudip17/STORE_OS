'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, UserPlus, MapPin, Phone, User, IndianRupee } from 'lucide-react'
import { createCustomer } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Naam aavashyak cha').max(100),
  phone: z.string().max(15).optional(),
  address: z.string().max(200).optional(),
  openingBalanceType: z.enum(['none', 'due', 'advance']),
  openingBalanceAmount: z.coerce.number().min(0).default(0),
})

type FormData = z.infer<typeof schema>

export default function AddCustomerDialog({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const {
  register,
  handleSubmit,
  reset,
  watch,
  setValue,
  formState: { errors, isSubmitting },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    openingBalanceType: 'none',
  },
})

  const balType = watch('openingBalanceType')

  async function onSubmit(data: FormData) {
    try {
      // Calculate initial balance based on type
      let initialBalance = 0
      if (data.openingBalanceType === 'due' && data.openingBalanceAmount) {
        initialBalance = -(data.openingBalanceAmount)   // negative = due
      } else if (data.openingBalanceType === 'advance' && data.openingBalanceAmount) {
        initialBalance = data.openingBalanceAmount       // positive = advance
      }

      await createCustomer({
        store_id: storeId,
        name: data.name,
        phone: data.phone || '',
        address: data.address || '',
        initial_balance: initialBalance,
      })

      toast.success(`${data.name} customer add bhayo!`)
      reset()
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Customer add garna sakiyena')
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

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-5 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Add New Customer
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Customer details 
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Puura Naam
            </label>
            <div className={cn(
              'flex items-center gap-2.5 bg-slate-50 border rounded-lg px-3 py-2.5 transition-colors',
              errors.name ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400'
            )}>
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                {...register('name')}
                placeholder="e.g. Samir Thapa"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Phone Number
              <span className="text-slate-400 font-normal normal-case ml-1">(optional)</span>
            </label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 shrink-0">
                <span className="text-xs font-semibold text-slate-600">🇳🇵</span>
                <span className="text-sm text-slate-600 font-medium">+977</span>
              </div>
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-blue-400 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  {...register('phone')}
                  placeholder="98XXXXXXXX"
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Address
              <span className="text-slate-400 font-normal normal-case ml-1">(optional)</span>
            </label>
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-blue-400 transition-colors">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                {...register('address')}
                placeholder="e.g. Dhangadhi, Kailali"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Opening balance */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Starting Balance
              <span className="text-slate-400 font-normal normal-case ml-1">(optional)</span>
            </label>
            <p className="text-xs text-slate-400">
              If yo customer ko pahila dekhi udharo cha bhane yaha fill garnus
            </p>

            {/* Toggle */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { key: 'none',    label: 'Fresh Start', color: '' },
                { key: 'due',     label: 'Credit',   color: 'due' },
                { key: 'advance', label: 'Advance', color: 'adv' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setValue('openingBalanceType', opt.key as any)}
                  className={cn(
                    'py-1.5 px-2 rounded-md text-xs font-medium transition-all',
                    balType === opt.key
                      ? opt.key === 'due'
                        ? 'bg-red-500 text-white shadow-sm'
                        : opt.key === 'advance'
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Amount input — only when due or advance */}
            {balType !== 'none' && (
              <div className={cn(
                'flex items-center gap-2.5 border rounded-lg px-3 py-2.5 transition-colors',
                balType === 'due'
                  ? 'bg-red-50 border-red-200 focus-within:border-red-400'
                  : 'bg-green-50 border-green-200 focus-within:border-green-400'
              )}>
                <IndianRupee className={cn(
                  'w-4 h-4 shrink-0',
                  balType === 'due' ? 'text-red-400' : 'text-green-400'
                )} />
                <input
                  {...register('openingBalanceAmount')}
                  type="number"
                  placeholder="0"
                  className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none font-medium"
                />
                <span className={cn(
                  'text-xs font-medium',
                  balType === 'due' ? 'text-red-500' : 'text-green-500'
                )}>
                  {balType === 'due' ? 'Customer le tirnu cha' : 'Customer le diyeko cha'}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { reset(); setOpen(false) }}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <UserPlus className="w-4 h-4" />
              }
              Add Customer
            </button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  )
}