import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  AccountCircle,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import LogoutDialog from '../auth/LogoutDialog';

const DRAWER_WIDTH = 240;

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/users', label: 'Users', icon: PeopleIcon },
  { path: '/roles', label: 'Roles', icon: VpnKeyIcon },
  { path: '/permissions', label: 'Permissions', icon: SecurityIcon },
];

export default function Layout({ children }) {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    setLogoutDialogOpen(true);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          RBAC Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem
              button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  color: location.pathname === item.path ? 'primary' : 'inherit',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {MENU_ITEMS.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </Typography>
          
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 2 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={logout}
      />
    </Box>
  );
} 