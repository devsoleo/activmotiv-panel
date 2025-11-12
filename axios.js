import axios from 'axios'
import { version } from './package.json'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_PUBLIC_URL,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client-Version': version
   }
})

api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken")

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

api.defaults.timeout = 2000
