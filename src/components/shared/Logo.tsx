import { cn } from '@/lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: 20,
  md: 28,
  lg: 36,
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export default function Logo({
  size = 'md',
  showText = true,
  className,
}: Props) {
  const px = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="52" height="52" rx="14" fill="#185FA5" />
        <path
          d="M13 32 L26 15 L39 32"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M9 36 L43 36"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="26" cy="15" r="3.5" fill="#FAC775" />
      </svg>

      {showText && (
        <div>
          <p className={cn('font-semibold text-slate-900 leading-none', textSizes[size])}>
            StoreOS
          </p>
          {size === 'lg' && (
            <p className="text-xs text-slate-400 leading-none mt-0.5">
              Store Management
            </p>
          )}
        </div>
      )}
    </div>
  )
}