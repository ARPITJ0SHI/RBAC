import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function SessionWarning() {
  const { showSessionWarning = false, refreshSession, logout, sessionExpiry } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); 

  useEffect(() => {
    if (!showSessionWarning || !sessionExpiry) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((sessionExpiry - Date.now()) / 1000));
      setTimeLeft(secondsLeft);

      if (secondsLeft === 0) {
        clearInterval(interval);
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showSessionWarning, sessionExpiry, logout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / 300) * 100;

  return (
    <Dialog
      open={showSessionWarning || false}
      onClose={refreshSession}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Session Expiring Soon</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', position: 'relative', my: 2 }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={80}
            thickness={4}
            sx={{ position: 'absolute', color: 'rgba(0, 0, 0, 0.1)' }}
          />
          <CircularProgress
            variant="determinate"
            value={progress}
            size={80}
            thickness={4}
            color={progress <= 20 ? 'error' : 'primary'}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {formatTime(timeLeft)}
          </Typography>
        </Box>
        <Typography>
          Your session will expire in {formatTime(timeLeft)}. Would you like to stay signed in?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={logout} color="error">
          Sign Out
        </Button>
        <Button onClick={refreshSession} variant="contained" autoFocus>
          Stay Signed In
        </Button>
      </DialogActions>
    </Dialog>
  );
} 