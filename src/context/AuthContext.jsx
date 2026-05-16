import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const adminData = localStorage.getItem('adminData')
    if (token && adminData) {
      setAdmin(JSON.parse(adminData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/admin/login', { email, password })
      const { token, admin } = res.data
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminData', JSON.stringify(admin))
      setAdmin(admin)
      toast.success('Logged in successfully')
      return true
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    setAdmin(null)
    toast.success('Logged out')
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}