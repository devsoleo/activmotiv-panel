import { useState } from 'react'
import { api, ENVIRONMENTS_SETTINGS, getEnvSettings } from '../../axios'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'

export default function Login({ login }) {
  const [environnement, setEnvironnement] = useState(() => {
    return localStorage.getItem('environment') || 'production'
  })
  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEnvChange = (e) => {
    const targetEnv = e.target.value
    localStorage.setItem('environment', targetEnv)
    setEnvironnement(targetEnv)

    const token = localStorage.getItem('accessToken_' + targetEnv)
    if (token && login) {
      login(token, targetEnv)
    }
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/admin/auth/login', { uid, password })
      if (response.data?.accessToken) {
        if (login) {
          login(response.data.accessToken, environnement)
        } else {
          localStorage.setItem('accessToken_' + environnement, response.data.accessToken)
          localStorage.setItem('environment', environnement)
          window.location.reload()
        }
      } else {
        setError('Réponse invalide du serveur')
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 412) {
        setError('Version client non supportée par le serveur')
      } else {
        setError(err.response?.data?.message || 'Identifiants invalides ou serveur inaccessible')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Se connecter
        </Typography>

        <form onSubmit={handleLogin}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="login-env-select-label">Environnement</InputLabel>
            <Select
              labelId="login-env-select-label"
              id="login-env-select"
              value={environnement}
              label="Environnement"
              onChange={handleEnvChange}
              renderValue={(selected) => {
                const color = getEnvSettings(selected).color || '#4caf50'
                const label = getEnvSettings(selected).label || selected
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: color,
                        boxShadow: `0 0 0 2px ${color}33`,
                        flexShrink: 0,
                      }}
                    />
                    <span>{label}</span>
                  </Box>
                )
              }}
            >
              {
                ENVIRONMENTS_SETTINGS.map((value, _) => {
                  return (
                    <MenuItem value={value.name} key={value.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: value.color,
                            boxShadow: `0 0 0 2px ${value.color}33`,
                            flexShrink: 0,
                          }}
                        />
                        <span>{value.label}</span>
                      </Box>
                    </MenuItem>
                  )
                })
              }
            </Select>
          </FormControl>

          <TextField
            label="UID"
            variant="outlined"
            fullWidth
            margin="normal"
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
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !uid || !password}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
