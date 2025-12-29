import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/LogoutOutlined'
import { useState } from 'react';
import Users from './menus/Users'
import PersonIcon from '@mui/icons-material/Person'
import { IconButton } from '@mui/material'
const drawerWidth = 240

export default function Panel({ logout }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const menus = [
    { icon: <PersonIcon />, title: 'Utilisateurs', component: <Users /> }
  ]

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
            onClick={logout}
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
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menus.map((item, index) => (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  selected={selectedIndex === 0}
                  onClick={(event) => handleListItemClick(event, index)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {menus[selectedIndex].component}
      </Box>
    </Box>
  );
}
