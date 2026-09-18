import './i18n';
import '@ant-design/v5-patch-for-react-19';
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { brandingUtils } from './utils/branding'
import { LOGO_MAIN } from './utils/assets'

const Boot = () => {
  useEffect(() => {
    brandingUtils.applyCSSVariables()

    // Set favicon to main logo
    const existing = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
    if (existing) {
      existing.href = LOGO_MAIN
    } else {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = LOGO_MAIN
      document.head.appendChild(link)
    }
  }, [])
  return <App />
}

// Head tags written by the build-time pre-render (scripts/prerender.mjs) are
// replaced by the ones React renders, so none of them ends up duplicated.
document.querySelectorAll('head [data-prerender]').forEach(node => node.remove())
if (!document.querySelector('title') && !/^\/(fr\/?)?$/.test(location.pathname)) document.title = 'Learn French with Natives'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Boot />
    </HelmetProvider>
  </StrictMode>,
)
