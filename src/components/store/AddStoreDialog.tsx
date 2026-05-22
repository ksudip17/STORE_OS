'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, Store } from 'lucide-react'
import { createStore } from '@/lib/actions/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { StoreType } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, 'Store name is required').max(50),
  type: z.enum(['Retail', 'Wholesale', 'Online', 'Service']),
  description: z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

export default function AddStoreDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Retail' },
  })

  async function onSubmit(data: FormData) {
    try {
      await createStore(data)
      toast.success(`"${data.name}" store created!`)
      reset()
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create store')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Store
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 overflow-hidden">

        {/* Fix: DialogTitle for accessibility */}
        <DialogTitle className="sr-only">Create New Store</DialogTitle>

        {/* Fix: consistent header matching AddCustomerDialog style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Create New Store
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Add a new store to your account
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Store Name
            </Label>
            <Input
              placeholder="e.g. Main Branch"
              className="bg-slate-50 border-slate-200 focus:border-blue-400"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Store Type
            </Label>
            <select
              {...register('type')}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-blue-400 transition-colors"
            >
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Online">Online</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Description{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Brief description of this store"
              className="bg-slate-50 border-slate-200 focus:border-blue-400"
              {...register('description')}
            />
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Create Store
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}