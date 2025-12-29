import { useState, useEffect } from 'react'
import Panel from './panel/Panel.jsx'
import Login from './auth/Login.jsx'

function AuthProvider() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"))
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (accessToken != null && accessToken != "") {
      localStorage.setItem("accessToken", accessToken)
      setIsLoggedIn(true)
    } else {
      localStorage.removeItem("accessToken")
      setIsLoggedIn(false)
    }
  }, [accessToken])

  return (
    <>
      {!isLoggedIn ? (
        <Login login={(token) => setAccessToken(token)} />
      ): (
        <Panel logout={() => setAccessToken(null)} />
      )}
  </>
  )
}

export default AuthProvider
