import { Box, Grid, Paper, Typography, LinearProgress, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../hooks/useDashboard';
import StatCard from './StatCard';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) 
    ? date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';
};

export default function Dashboard() {
  const theme = useTheme();
  const { 
    loading, 
    error, 
    activityStats, 
    sessionStats, 
    recentActivities,
  } = useDashboard();

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        Error loading dashboard data: {error}
      </Box>
    );
  }

  const stats = {
    users: {
      total: sessionStats?.activeUsers || 0,
      label: 'Active Users',
    },
    roles: {
      total: activityStats?.roleCount || 0,
      label: 'Total Roles',
    },
    permissions: {
      total: activityStats?.permissionCount || 0,
      label: 'Total Permissions',
    },
  };

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
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {recentActivities && recentActivities.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {recentActivities.map((activity, index) => (
                    <Box
                      key={activity._id || index}
                      sx={{
                        py: 1,
                        borderBottom: index < recentActivities.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {activity.action} - {formatDate(activity.timestamp || activity.createdAt)}
                      </Typography>
                      <Typography variant="body1">
                        {activity.details?.message || activity.description || 'No details available'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  No recent activities
                </Typography>
              )}
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}