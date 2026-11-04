import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import { alpha } from '@mui/material/styles'

// Icons
import GroupsIcon from '@mui/icons-material/Groups'
import TimelineIcon from '@mui/icons-material/Timeline'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { api } from '../../../../axios'

function StatCard({ title, value, loading, color, icon, subtitle }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Stack>

      <Box sx={{ my: 1 }}>
        {loading ? (
          <CircularProgress size={28} sx={{ color }} />
        ) : (
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              color,
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            {value ?? 0}
          </Typography>
        )}
      </Box>

      {subtitle && (
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  )
}

function ListCard({ title, users = [], loading, color, emptyMessage, icon }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5,
        height: '100%',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {icon && (
            <Avatar sx={{ bgcolor: alpha(color, 0.12), color, width: 32, height: 32 }}>
              {icon}
            </Avatar>
          )}
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            {title}
          </Typography>
        </Stack>
        <Chip
          label={users.length}
          size="small"
          sx={{
            bgcolor: alpha(color, 0.12),
            color: color,
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 180, pr: 0.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 100 }}>
            <CircularProgress size={28} sx={{ color }} />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {emptyMessage || 'Aucun participant'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
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
                  py: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.04)
                      : alpha(theme.palette.common.black, 0.02),
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: alpha(color, 0.08),
                    borderColor: color,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: '#5794f2',
                  }}
                >
                  {u.uid}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {u.team > 0 && (
                    <Chip
                      label={`Groupe ${u.team}`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                  <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Stack>
              </Box>
            ))}
          </Stack>
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
      .catch((err) => console.error('Erreur chargement analytics :', err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Suivi global
      </Typography>

      {/* Première ligne: Chiffres clés (Stat Cards) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Nombre de participants"
            value={`${data.active.length}/18`}
            loading={loading}
            color="#5794f2"
            subtitle="Inscrits sur l'étude"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Phase Baseline (A)"
            value={data.baseline.length}
            loading={loading}
            color="#f2994a"
            subtitle="Phase initiale d'observation"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Phase Intervention (B)"
            value={data.intervention.length}
            loading={loading}
            color="#b362ff"
            subtitle="Phase active de l'étude"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Phase de suivi (A')"
            value={data.followup.length}
            loading={loading}
            color="#73bf69"
            subtitle="Phase finale de suivi"
          />
        </Grid>
      </Grid>

      {/* Seconde ligne: Restants à inclure & Listes des participants par phase */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Restants à inclure"
            value={Math.max(0, 18 - data.active.length) + "/18"}
            loading={loading}
            color="#5794f2"
            icon={<PersonAddDisabledIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ListCard
            title="Baseline (A)"
            users={data.baseline}
            loading={loading}
            color="#f2994a"
            emptyMessage="Aucun participant en baseline (A)"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ListCard
            title="Phase (B)"
            users={data.intervention}
            loading={loading}
            color="#b362ff"
            emptyMessage="Aucun participant en phase B"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ListCard
            title="Suivi (A')"
            users={data.followup}
            loading={loading}
            color="#73bf69"
            emptyMessage="Aucun participant en suivi (A')"
          />
        </Grid>
      </Grid>
    </Box>
  )
}