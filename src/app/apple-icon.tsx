import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#185FA5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="120"
          height="120"
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