import type { Metadata, Viewport } from 'next'

// El admin (y su login) se puede instalar como app. El manifiesto se enlaza solo desde
// esas páginas, así el sitio público no ofrece instalación. Sin service worker: no hay
// modo offline, la app necesita conexión igual que el panel en el navegador.
export const adminPwaMetadata: Metadata = {
  manifest: '/manifest-admin.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'ECA Admin',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/pwa/apple-touch-icon.png',
  },
}

export const adminViewport: Viewport = {
  themeColor: '#0d1f3c',
}
