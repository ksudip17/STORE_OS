'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { addTransaction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/types'

const schema = z.object({
  type: z.enum(['sale', 'payment']),
  amount: z.coerce.number().positive('Amount must be positive'),
  product: z.string().max(100).optional(),
  quantity: z.coerce.number().positive().optional(),
  rate: z.coerce.number().positive().optional(),
  description: z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  customer: Customer
  storeId: string
}

export default function AddTransactionDialog({ customer, storeId }: Props) {
  const [open, setOpen] = useState(false)
  const [txType, setTxType] = useState<'sale' | 'payment'>('sale')
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
    defaultValues: { type: 'sale' },
  })

  // Auto-calculate amount from qty * rate
  const qty = watch('quantity')
  const rate = watch('rate')

  useEffect(() => {
    if (qty && rate) {
      setValue('amount', parseFloat((qty * rate).toFixed(2)))
    }
  }, [qty, rate, setValue])

  function handleTypeChange(type: 'sale' | 'payment') {
    setTxType(type)
    setValue('type', type)
    reset({ type })
  }

  async function onSubmit(data: FormData) {
    try {
      await addTransaction({
        customer_id: customer.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        product: data.product,
        quantity: data.quantity,
        rate: data.rate,
        storeId,
      })
      toast.success(
        data.type === 'sale'
          ? `Sale of ₹${data.amount} recorded`
          : `Payment of ₹${data.amount} recorded`
      )
      reset({ type: txType })
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add transaction')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 w-full">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Transaction — {customer.name}</DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleTypeChange('sale')}
            className={cn(
              'py-2 rounded-lg text-sm font-medium border transition-all',
              txType === 'sale'
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            )}
          >
            Sale (adds due)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('payment')}
            className={cn(
              'py-2 rounded-lg text-sm font-medium border transition-all',
              txType === 'payment'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            )}
          >
            Payment (clears due)
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('type')} value={txType} />

          {txType === 'sale' && (
            <>
              <div className="space-y-1.5">
                <Label>Product</Label>
                <Input
                  placeholder="e.g. Rice, Sugar..."
                  {...register('product')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    {...register('quantity')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rate (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    {...register('rate')}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>
              Amount (₹)
              {txType === 'sale' && (
                <span className="text-slate-400 font-normal ml-1">
                  (auto-calculated)
                </span>
              )}
            </Label>
            <Input
              type="number"
              placeholder="0"
              step="0.01"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Note{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Optional note"
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); setOpen(false) }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                txType === 'sale'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              )}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {txType === 'sale' ? 'Record Sale' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}