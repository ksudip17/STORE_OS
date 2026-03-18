'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { addTransaction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/types'

interface Props {
  customer: Customer
  storeId: string
}

export default function AddTransactionDialog({ customer, storeId }: Props) {
  const [open, setOpen] = useState(false)
  const [txType, setTxType] = useState<'sale' | 'payment'>('sale')
  const [amount, setAmount] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [rate, setRate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const q = parseFloat(quantity)
    const r = parseFloat(rate)
    if (q > 0 && r > 0) {
      setAmount(String(Math.round(q * r)))
    }
  }, [quantity, rate])

  function handleClose() {
    setTxType('sale')
    setAmount('')
    setProduct('')
    setQuantity('')
    setRate('')
    setDescription('')
    setOpen(false)
  }

  function handleTypeChange(type: 'sale' | 'payment') {
    setTxType(type)
    setAmount('')
    setProduct('')
    setQuantity('')
    setRate('')
    setDescription('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      await addTransaction({
        customer_id: customer.id,
        type: txType,
        amount: amt,
        description: description || undefined,
        product: product || undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        rate: rate ? parseFloat(rate) : undefined,
        storeId,
      })
      toast.success(txType === 'sale' ? 'Sale recorded' : 'Payment recorded')
      handleClose()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add transaction')
    } finally {
      setSubmitting(false)
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
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">New Transaction</h2>
          <p className="text-xs text-slate-400 mt-0.5">{customer.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange('sale')}
            className={cn('py-2 rounded-lg text-sm font-medium border transition-all', txType === 'sale' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100')}
          >
            Sale (adds due)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('payment')}
            className={cn('py-2 rounded-lg text-sm font-medium border transition-all', txType === 'payment' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100')}
          >
            Payment (clears due)
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {txType === 'sale' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Product</label>
                <input
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. Rice, Sugar..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Rate (Rs.)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Amount (Rs.)
              {txType === 'sale' && <span className="text-slate-400 font-normal ml-1">(auto-calculated)</span>}
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional note"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <button
              type="submit"
              disabled={submitting}
              className={cn('flex-1 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60', txType === 'sale' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600')}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {txType === 'sale' ? 'Record Sale' : 'Record Payment'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
