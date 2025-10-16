import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Footer, Header } from './lib/components/layout'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className='flex flex-col justify-between min-h-screen'>
        <Header />
        <App />
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>
)
