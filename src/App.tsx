import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileFlow } from './pages/MobileFlow'
import { Dashboard } from './pages/Dashboard'
import { Groups } from './pages/Groups'
import { Admin } from './pages/Admin'
import { Speakers } from './pages/Speakers'
import { RunOfShow } from './pages/RunOfShow'
import { Demos } from './pages/Demos'
import { PrevDashboard } from './pages/PrevDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileFlow />} />
        <Route path="/join" element={<MobileFlow />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/demos" element={<Demos />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/run-of-show" element={<RunOfShow />} />
        {/* Read-only archive of a previous event's dashboard */}
        <Route path="/prev/:archiveId/dashboard" element={<PrevDashboard />} />
        <Route path="/prev/:archiveId" element={<PrevDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
