import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // تم التعديل هنا لربطه بملف App.tsx بدلاً من server
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
