import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-bebas-neue'
});

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"],
  variable: '--font-roboto-mono'
});

export const metadata: Metadata = {
  title: 'MoveViz - 이사 당일 현장 지원 앱',
  description: '가구 반출 순서부터 트럭 적재까지 AI가 안내합니다',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF7F50',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="light">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className={`${bebasNeue.variable} ${robotoMono.variable} font-sans antialiased bg-[#FFF5F1] text-[#2D3436] min-h-screen`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
