import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileFlow } from './pages/MobileFlow'
import { Dashboard } from './pages/Dashboard'
import { Groups } from './pages/Groups'
import { Admin } from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileFlow />} />
        <Route path="/join" element={<MobileFlow />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
