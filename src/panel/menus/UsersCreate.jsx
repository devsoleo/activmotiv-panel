import { useState } from 'react'
import { api } from "../../../axios"
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControl from '@mui/material/FormControl';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/fr';
import dayjs from 'dayjs'

export default function UsersCreate({ onUserAdded }) {
  const generateUID = () => crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const [uid, setUID] = useState(generateUID())
  const [isAdmin, setIsAdmin] = useState(false)
  const [creationDate, setCreationDate] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCreateAccount = async () => {
    setLoading(true)
    try {
      const payload = {
        account_uid: uid,
        account_is_admin: isAdmin ? "true" : "false"
      }

      if (creationDate && dayjs(creationDate).isValid()) {
        payload.creation_date = dayjs(creationDate).toISOString()
      }

      const response = await api.post("/admin/users/create", payload)
      console.log(response)
      alert(`Compte "${uid}" créé !`)
      setUID(generateUID())
      setIsAdmin(false)
      setCreationDate(null)
      if (onUserAdded) {
        onUserAdded()
      }
    } catch (error) {
      console.log(error)
      alert("Une erreur est survenue !")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
      <Typography variant="h6" component="h2" sx={{ mb: 2.5, fontWeight: 600 }}>
        Ajouter un participant
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
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
            sx={{ minWidth: 250 }}
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
        />

        <Button
          variant="contained"
          id="login"
          onClick={handleCreateAccount}
          disabled={loading}
          sx={{ height: 56, px: 3, ml: 'auto' }}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </Box>
    </Paper>
  )
}
