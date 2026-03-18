'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react'
import { updateStore, deleteStore } from '@/lib/actions/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Store } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, 'Required').max(50),
  type: z.enum(['Retail', 'Wholesale', 'Online', 'Service']),
  description: z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

export default function StoreActionsMenu({ store }: { store: Store }) {
  const [editOpen, setEditOpen]       = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: store.name,
      type: store.type as any,
      description: store.description ?? '',
    },
  })

  async function onEdit(data: FormData) {
    try {
      await updateStore(store.id, data)
      toast.success('Store updated')
      setEditOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function onDelete() {
    if (confirmText !== store.name) return
    setDeleting(true)
    try {
      await deleteStore(store.id)
      toast.success(`"${store.name}" deleted`)
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Edit Store
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-500 focus:text-red-500 focus:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete Store
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEdit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Store Name</Label>
              <Input {...register('name')} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select
                {...register('type')}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Retail</option>
                <option>Wholesale</option>
                <option>Online</option>
                <option>Service</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input {...register('description')} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium mb-1">
                This will permanently delete:
              </p>
              <ul className="text-sm text-red-600 space-y-0.5 list-disc list-inside">
                <li>The store "{store.name}"</li>
                <li>All customers in this store</li>
                <li>All transaction history</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <Label>
                Type <span className="font-semibold">{store.name}</span> to confirm
              </Label>
              <Input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={store.name}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setDeleteOpen(false); setConfirmText('') }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== store.name || deleting}
                onClick={onDelete}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete Forever
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}