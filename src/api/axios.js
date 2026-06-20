import axios from 'axios'

// Directly set your backend URL here
const API_BASE_URL = 'https://peerlynk-backend-67x2.onrender.com/api/v1'//'http://10.190.233.239:5000/api/v1'   // <-- change to your backend IP/port
// const API_BASE_URL = 'http://localhost:5000/api/v1'; 


const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api