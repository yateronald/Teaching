import { StrictMode, useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { brandingUtils } from './utils/branding'

const Boot = () => {
  useEffect(() => {
    // React now owns the page: the class that hid the pre-rendered page on app
    // routes (index.html) must not hide a public page reached later by a link.
    document.documentElement.classList.remove('app-route')
    brandingUtils.applyCSSVariables()
  }, [])
  return <App />
}

// Head tags written by the build-time pre-render (scripts/prerender.mjs) are
// replaced by the ones React renders, so none of them ends up duplicated.
document.querySelectorAll('head [data-prerender]').forEach(node => node.remove())
if (!document.querySelector('title') && document.documentElement.classList.contains('app-route')) document.title = 'Learn French with Natives'

const container = document.getElementById('root')!
const tree = (
  <StrictMode>
    <HelmetProvider>
      <Boot />
    </HelmetProvider>
  </StrictMode>
)

// A page pre-rendered for this very address (data-page, see index.html) is
// already on screen: React takes it over as it is (hydration) instead of
// drawing it a second time, so it appears as soon as the HTML arrives.
// Everything else (the signed-in app, the 404 page) is drawn by React.
const page = document.documentElement.dataset.page
if (page && page !== '*' && location.pathname.replace(/\/?$/, '/') === page && container.firstElementChild) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
