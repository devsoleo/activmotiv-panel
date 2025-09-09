import { useState, useEffect } from 'react'
import { api } from '../../axios'
import Panel from '../tabs/Panel.jsx'

function Login() {
  const [uid, setUID] = useState("")
  const [password, setPassword] = useState("")

  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"))
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (accessToken != null && accessToken != "") {
      localStorage.setItem("accessToken", accessToken)
    } else {
      localStorage.removeItem("accessToken")
    }

    if (accessToken) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [accessToken])

  const handleLogin = async () => {
    await api.post("/auth/login", { uid, password })
    .then((response) => {
      setAccessToken(response.data.accessToken)
    })
    .catch((error) => {
      alert("Une erreur est survenue !")
      console.log(error)
    })
  }

  const handleLogout = () => setAccessToken(null)

  return (
    <>
      {!isLoggedIn ? (
        <div id="form-login">
          <h4>Se connecter</h4>
          <input type="text" placeholder="UID" value={uid} onChange={(v) => setUID(v.target.value)} />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(v) => setPassword(v.target.value)}/>
          <input type="button" value="Se connecter" onClick={handleLogin} />
        </div>
      ): (
        <>
          <button  onClick={handleLogout}>Se déconnecter</button>
          <Panel />
        </>
      )}
  </>
  )
}

export default Login
