import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

export default function AnalyticsIndividual() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [inputUid, setInputUid] = useState(uid || '')

  useEffect(() => {
    setInputUid(uid || '')
  }, [uid])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputUid.trim()) {
      navigate(`/individual/${inputUid.trim()}`)
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Suivi individuel
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: '#181b1f',
          color: '#f7f9fb',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxWidth: 600
        }}
      >
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="UID de l'utilisateur"
            variant="outlined"
            size="small"
            fullWidth
            value={inputUid}
            onChange={(e) => setInputUid(e.target.value)}
            placeholder="Ex: 12345"
            slotProps={{
              input: {
                style: { fontFamily: 'monospace' }
              }
            }}
          />
          <Button type="submit" variant="contained" color="primary">
            Rechercher
          </Button>
        </Box>

        {uid ? (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="subtitle2" sx={{ color: '#a1a8b6', mb: 0.5 }}>
              UID affiché :
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#5794f2' }}>
              {uid}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: '#7a828e', fontStyle: 'italic' }}>
            Aucun UID spécifié dans l'URL. Entrez un UID ci-dessus ou sélectionnez un participant.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
