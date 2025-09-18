import '@ant-design/v5-patch-for-react-19';
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { brandingUtils } from './utils/branding'

const Boot = () => {
  useEffect(() => {
    brandingUtils.applyCSSVariables()
  }, [])
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
)
