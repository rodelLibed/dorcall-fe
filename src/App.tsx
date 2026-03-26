import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AgentDashboard from './pages/AgentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AgentLogin from './pages/AgentLogin'
import AdminLogin from './pages/AdminLogin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/agent-login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
