import { useState } from 'react'
import { api } from "../../../axios"
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout'
import FormControl from '@mui/material/FormControl';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Checkbox } from '@mui/material';
import {FormControlLabel} from '@mui/material';

export default function UsersCreate() {
  const generateUID = () => crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const [uid, setUID] = useState(generateUID())

  const handleCreateAccount = async () => {
    await api.post("/admin/users/create", { account_uid: uid, account_is_admin: "false" })
    .then((response) => {
      console.log(response)
      alert(`Compte "${uid}" créé !`)
    })
    .catch((error) => {
      console.log(error)
      alert("Une erreur est survenue !")
    })
  }

  return (
    <>
      <Typography variant="h5" component="h5">
        Ajouter un participant
      </Typography>

      <Box sx={{ mt: 3, mb: 2 }}>
        <FormControl sx={{ mb: 1, mr: 10, width: '25ch' }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">UID</InputLabel>
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
        <FormControlLabel control={<Checkbox />} label="Administrateur" />
        <Button variant="outlined" id="login" onClick={handleCreateAccount}>Ajouter</Button>
      </Box>
    </>
  )
}