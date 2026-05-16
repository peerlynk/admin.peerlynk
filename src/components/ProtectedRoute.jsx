import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  return admin ? children : <Navigate to="/login" replace />
}