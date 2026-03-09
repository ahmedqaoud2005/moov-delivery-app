import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './server' // هذا يشير لملف الأكواد الخاص بك
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
