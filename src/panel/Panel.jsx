import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LogoutIcon from '@mui/icons-material/LogoutOutlined'
import GroupsIcon from '@mui/icons-material/Groups'
import Divider from '@mui/material/Divider'
import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import UsersList from './menus/users/UsersList'
import UsersCreate from './menus/users/UsersCreate'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { IconButton } from '@mui/material'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import AnalyticsGlobal from './menus/analytics/AnalyticsGlobal'
import AnalyticsIndividual from './menus/analytics/AnalyticsIndividual'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart'

const drawerWidth = 240

export default function Panel({ logout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [openSuivi, setOpenSuivi] = useState(true)

  const isParticipantsActive = location.pathname === '/list'
  const isGlobalActive = location.pathname === '/global'
  const isIndividualActive = location.pathname.startsWith('/individual')
  const isCreateActive = location.pathname === '/create'

  const handleSuiviClick = () => {
    setOpenSuivi(!openSuivi)
  }

  const handleLogout = () => {
    localStorage.removeItem('selectedMenuIndex')
    logout()
  }

  return (
    <Box sx={{ display: 'flex', overflowX: 'hidden' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
            Panel d'administration
          </Typography>
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
            {/* Menu principal Participants */}
            <ListItem disablePadding>
              <ListItemButton
                selected={isParticipantsActive}
                onClick={() => navigate('/list')}
              >
                <ListItemIcon>
                  <GroupsIcon />
                </ListItemIcon>
                <ListItemText primary="Participants" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Menu déroulant "Suivi" */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleSuiviClick}>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="Suivi" />
                {openSuivi ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={openSuivi} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Suivi global */}
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isGlobalActive}
                    onClick={() => navigate('/global')}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <StackedBarChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Global" />
                  </ListItemButton>
                </ListItem>

                {/* Suivi individuel */}
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isIndividualActive}
                    onClick={() => navigate('/individual')}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PersonSearchIcon />
                    </ListItemIcon>
                    <ListItemText primary="Individuel" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Box>

        <Divider />

        <Box sx={{ pb: 1 }}>
          <List>
            {/* Inscription */}
            <ListItem disablePadding>
              <ListItemButton
                selected={isCreateActive}
                onClick={() => navigate('/create')}
              >
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Inscription" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/list" element={<UsersList />} />
          <Route path="/global" element={<AnalyticsGlobal />} />
          <Route path="/individual" element={<AnalyticsIndividual />} />
          <Route path="/individual/:uid" element={<AnalyticsIndividual />} />
          <Route path="/create" element={<UsersCreate />} />
          <Route path="*" element={<Navigate to="/list" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}
