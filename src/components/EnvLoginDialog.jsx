import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'
import { getEnvSettings } from '../../axios'
import { version } from '../../package.json'

export default function EnvLoginDialog({ name, open, onClose, onSuccess }) {
  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setUid('')
      setPassword('')
      setError('')
    }
  }, [open])

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    const targetUrl = getEnvSettings(name).url || getEnvSettings('production').url

    try {
      const response = await axios.post(
        `${targetUrl}/admin/auth/login`,
        { uid, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Version': version,
          },
          timeout: 5000,
        }
      )

      if (response.data?.accessToken) {
        localStorage.setItem('accessToken_' + name, response.data.accessToken)
        localStorage.setItem('environment', name)
        onSuccess(response.data.accessToken, name)
      } else {
        setError('Réponse invalide du serveur')
      }
    } catch (err) {
      console.error('Erreur authentification :', err)
      if (err.response?.status === 412) {
        setError('Version client non supportée par le serveur')
      } else {
        setError(err.response?.data?.message || 'Identifiants invalides ou serveur inaccessible')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setUid('')
    setPassword('')
    onClose()
  }

  const label = getEnvSettings(name)?.label || name || 'Environnement'

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleLogin}>
        <DialogTitle>Connexion à l'environnement : {label}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Veuillez entrer vos identifiants pour accéder à l'environnement {label}.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="UID"
              variant="outlined"
              fullWidth
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              disabled={loading}
              autoFocus
              required
            />
            <TextField
              label="Mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !uid || !password}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
