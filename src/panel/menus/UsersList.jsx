import { useState, useEffect, useCallback } from 'react'
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
  { field: 'team', headerName: 'Groupe', width: 170, sortable: false, renderCell: params => (
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
  { field: 'creation_date', headerName: 'Date d\'inscription', width: 180, renderCell: params => dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') }
]

const paginationModel = { page: 0, pageSize: 15 }

export default function UsersList({ refreshTrigger }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("/admin/users/list")
      setRows(response.data.users || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshTrigger])

  return (
    <>
      <Typography variant="h5" component="h5">
        Liste des participants
      </Typography>
      <Paper sx={{ mt: 3, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
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
