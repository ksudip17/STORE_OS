import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Nepali Rupee formatter — fixes ₹ vs Rs. inconsistency
export function formatCurrency(amount: number): string {
  return 'Rs. ' + Math.abs(amount).toLocaleString('en-NP')
}

export function formatCurrencyShort(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 100000) return `Rs. ${(abs / 100000).toFixed(1)}L`
  if (abs >= 1000) return `Rs. ${(abs / 1000).toFixed(1)}K`
  return `Rs. ${abs}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getBalanceStatus(balance: number) {
  if (balance < 0) return { label: 'Due', color: 'destructive' as const }
  if (balance > 0) return { label: 'Advance', color: 'default' as const }
  return { label: 'Clear', color: 'secondary' as const }
}