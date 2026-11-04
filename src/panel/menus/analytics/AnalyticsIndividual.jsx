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
import Tooltip from '@mui/material/Tooltip'
import Stack from '@mui/material/Stack'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ChecklistIcon from '@mui/icons-material/Checklist'
import PersonIcon from '@mui/icons-material/Person'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import AssignmentIcon from '@mui/icons-material/Assignment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TimerIcon from '@mui/icons-material/Timer'
import { DataGrid } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { api } from '../../../../axios'
import { UserEndDate } from '../../../components/UserEndDate'

function formatDuration(totalMilliseconds) {
  if (!totalMilliseconds || !Number.isFinite(totalMilliseconds) || totalMilliseconds <= 0) return '0s'

  const totalSeconds = Math.floor(totalMilliseconds / 1000)
  const d = Math.floor(totalSeconds / 86_400)
  const h = Math.floor((totalSeconds % 86_400) / 3_600)
  const m = Math.floor((totalSeconds % 3_600) / 60)
  const s = totalSeconds % 60

  if (d > 0) return `${d}j ${h}h ${m}m ${s}s`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

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

function getPhaseLabel(user) {
  if (user?.team == null || !user.creation_date) {
    if (user?.team === 0) return 'Admin'
    return '-'
  }

  const { team, creation_date } = user
  if (team <= 0) return 'Admin'

  const t0 = dayjs(creation_date)
  const now = dayjs()

  if (now.isBefore(t0, 'day')) {
    return 'Non démarrée'
  }

  const diffDays = now.diff(t0, 'day')

  const baselineWeeks = team === 1 ? 1 : team === 2 ? 2 : 3
  const interventionEndWeeks = baselineWeeks + 5
  const totalWeeks = interventionEndWeeks + 1

  if (diffDays < baselineWeeks * 7) {
    return 'Ligne de base'
  } else if (diffDays < interventionEndWeeks * 7) {
    return 'Intervention'
  } else if (diffDays < totalWeeks * 7) {
    return 'Suivi'
  } else {
    return 'Terminée'
  }
}

function PanelStepper({ title, days, icon }) {
  const count = days ? days.filter((d) => d.status === 'done').length : 0

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Chip
          label={`${count} / 7 j`}
          size="small"
          color="primary"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        {(days || []).map((day, index) => {
          const status = day.status
          const isCurrentDay = day.selected || day.isCurrentDay
          const isLast = index === days.length - 1

          let circleBg = '#f5f5f5'
          let circleBorder = '#e0e0e0'
          let iconComp = null
          let labelColor = 'text.secondary'

          if (status === 'done') {
            circleBg = '#4CAF50'
            circleBorder = '#2E7D32'
            iconComp = <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />
            labelColor = '#4CAF50'
          } else if (status === 'not-done') {
            circleBg = '#E53935'
            circleBorder = '#8B0000'
            iconComp = <CloseIcon sx={{ fontSize: 16, color: '#fff' }} />
            labelColor = '#E53935'
          } else {
            if (isCurrentDay) {
              circleBorder = '#1976d2'
              labelColor = '#1976d2'
            }
          }

          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: circleBg,
                    border: `2px solid ${circleBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {iconComp}
                </Box>
                <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 'bold', color: labelColor }}>
                  {day.label}
                </Typography>
              </Box>

              {!isLast && (
                <Box
                  sx={{
                    flex: 1,
                    height: 3,
                    mx: 1,
                    mb: 2,
                    borderRadius: 1.5,
                    bgcolor: status === 'done' ? '#4CAF50' : status === 'not-done' ? '#E53935' : '#e0e0e0',
                  }}
                />
              )}
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}

function OpeningBarChart({ openingData = [] }) {
  const currentJsDay = dayjs().day()
  const currentDayIndex = currentJsDay === 0 ? 6 : currentJsDay - 1
  const maxVal = Math.max(...openingData.map((d) => d.value || 0), 1)

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Graphique d'expositions journalières
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 180, pt: 3, pb: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {openingData.map((item, index) => {
          const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0
          const isToday = index === currentDayIndex
          const barColor = isToday ? '#1976d2' : '#9e9e9e'

          return (
            <Tooltip key={index} title={`${item.value} ${item.value > 1 ? 'ouvertures' : 'ouverture'}`} arrow placement="top">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: isToday ? 'primary.main' : 'text.secondary', mb: 0.5 }}>
                  {item.value}
                </Typography>
                <Box
                  sx={{
                    width: '60%',
                    maxWidth: 32,
                    height: `${Math.max(heightPercent, 4)}%`,
                    bgcolor: barColor,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease, background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: '#1565c0'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, fontWeight: isToday ? 700 : 500, color: isToday ? 'primary.main' : 'text.primary' }}>
                  {item.label}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5, fontWeight: 500 }}>
        Nombre d'expositions journalières (cette semaine)
      </Typography>
    </Paper>
  )
}

export default function AnalyticsIndividual() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [inputUid, setInputUid] = useState(uid || '')

  const [userProfile, setUserProfile] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [questionnaires, setQuestionnaires] = useState([])
  const [trackingAnalytics, setTrackingAnalytics] = useState(null)
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
      setUserProfile(null)
      setAlerts([])
      setQuestionnaires([])
      setTrackingAnalytics(null)
      return
    }

    setLoading(true)
    try {
      const normUid = targetUid.toLowerCase().trim()

      const [alertsRes, formsRes, usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/alerts'),
        api.get('/admin/forms'),
        api.get('/admin/users/list'),
        api.get(`/admin/analytics/user/${encodeURIComponent(normUid)}`).catch(() => ({ data: null })),
      ])

      const targetUser = (usersRes.data.users || []).find(
        (u) => u.uid?.toLowerCase().trim() === normUid
      )

      setUserProfile(targetUser || null)

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
      setTrackingAnalytics(analyticsRes?.data || null)
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
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 3
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: { xs: 2.5, sm: 4 },
                rowGap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonIcon color="primary" sx={{ fontSize: 36 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                    Fiche participant
                  </Typography>
                  <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
                    {uid}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                  Groupe
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  {userProfile ? (userProfile.team === 0 ? 'Admin' : userProfile.team > 0 ? `Groupe ${userProfile.team}` : '-') : '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                  Phase actuelle
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  {getPhaseLabel(userProfile)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                  Date d'inscription
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  {userProfile?.creation_date ? dayjs(userProfile.creation_date).format('DD/MM/YYYY') : '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                  Date de fin
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                  {userProfile && userProfile.team === 0 ? '-' : <UserEndDate uid={uid} />}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignSelf: { xs: 'flex-start', md: 'center' } }}>
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

          {/* Section Statistiques & Progression (Identique à l'application mobile) */}
          {trackingAnalytics && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 1 }}>
                Progression cette semaine
              </Typography>

              {trackingAnalytics.formDays && (
                <PanelStepper
                  title="Questionnaire quotidien"
                  days={trackingAnalytics.formDays}
                  icon={<AssignmentIcon color="primary" fontSize="small" />}
                />
              )}

              {trackingAnalytics.sensorDays && (
                <PanelStepper
                  title="Port du capteur"
                  days={trackingAnalytics.sensorDays}
                  icon={<DirectionsWalkIcon color="primary" fontSize="small" />}
                />
              )}

              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mt: 1 }}>
                Statistiques d'utilisation
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                      <VisibilityIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        Expositions
                      </Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {trackingAnalytics.amount ?? 0}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                      <TimerIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        Temps d'exposition
                      </Typography>
                    </Stack>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {formatDuration(trackingAnalytics.duration)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <OpeningBarChart openingData={trackingAnalytics.opening || []} />
            </Box>
          )}

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