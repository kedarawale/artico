import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}
        <div id="hidden-clustrmap" style={{ display: 'none' }}>
          <a href="https://clustrmaps.com/site/1c497"  title="ClustrMaps"><img src="//www.clustrmaps.com/map_v2.png?d=47DeUMbqLl8unnmGyeUv9ZLAOvrFHBHJwELbh81ZTbY&cl=ffffff" /></a>
        </div>
      </body>
    </html>
  )
}
