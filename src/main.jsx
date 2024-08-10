import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
