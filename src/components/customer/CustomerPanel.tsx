'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatCurrency, getInitials, cn } from '@/lib/utils'
import { addFullPayment } from '@/lib/actions/transactions'
import AddTransactionDialog from './AddTransactionDialog'
import { Phone, MapPin, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Customer, Transaction } from '@/lib/types'
import { format } from 'date-fns'
import DownloadPDFButton from './CustomerPDF'
import { Pencil } from 'lucide-react'
import EditCustomerDialog from './EditCustomerDialog'



interface Props {
  customer: Customer
  transactions: Transaction[]
  storeId: string
  store: Store          
  onClose: () => void
}

export default function CustomerPanel({
  customer,
  transactions,
  storeId,
  store,          
  onClose,
}: Props) {
  const router = useRouter()
  const [paying, setPaying] = useState(false)

  const isDue     = customer.balance < 0
  const isAdvance = customer.balance > 0

  async function handleFullPay() {
    setPaying(true)
    try {
      await addFullPayment(customer.id, customer.balance, storeId)
      toast.success('Balance cleared!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
      <span className="text-sm font-semibold text-blue-600">
        {getInitials(customer.name)}
      </span>
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-900">
        {customer.name}
      </p>
      <p className="text-xs text-slate-400">Customer details</p>
    </div>
  </div>

  {/* Right side — edit + close */}
  <div className="flex items-center gap-1">
    <EditCustomerDialog customer={customer} storeId={storeId} />
    <button
      onClick={onClose}
      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <X className="w-4 h-4 text-slate-400" />
    </button>
  </div>
</div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Contact info */}
        <div className="space-y-2">
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {customer.phone}
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {customer.address}
            </div>
          )}
        </div>

        {/* Balance box */}
        <div className={cn(
          'rounded-xl p-4 text-center',
          isDue     && 'bg-red-50',
          isAdvance && 'bg-green-50',
          !isDue && !isAdvance && 'bg-slate-50',
        )}>
          <p className="text-xs font-medium mb-1 text-slate-500">
            {isDue ? 'Outstanding Due' : isAdvance ? 'Advance Balance' : 'Account Status'}
          </p>
          <p className={cn(
            'text-3xl font-bold',
            isDue     && 'text-red-600',
            isAdvance && 'text-green-600',
            !isDue && !isAdvance && 'text-slate-400',
          )}>
            {customer.balance === 0
              ? 'Clear'
              : formatCurrency(customer.balance)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
  <AddTransactionDialog customer={customer} storeId={storeId} />
  {isDue && (
    <Button
      onClick={handleFullPay}
      disabled={paying}
      variant="outline"
      size="sm"
      className="w-full border-green-200 text-green-600 hover:bg-green-50"
    >
      {paying
        ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
        : null}
      Full Pay — Clear Balance
    </Button>
  )}
  {/* PDF export — needs store prop */}
  <DownloadPDFButton
    customer={customer}
    transactions={transactions}
    store={store}
  />
</div>

        {/* Transaction history */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            History ({transactions.length})
          </p>

          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                >
                  {/* Dot */}
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    tx.type === 'sale' ? 'bg-red-400' : 'bg-green-400'
                  )} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {tx.description || tx.product || tx.type}
                    </p>
                    {tx.product && tx.quantity && tx.rate && (
                      <p className="text-xs text-slate-400">
                        {tx.quantity} × ₹{tx.rate}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(tx.date), 'dd MMM yyyy')}
                    </p>
                  </div>

                  <p className={cn(
                    'text-sm font-semibold shrink-0',
                    tx.type === 'sale' ? 'text-red-500' : 'text-green-500'
                  )}>
                    {tx.type === 'sale' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}