import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LogoutIcon from '@mui/icons-material/LogoutOutlined'
import GroupsIcon from '@mui/icons-material/Groups'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import Divider from '@mui/material/Divider'
import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import UsersList from './menus/users/UsersList'
import UsersCreate from './menus/users/UsersCreate'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { IconButton } from '@mui/material'
import AnalyticsGlobal from './menus/analytics/AnalyticsGlobal'
import AnalyticsIndividual from './menus/analytics/AnalyticsIndividual'
import AlertsList from './menus/alerts/AlertsList'
import QuestionnairesList from './menus/forms/FormsList'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart'
import ChecklistIcon from '@mui/icons-material/Checklist';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import EnvLoginDialog from '../components/EnvLoginDialog';
import activmotivLogo from '../../assets/activmotiv.svg';
import { ENVIRONMENTS_SETTINGS, getEnvSettings } from '../../axios';

const drawerWidth = 240

export default function Panel({ logout }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [environnement, setEnvironnement] = useState(() => {
    return localStorage.getItem('environment') || 'production'
  })
  const [targetEnvironment, setTargetEnvironment] = useState(null)
  const [envDialogOpen, setEnvDialogOpen] = useState(false)

  const handleEnvironmentChange = (e) => {
    const targetEnv = e.target.value
    if (targetEnv === environnement) return

    const token = localStorage.getItem('accessToken_' + targetEnv)

    if (token) {
      localStorage.setItem('environment', targetEnv)
      setEnvironnement(targetEnv)
      window.location.reload()
    } else {
      setTargetEnvironment(targetEnv)
      setEnvDialogOpen(true)
    }
  }

  const navigationItems = {
    main: [
      {
        key: 'list',
        title: 'Participants',
        icon: <GroupsIcon />,
        default: true,
        routes: [
          { path: '/', element: <UsersList /> },
        ]
      },
      {
        key: 'create',
        title: 'Inscription',
        divider: true,
        icon: <PersonAddIcon />,
        routes: [
          { path: '/', element: <UsersCreate /> }
        ]
      },
      {
        key: 'global',
        title: 'Vue globale',
        icon: <StackedBarChartIcon />,
        routes: [
          { path: '/', element: <AnalyticsGlobal /> }
        ]
      },
      {
        key: 'individual',
        title: 'Suivi individuel',
        icon: <PersonSearchIcon />,
        routes: [
          { path: '/', element: <AnalyticsIndividual /> },
          { path: '/:uid', element: <AnalyticsIndividual /> }
        ]
      },
      {
        key: 'alerts',
        title: 'Alertes',
        icon: <NotificationsActiveIcon />,
        routes: [
          { path: '/', element: <AlertsList /> }
        ]
      },
      {
        key: 'forms',
        title: 'Questionnaires',
        icon: <ChecklistIcon />,
        routes: [
          { path: '/', element: <QuestionnairesList /> }
        ]
      },
    ],

    bottom: []
  }

  const isSelected = (key) => location.pathname.startsWith('/' + key)

  const handleLogout = () => {
    localStorage.removeItem('selectedMenuIndex')
    logout()
  }

  return (
    <Box sx={{ display: 'flex', overflowX: 'hidden' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src={activmotivLogo}
              alt="ActivMotiv"
              sx={{ height: 29, maxWidth: 160, objectFit: 'contain' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              mr: 2,
              px: 1.5,
              py: 0.6,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: getEnvSettings(environnement).color || '#4caf50',
                boxShadow: `0 0 0 2px ${(getEnvSettings(environnement).color || '#4caf50')}55`,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'inherit' }}>
              {getEnvSettings(environnement).label || environnement}
            </Typography>
          </Box>
          <IconButton
            size="large"
            color="inherit"
            edge="end"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleLogout}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <List sx={{ pt: 1 }}>
            { navigationItems.main.map((value, index) => {
              return (
                <>
                  <ListItem disablePadding key={'i' + index}>
                    <ListItemButton
                      selected={isSelected(value.key)}
                      onClick={() => navigate('/' + value.key)}
                    >
                      <ListItemIcon>
                        { value?.icon }
                      </ListItemIcon>
                      <ListItemText primary={value.title} />
                    </ListItemButton>
                  </ListItem>
                  { value.divider && <Divider sx={{ my: 1 }} /> }
                </>
              )
            })}
          </List>
        </Box>

        <Divider />

        <Box sx={{ pb: 1 }}>
          <List sx={{ pt: 1 }}>
            { navigationItems.bottom.map((value, index) => {
              return (
                <>
                  { value.preDivider && <Divider sx={{ my: 1 }} /> }
                  <ListItem disablePadding key={'b' + index}>
                    <ListItemButton
                      selected={isSelected(value.key)}
                      onClick={() => navigate('/' + value.key)}
                    >
                      <ListItemIcon>
                        { value?.icon }
                      </ListItemIcon>
                      <ListItemText primary={value.title} />
                    </ListItemButton>
                  </ListItem>
                  { value.postDivider && <Divider sx={{ my: 1 }} /> }
                </>
              )
            })}
          </List>
          <FormControl sx={{ m: 1, maxWidth: 220 }} fullWidth>
            <InputLabel id="demo-simple-select-label">Environnement</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={environnement}
              label="Environnement"
              onChange={handleEnvironmentChange}
              renderValue={(selected) => {
                const color = getEnvSettings(selected).color || '#4caf50'
                const label = getEnvSettings(selected).label || selected
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: color,
                        boxShadow: `0 0 0 2px ${color}33`,
                        flexShrink: 0,
                      }}
                    />
                    <span>{label}</span>
                  </Box>
                )
              }}
            >
            {
              ENVIRONMENTS_SETTINGS.map((value, _) => {
                return (
                  <MenuItem value={value.name} key={value.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: value.color,
                          boxShadow: `0 0 0 2px ${value.color}33`,
                          flexShrink: 0,
                        }}
                      />
                      <span>{value.label}</span>
                    </Box>
                  </MenuItem>
                )
              })
            }
            </Select>
          </FormControl>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          {
            [...navigationItems.main, ...navigationItems.bottom]
              .flatMap(({ key, routes, default: isDefault }) =>
              routes.flatMap((route, index) => [
                <Route
                  key={`${key}-${index}`}
                  path={`/${key}${route.path}`}
                  element={route.element}
                />,
                ...(isDefault && route.path === '/'
                  ? [<Route key={`${key}-${index}-default`} path="/" element={route.element} />]
                  : []),
              ])
            )
          }
          <Route path="*" page={<Navigate to="/list" replace />} />
        </Routes>
      </Box>
      <EnvLoginDialog
        name={targetEnvironment}
        open={envDialogOpen}
        onClose={() => {
          setEnvDialogOpen(false)
          setTargetEnvironment(null)
        }}
        onSuccess={() => {
          setEnvDialogOpen(false)
          setTargetEnvironment(null)
          window.location.reload()
        }}
      />
    </Box>
  )
}
