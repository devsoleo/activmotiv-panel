import { useState } from 'react'
import { api } from "../../axios"

function Panel() {
  const generateUID = () => crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const [uid, setUID] = useState(generateUID())

  const handleCreateAccount = async () => {
    await api.post("/admin/create-account", { account_uid: uid, account_is_admin: "false" })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  return (
    <>
      <div id="form-create_account">
        <h4>Création de compte</h4>
        <input type="text" id="uid" placeholder="UID" value={uid} disabled />
        <input type="button" value="Générer le UID" onClick={() => setUID(generateUID())} />
        <input type="button" id="login" value="Créer le compte" onClick={handleCreateAccount} />
      </div>
    </>
  )
}

export default Panel
