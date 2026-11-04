import { useState } from 'react'
import { api } from "../../../../axios"
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import FormControl from '@mui/material/FormControl'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import 'dayjs/locale/fr'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function UsersCreate() {
  const generateUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().replaceAll('-', '').slice(0, 8)
    }
    return Math.random().toString(36).substring(2, 10)
  }

  const [uid, setUID] = useState(generateUID())
  const [isAdmin, setIsAdmin] = useState(false)
  const [creationDate, setCreationDate] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCreateAccount = async () => {
    setLoading(true)
    try {
      const dateIso = (creationDate && dayjs(creationDate).isValid()) ? dayjs(creationDate).toISOString() : dayjs().tz().toISOString()
      await api.post("/admin/users/create", {
        account_uid: uid,
        account_is_admin: isAdmin ? "true" : "false",
        creation_date: dateIso
      })

      alert(`Compte "${uid}" créé !`)

      setUID(generateUID())
      setIsAdmin(false)
      setCreationDate(null)
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.error || "Une erreur est survenue lors de la création du compte."
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2 }} elevation={1}>
      <Typography variant="h6" component="h2" sx={{ mb: 2.5, fontWeight: 600 }}>
        Ajouter un participant
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 2.5 }
        }}
      >
        <FormControl variant="outlined" sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' }, minWidth: { xs: '100%', sm: 180 } }}>
          <InputLabel htmlFor="uid">UID</InputLabel>
          <OutlinedInput
            id="uid"
            value={uid}
            disabled
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setUID(generateUID())}
                >
                  <RotateLeftIcon />
                </IconButton>
              </InputAdornment>
            }
            label="UID"
          />
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
          <DateTimePicker
            label="Date (optionnel)"
            value={creationDate}
            onChange={(newValue) => setCreationDate(newValue)}
            slotProps={{
              field: { clearable: true }
            }}
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 220px' }, minWidth: { xs: '100%', sm: 220 } }}
          />
        </LocalizationProvider>

        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          }
          label="Administrateur"
          sx={{ my: { xs: 0.5, sm: 0 } }}
        />

        <Button
          variant="contained"
          id="login"
          onClick={handleCreateAccount}
          disabled={loading}
          sx={{
            height: 56,
            px: 4,
            width: { xs: '100%', sm: 'auto' },
            ml: { sm: 'auto' }
          }}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </Box>
    </Paper>
  )
}
