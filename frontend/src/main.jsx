import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 1. Importa BrowserRouter
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Envuelve tu <App /> con <BrowserRouter> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
