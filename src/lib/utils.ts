import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Shadcn's cn helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatter for Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

// Short currency (₹1.2K, ₹3.4L)
export function formatCurrencyShort(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}K`
  return `₹${abs}`
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Balance status
export function getBalanceStatus(balance: number) {
  if (balance < 0) return { label: 'Due', color: 'destructive' as const }
  if (balance > 0) return { label: 'Advance', color: 'default' as const }
  return { label: 'Clear', color: 'secondary' as const }
}