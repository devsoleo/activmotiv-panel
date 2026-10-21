import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import { api } from '../../../../axios'

function GrafanaStatCard({ title, value, loading, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#181b1f',
        color: '#f7f9fb',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#a1a8b6',
            fontWeight: 600,
            fontSize: '0.85rem',
            lineHeight: 1.2,
            letterSpacing: '0.2px'
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1.5 }}>
        {loading ? (
          <CircularProgress size={32} sx={{ color }} />
        ) : (
          <Typography
            sx={{
              fontSize: { xs: '2.5rem', md: '3rem' },
              fontWeight: 700,
              lineHeight: 1,
              color,
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}
          >
            {value ?? 0}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

function GrafanaListCard({ title, users = [], loading, color, emptyMessage }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#181b1f',
        color: '#f7f9fb',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#a1a8b6',
            fontWeight: 600,
            fontSize: '0.85rem',
            lineHeight: 1.2,
            letterSpacing: '0.2px'
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 120, pr: 0.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 80 }}>
            <CircularProgress size={28} sx={{ color }} />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 80 }}>
            <Typography variant="body2" sx={{ color: '#7a828e', fontStyle: 'italic', textAlign: 'center' }}>
              {emptyMessage || 'Aucun participant'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {users.map((u) => (
              <Box
                key={u.id}
                component={Link}
                to={`/individual/${u.uid}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 0.6,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', color: '#f7f9fb' }}>
                  {u.uid}
                </Typography>
                {u.team > 0 && (
                  <Typography variant="caption" sx={{ color: '#a1a8b6', fontSize: '0.75rem' }}>
                    Groupe {u.team}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

function GrafanaAlertsCard({ alerts = [], loading }) {
  const alertColor = '#ff5252'

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#181b1f',
        color: '#f7f9fb',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: alertColor,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: '#a1a8b6',
              fontWeight: 600,
              fontSize: '0.85rem',
              lineHeight: 1.2,
              letterSpacing: '0.2px'
            }}
          >
            Alertes des 3 derniers jours
          </Typography>
          {!loading && (
            <Chip
              label={`${alerts.length} alerte${alerts.length > 1 ? 's' : ''}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: alerts.length > 0 ? 'rgba(255, 82, 82, 0.2)' : 'rgba(115, 191, 105, 0.2)',
                color: alerts.length > 0 ? '#ff5252' : '#73bf69',
                border: `1px solid ${alerts.length > 0 ? 'rgba(255, 82, 82, 0.4)' : 'rgba(115, 191, 105, 0.4)'}`
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 240, pr: 0.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 120 }}>
            <CircularProgress size={28} sx={{ color: alertColor }} />
          </Box>
        ) : alerts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 120 }}>
            <Typography variant="body2" sx={{ color: '#73bf69', fontStyle: 'italic', textAlign: 'center' }}>
              Aucune alerte sur les 3 derniers jours
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {alerts.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                  backgroundColor: 'rgba(255, 82, 82, 0.06)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 82, 82, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 82, 82, 0.12)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: '#f7f9fb' }}>
                    {item.uid}
                  </Typography>
                  <Chip
                    label={item.type}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: item.type === 'capteur non porté' ? 'rgba(242, 153, 74, 0.2)' : 'rgba(179, 98, 255, 0.2)',
                      color: item.type === 'capteur non porté' ? '#f2994a' : '#b362ff',
                      border: `1px solid ${item.type === 'capteur non porté' ? '#f2994a' : '#b362ff'}`
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#a1a8b6', fontWeight: 500, fontSize: '0.8rem' }}>
                  {item.dateLabel} ({item.date})
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default function AnalyticsGlobal() {
  const [data, setData] = useState({
    active: [],
    baseline: [],
    intervention: [],
    followup: [],
    toInclude: 0,
    alerts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([
      api.get('/admin/analytics/users/active'),
      api.get('/admin/analytics/users/baseline'),
      api.get('/admin/analytics/users/intervention'),
      api.get('/admin/analytics/users/followup'),
    ])
    .then(([activeRes, baselineRes, interventionRes, followupRes]) => {
      if (!isMounted) return
      setData({
        active: activeRes.data.list ?? [],
        baseline: baselineRes.data.list ?? [],
        intervention: interventionRes.data.list ?? [],
        followup: followupRes.data.list ?? [],
      })
    })
    .catch(err => console.error('Error :', err))
    .finally(() => {
      if (isMounted) setLoading(false)
    })
    return () => { isMounted = false }
  }, [])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Suivi global
      </Typography>

      {/* Premiere ligne: Chiffres Cles (Stat Cards) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaStatCard
            title="Nombre de participants"
            value={data.active.length + "/18"}
            loading={loading}
            color="#5794f2"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaStatCard
            title="Nombre de participants en phase de Baseline (A)"
            value={data.baseline.length}
            loading={loading}
            color="#f2994a"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaStatCard
            title="Nombre de participants en phase intervention (B)"
            value={data.intervention.length}
            loading={loading}
            color="#b362ff"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaStatCard
            title="Nombre de participants en phase de suivi (A')"
            value={data.followup.length}
            loading={loading}
            color="#73bf69"
          />
        </Grid>
      </Grid>

      {/* Seconde ligne: Restants a inclure & Listes des participants par phase */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaStatCard
            title="Nombre de participants restants à inclure"
            value={18 - data.active.length}
            loading={loading}
            color="#5794f2"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaListCard
            title="Liste des participants (en baseline A)"
            users={data.baseline}
            loading={loading}
            color="#f2994a"
            emptyMessage="Aucun participant en baseline (A)"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaListCard
            title="Liste des participants (en phase B)"
            users={data.intervention}
            loading={loading}
            color="#b362ff"
            emptyMessage="Aucun participant en phase B"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GrafanaListCard
            title="Liste des participants (en phase de suivi A')"
            users={data.followup}
            loading={loading}
            color="#73bf69"
            emptyMessage="Aucun participant en suivi (A')"
          />
        </Grid>
      </Grid>

      {/* Troisieme ligne: Module des Alertes (3 derniers jours) */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <GrafanaAlertsCard
            alerts={data.alerts}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  )
}