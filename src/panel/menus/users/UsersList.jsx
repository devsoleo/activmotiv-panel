import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import { Chip } from '@mui/material'
import Typography from '@mui/material/Typography'
import { api } from '../../../../axios'
import dayjs from 'dayjs'

const paginationModel = { page: 0, pageSize: 15 }

function UserEndDateCell({ userId }) {
  const [endDate, setEndDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    api.get(`/admin/users/${userId}/end-date`)
      .then(res => {
        if (isMounted && res.data?.endDate) {
          setEndDate(res.data.endDate)
        }
      })
      .catch(err => {
        console.error("Erreur récupération date de fin:", err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [userId])

  if (loading) return <span style={{ color: '#9e9e9e' }}>...</span>
  if (!endDate) return <span>N/A</span>

  return <span>{dayjs(endDate).format('DD/MM/YYYY')}</span>
}

export default function UsersList({ refreshTrigger }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'uid', headerName: 'UID', width: 150, sortable: false, renderCell: params => (
        <Link
          to={`/individual/${params.value}`}
          style={{ fontFamily: 'monospace', color: '#5794f2', textDecoration: 'none' }}
        >
          {params.value}
        </Link>
    ) },
    {
      field: 'admin',
      headerName: 'Admin',
      width: 80,
      renderCell: params => {
        const isAdmin = params.row.team == 0

        return (
          <Chip
            label={isAdmin ? 'Oui' : 'Non'}
            color={isAdmin ? 'primary' : 'default'}
            size="small"
          />
        )
      }
    },
    {
      field: 'group',
      headerName: 'Groupe',
      width: 80,
      renderCell: params => {
        return (
          <span style={{ fontFamily: 'monospace' }}>
            {(params.row.team > 0) ? params.row.team : '-'}
          </span>
        )
      }
    },
    { field: 'last_login', headerName: 'Dernière connexion', width: 170, renderCell: params => params.value ? dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') : 'Jamais' },
    { field: 'creation_date', headerName: 'Date d\'inscription', width: 170, renderCell: params => params.value ? dayjs(params.value).format('HH:mm:ss DD/MM/YYYY') : 'N/A' },
    {
      field: 'end_date',
      headerName: 'Date de fin',
      width: 170,
      sortable: false,
      renderCell: params => {
        return (
          <>
            {(params.row.team > 0) ? <UserEndDateCell userId={params.row.id} /> : '-'}
          </>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: params => {
        const isDisable = params.row.team == -1

        return (
          <Chip
            label={isDisable ? 'Désactivé' : 'Actif'}
            color={isDisable ? 'error' : 'primary'}
            size="small"
          />
        )
      }
    }
  ]

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
          processRowUpdate={async (newRow, oldRow) => {
            if (newRow.sensor_number !== oldRow.sensor_number) {
              await api.put(`/admin/users/${newRow.id}/sensor`, { sensor_number: newRow.sensor_number })
            }
            return newRow
          }}
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
