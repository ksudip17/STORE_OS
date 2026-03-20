import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#185FA5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Rooftop lines */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 52 52"
          fill="none"
        >
          <path
            d="M13 32 L26 15 L39 32"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 36 L43 36"
            stroke="white"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <circle cx="26" cy="15" r="4" fill="#FAC775" />
        </svg>
      </div>
    ),
    { ...size }
  )
}