import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import { Chip } from '@mui/material'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { api } from '../../../../axios'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const paginationModel = { page: 0, pageSize: 15 }

export default function AlertsList() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const columns = [
    {
      field: 'uid',
      headerName: 'UID',
      width: 150,
      renderCell: params => (
        <Link
          to={`/individual/${params.value}`}
          style={{ fontFamily: 'monospace', color: '#5794f2', textDecoration: 'none', fontWeight: 'bold' }}
        >
          {params.value}
        </Link>
      )
    },
    {
      field: 'type',
      headerName: "Type d'alerte",
      width: 280,
      renderCell: params => {
        const type = params.value || ''
        let chipStyle = {}

        if (type.includes('Inactivité') || type.includes('0 ouverture')) {
          chipStyle = { backgroundColor: 'rgba(255, 82, 82, 0.15)', color: '#ff5252', border: '1px solid #ff5252' }
        } else if (type.includes('Capteur')) {
          chipStyle = { backgroundColor: 'rgba(242, 153, 74, 0.15)', color: '#f2994a', border: '1px solid #f2994a' }
        } else if (type.includes('Questionnaire')) {
          chipStyle = { backgroundColor: 'rgba(179, 98, 255, 0.15)', color: '#b362ff', border: '1px solid #b362ff' }
        }

        return (
          <Chip
            label={type}
            size="small"
            style={{ fontWeight: 600, ...chipStyle }}
          />
        )
      }
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 200,
      type: 'date',
      valueGetter: (value, row) => {
        if (!row?.date) return null
        const parsed = dayjs(row.date, ['DD/MM/YYYY', 'YYYY-MM-DD'], true)
        return parsed.isValid() ? parsed.toDate() : null
      },
      renderCell: params => params.row?.date || 'N/A'
    }
  ]

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const [alertsRes, usersRes] = await Promise.all([
        api.get('/admin/alerts'),
        api.get('/admin/users/list'),
      ])

      const rawAlerts = alertsRes.data.alerts || []
      const usersList = usersRes.data.users || []

      const userCreationMap = {}
      usersList.forEach((u) => {
        if (u.uid && u.creation_date) {
          userCreationMap[u.uid.toLowerCase().trim()] = u.creation_date
        }
      })

      const filteredAlerts = rawAlerts.filter((alert) => {
        if (!alert.uid || !alert.date) return true
        const creationDate = userCreationMap[alert.uid.toLowerCase().trim()]
        if (!creationDate) return true

        let alertDate
        const parts = alert.date.split('/')
        if (parts.length === 3) {
          alertDate = dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`)
        } else {
          alertDate = dayjs(alert.date)
        }

        const creationStart = dayjs(creationDate).startOf('day')
        return !alertDate.startOf('day').isBefore(creationStart)
      })

      setRows(filteredAlerts)
    } catch (error) {
      console.error('Erreur chargement des alertes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return (
    <>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        Alertes
      </Typography>
      <Paper sx={{ mt: 3, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel },
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[5, 10, 15, 25, 50]}
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
