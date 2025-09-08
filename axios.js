import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_PUBLIC_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken")

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

api.defaults.timeout = 2000
