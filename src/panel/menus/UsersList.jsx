import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import { Chip } from '@mui/material'
import Typography from '@mui/material/Typography'
import { api } from '../../../axios'
import dayjs from 'dayjs'

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'uid', headerName: 'UID', width: 170, sortable: false, renderCell: params => (
      <span style={{ fontFamily: 'monospace' }}>
        {params.value}
      </span>
    ) },
  {
    field: 'admin',
    headerName: 'Admin',
    width: 70,
    renderCell: params => {
      const isAdmin = params.value

      return (
        <Chip
          label={isAdmin ? 'Oui' : 'Non'}
          color={isAdmin ? 'primary' : 'default'}
          size="small"
        />
      )
    }
  },
  { field: 'last_login', headerName: 'Dernière connexion', width: 180, renderCell: params => dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') },
  { field: 'creation_date', headerName: 'Date d\'inscription', width: 180, renderCell: params => dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') },
  { field: 'notification_token', headerName: 'Inscrit aux notifications', width: 180, renderCell: params => {
      const isAdmin = params.value

      return (
        <Chip
          label={isAdmin ? 'Oui' : 'Non'}
          color={isAdmin ? 'primary' : 'default'}
          size="small"
        />
      )
    }
  }
]

let rows = []

await api.get("/admin/users/list")
.then((response) => {
  rows = response.data.users
})
.catch((error) => {
  console.log(error)
})

const paginationModel = { page: 0, pageSize: 15 }

export default function UsersList() {
  return (
    <>
      <Typography variant="h5" component="h5">
        Liste des participants
      </Typography>
      <Paper sx={{ mt: 3, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel },
            sorting: {
              sortModel: [{ field: 'id', sort: 'desc' }]
            }
          }}
          pageSizeOptions={[5, 10, 20, 30]}
          checkboxSelection
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            }
          }}
        />
      </Paper>
    </>
  )
}