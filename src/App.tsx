import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AgentDashboard from './pages/AgentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AgentLogin from './pages/AgentLogin'
import AdminLogin from './pages/AdminLogin'
import { CallProvider } from './context/CallContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/agent" element={
          <ProtectedRoute requiredRole="agent">
            <CallProvider>
              <AgentDashboard />
            </CallProvider>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/agent-login" replace />} />
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
