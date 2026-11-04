import { useState, useEffect } from 'react'
import Panel from './panel/Panel.jsx'
import Login from './auth/Login.jsx'
import { getActiveToken } from '../axios'

function AuthProvider() {
  const [token, setToken] = useState(() => getActiveToken())
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getActiveToken()))

  useEffect(() => {
    setIsLoggedIn(Boolean(token))
  }, [token])

  const handleLogin = (newToken, envName) => {
    const env = envName || localStorage.getItem('environment') || 'production'
    localStorage.setItem('accessToken_' + env, newToken)
    localStorage.setItem('environment', env)
    setToken(newToken)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    const env = localStorage.getItem('environment') || 'production'
    localStorage.removeItem('accessToken_' + env)
    setToken(null)
    setIsLoggedIn(false)
  }

  return (
    <>
      {!isLoggedIn ? (
        <Login login={handleLogin} />
      ) : (
        <Panel logout={handleLogout} />
      )}
    </>
  )
}

export default AuthProvider
