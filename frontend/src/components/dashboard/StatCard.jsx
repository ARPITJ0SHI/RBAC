import { memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Zoom,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

const StatCard = memo(({ title, stats, icon: Icon, color = 'primary' }) => {
  return (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[4],
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={(theme) => ({
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
                mr: 2,
              })}
            >
              <Icon />
            </Avatar>
            <Typography variant="h6" color="textPrimary">
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography
              variant="h4"
              component="span"
              sx={(theme) => ({
                color: theme.palette[color].main,
                fontWeight: 600,
                mr: 1,
              })}
            >
              {stats.total.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {stats.label}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard; 