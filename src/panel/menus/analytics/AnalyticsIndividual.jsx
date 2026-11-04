import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ChecklistIcon from '@mui/icons-material/Checklist';
import PersonIcon from '@mui/icons-material/Person'
import { DataGrid } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { api } from '../../../../axios'
import { UserEndDate } from '../../../components/UserEndDate'

function parseQuestionnaireData(data) {
  let parsed = data
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch (e) {
      console.error('Erreur de parsing des données du questionnaire:', e)
      parsed = {}
    }
  }

  const rawResults = Array.isArray(parsed?.results) ? parsed.results : []
  const seen = new Set()
  const results = []

  for (const item of rawResults) {
    const itemKey = `${item?.uid || ''}_${item?.question || ''}_${item?.answer || ''}`
    if (!seen.has(itemKey)) {
      seen.add(itemKey)
      results.push(item)
    }
  }

  return {
    results,
    timestamp: parsed?.timestamp,
  }
}

export default function AnalyticsIndividual() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [inputUid, setInputUid] = useState(uid || '')

  const [alerts, setAlerts] = useState([])
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setInputUid(uid || '')
  }, [uid])

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (inputUid.trim()) {
      await navigate(`/individual/${inputUid.trim()}`)
    }
  }

  const fetchDataForUser = useCallback(async (targetUid) => {
    if (!targetUid) {
      setAlerts([])
      setQuestionnaires([])
      return
    }

    setLoading(true)
    try {
      const [alertsRes, formsRes, usersRes] = await Promise.all([
        api.get('/admin/alerts'),
        api.get('/admin/forms'),
        api.get('/admin/users/list'),
      ])

      const normUid = targetUid.toLowerCase().trim()

      const targetUser = (usersRes.data.users || []).find(
        (u) => u.uid?.toLowerCase().trim() === normUid
      )

      const userAlerts = (alertsRes.data.alerts || []).filter((a) => {
        if (a.uid?.toLowerCase().trim() !== normUid) return false

        if (targetUser?.creation_date && a.date) {
          let alertDate
          const parts = a.date.split('/')
          if (parts.length === 3) {
            alertDate = dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`)
          } else {
            alertDate = dayjs(a.date)
          }

          const creationStart = dayjs(targetUser.creation_date).startOf('day')
          if (alertDate.startOf('day').isBefore(creationStart)) {
            return false
          }
        }

        return true
      })

      const rawUserForms = (formsRes.data.questionnaires || []).filter(
        (q) => q.user_uid?.toLowerCase().trim() === normUid
      )

      const validUserForms = rawUserForms.filter((q) => {
        if (!targetUser?.creation_date) return true
        const { timestamp } = parseQuestionnaireData(q.data)
        const qDate = timestamp || q.completed_at
        if (!qDate) return true
        const creationStart = dayjs(targetUser.creation_date).startOf('day')
        return !dayjs(qDate).startOf('day').isBefore(creationStart)
      })

      const seenForms = new Set()
      const uniqueUserForms = []

      validUserForms.forEach((q) => {
        const { timestamp } = parseQuestionnaireData(q.data)
        const timeKey = timestamp || q.completed_at || q.created_at || ''
        const dataStr = typeof q.data === 'string' ? q.data : JSON.stringify(q.data || {})
        const contentKey = `${q.label || ''}_${timeKey}_${dataStr}`

        if (!seenForms.has(contentKey)) {
          seenForms.add(contentKey)
          uniqueUserForms.push(q)
        }
      })

      uniqueUserForms.sort((a, b) => {
        const timeA = parseQuestionnaireData(a.data).timestamp || a.completed_at || 0
        const timeB = parseQuestionnaireData(b.data).timestamp || b.completed_at || 0
        return dayjs(timeB).valueOf() - dayjs(timeA).valueOf()
      })

      setAlerts(userAlerts)
      setQuestionnaires(uniqueUserForms)
    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (uid) {
      fetchDataForUser(uid)
    }
  }, [uid, fetchDataForUser])

  const alertColumns = [
    {
      field: 'type',
      headerName: "Type d'alerte",
      flex: 1,
      minWidth: 200,
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
      width: 160,
      type: 'date',
      valueGetter: (value, row) => {
        if (!row?.date) return null
        const parts = row.date.split('/')
        if (parts.length === 3) {
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
        }
        return new Date(row.date)
      },
      renderCell: params => params.row?.date || 'N/A'
    }
  ]

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Suivi individuel
      </Typography>

      {/* Barre de recherche d'un UID */}
      <Paper
        elevation={1}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 2
        }}
      >
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="UID du participant"
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            value={inputUid}
            onChange={(e) => setInputUid(e.target.value)}
            placeholder="Ex: adminacc ou UID à 8 caractères"
            slotProps={{
              input: {
                style: { fontFamily: 'monospace' }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            disabled={!inputUid.trim()}
          >
            Rechercher
          </Button>
        </Box>
      </Paper>

      {!uid ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Aucun participant sélectionné. Entrez un UID ci-dessus ou cliquez sur un participant dans la liste.
          </Typography>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fiche participant
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                  {uid}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <UserEndDate uid={uid} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<NotificationsActiveIcon />}
                label={`${alerts.length} alerte${alerts.length > 1 ? 's' : ''}`}
                color={alerts.length > 0 ? 'error' : 'default'}
                variant="outlined"
              />
              <Chip
                icon={<ChecklistIcon />}
                label={`${questionnaires.length} questionnaire${questionnaires.length > 1 ? 's' : ''}`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* Section Alertes */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <NotificationsActiveIcon color="error" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Alertes ({alerts.length})
                  </Typography>
                </Box>

                {alerts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center', fontStyle: 'italic' }}>
                    Aucune alerte pour cet utilisateur.
                  </Typography>
                ) : (
                  <Box sx={{ height: 380, width: '100%' }}>
                    <DataGrid
                      rows={alerts}
                      columns={alertColumns}
                      pageSizeOptions={[5, 10]}
                      initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 5 } },
                        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] }
                      }}
                      sx={{
                        border: 0,
                        '& .MuiDataGrid-cell:focus': { outline: 'none' }
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Section Questionnaires */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <ChecklistIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Questionnaires ({questionnaires.length})
                  </Typography>
                </Box>

                {questionnaires.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center', fontStyle: 'italic' }}>
                    Aucun questionnaire rempli par cet utilisateur.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 450, overflowY: 'auto', pr: 0.5 }}>
                    {questionnaires.map((q, qIdx) => {
                      const { results, timestamp } = parseQuestionnaireData(q.data)
                      const dateStr = dayjs(timestamp || q.completed_at).format('DD/MM/YYYY [à] HH:mm:ss')
                      const uniqueKey = q.id ? `q_${q.id}` : `q_${qIdx}`

                      return (
                        <Accordion key={uniqueKey} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1, flexWrap: 'wrap', gap: 1 }}>
                              <Chip
                                label={q.label || 'Sans nom'}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Rempli le {dateStr}
                              </Typography>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Réponse</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {results.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={2} align="center">
                                        Aucune réponse enregistrée.
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    results.map((r, idx) => (
                                      <TableRow key={r.uid || idx} hover>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {r.question || `Question ${r.uid}`}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontFamily: typeof r.answer === 'number' ? 'monospace' : 'inherit' }}>
                                            {r.answer}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      )
                    })}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
