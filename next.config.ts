import type { NextConfig } from "next";

const securityHeaders = [
  // Clickjacking protection
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIME-sniffing protection
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer policy — don't leak the origin/session on outbound links
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Prevent browsers from ever downgrading the connection
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Permissions policy — restrict browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Basic Content-Security-Policy. Uses 'unsafe-inline' for Next's style
  // injection and Google font styles, with no remote script sources.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
