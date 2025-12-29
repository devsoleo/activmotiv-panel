import { useState } from 'react'
import { api } from '../../axios'

function Login({ login }) {
  const [uid, setUID] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    await api.post("/admin/auth/login", { uid, password })
    .then((response) => {
      login(response.data.accessToken)
    })
    .catch((error) => {
      alert("Une erreur est survenue !")
      console.log(error)
    })
  }

  return (
    <>
      <div id="form-login">
        <h4>Se connecter</h4>
        <input type="text" placeholder="UID" value={uid} onChange={(v) => setUID(v.target.value)} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(v) => setPassword(v.target.value)}/>
        <input type="button" value="Se connecter" onClick={handleLogin} />
      </div>
  </>
  )
}

export default Login
