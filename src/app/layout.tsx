import './globals.css'
import Header from '../components/layout/header/Header'
import Footer from '../components/layout/footer/Footer'
import Script from 'next/script'
import { ReactQueryProvider } from '../providers/ReactQueryProvider'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'TOREDCO',
  description: 'TOREDCO Website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5QFWM3S7ZQ"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5QFWM3S7ZQ', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </main>
        <Footer />
      </body>
    </html>
  )
}
