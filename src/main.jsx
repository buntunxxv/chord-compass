import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import UpgradePage from './UpgradePage'
import AdminFeedback from './AdminFeedback'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
