import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Avatar,
  Tooltip,
  Zoom,
  Fade,
} from '@mui/material';
import {
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { userApi } from '../../services/userApi';
import { roleApi } from '../../services/roleApi';
import { activityApi } from '../../services/activityApi';
import { formatISO9075 } from 'date-fns';
import { alpha } from '@mui/material/styles';

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    roles: { total: 0},
    permissions: { total: 0, used: 0, unused: 0 },
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [users, roles, activitiesResponse] = await Promise.all([
        userApi.getAllUsers(),
        roleApi.getAllRoles(),
        activityApi.getActivities({ 
          limit: 5,
          page: 1,
        }),
      ]);

      // Calculate statistics
      const userStats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
      };

      const roleStats = {
        total: roles.length
      };

      // Calculate permission usage
      const allPermissions = new Set();
      const usedPermissions = new Set();
      roles.forEach(role => {
        (role.permissions || []).forEach(perm => {
          allPermissions.add(perm._id);
          usedPermissions.add(perm._id);
        });
      });

      const permissionStats = {
        total: allPermissions.size,
        used: usedPermissions.size,
        unused: allPermissions.size - usedPermissions.size,
      };

      setStats({
        users: userStats,
        roles: roleStats,
        permissions: permissionStats,
      });

      // Ensure we have valid activities data
      const activities = Array.isArray(activitiesResponse.data) 
        ? activitiesResponse.data 
        : [];
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error
      setStats({
        users: { total: 0, active: 0, inactive: 0 },
        roles: { total: 0 },
        permissions: { total: 0, used: 0, unused: 0 },
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, stats, icon: Icon, color }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
              <Icon />
            </Avatar>
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h4" color="primary" align="center">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Total
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" color="success.main" align="center">
                {stats.active || stats.used}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                {stats.active !== undefined ? 'Active' : 'Used'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" color="error.main" align="center">
                {stats.inactive || stats.unused}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                {stats.inactive !== undefined ? 'Inactive' : 'Unused'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Zoom>
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Users"
            stats={stats.users}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Roles"
            stats={stats.roles}
            icon={VpnKeyIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Permissions"
            stats={stats.permissions}
            icon={SecurityIcon}
            color="success"
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Fade in={true}>
            <Paper sx={{ 
              p: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Activities
                </Typography>
                <Tooltip title="Refresh">
                  <IconButton onClick={loadDashboardData} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <List>
                {recentActivities.map((activity, index) => (
                  <Box key={activity._id}>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <>
                            {activity.details}
                            <Typography variant="caption" display="block" color="textSecondary">
                              {activity.createdAt ? formatISO9075(new Date(activity.createdAt)) : 'N/A'}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        size="small"
                        label={activity.userId?.name || 'System'}
                        variant="outlined"
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}