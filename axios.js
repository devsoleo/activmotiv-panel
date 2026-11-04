import axios from 'axios'
import { version } from './package.json'

const DEFAULT_ENV = 'production'

export const ENVIRONMENTS_SETTINGS = [
  { name: 'production', url: 'https://activmotiv.fr', color: '#4caf50', label: 'Production' },
  { name: 'preprod', url: 'https://preprod.activmotiv.fr', color: '#ff9800', label: 'Preprod' },
  ...(import.meta.env.DEV ? [{ name: 'development', url: 'http://localhost:3000', color: '#2196f3', label: 'Development' }] : []),
]

export const getEnvSettings = (name) => ENVIRONMENTS_SETTINGS.find((e) => e.name === name)

export const getBaseUrl = () => {
  const env = localStorage.getItem('environment') || DEFAULT_ENV
  return (getEnvSettings(env) ?? getEnvSettings(DEFAULT_ENV)).url
}

export const getActiveToken = () => {
  const env = localStorage.getItem('environment') || 'production'
  return localStorage.getItem('accessToken_' + env)
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': version
   }
})

api.interceptors.request.use(async (config) => {
  config.baseURL = getBaseUrl()
  const token = getActiveToken()

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  } else {
    delete config.headers['Authorization']
  }

  return config
})
