import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutDialog({ open, onClose }) {
  const theme = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: '100%',
          maxWidth: 400,
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          p: 3,
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2,
          }}
        >
          <LogoutIcon
            sx={{
              fontSize: 32,
              color: theme.palette.error.main,
            }}
          />
        </Box>

        <DialogTitle
          sx={{
            p: 0,
            mb: 1,
          }}
        >
          <Typography variant="h5" component="span" fontWeight={600}>
            Sign Out
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0, mb: 2 }}>
          <Typography color="text.secondary">
            Are you sure you want to sign out? You'll need to sign in again to access your account.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 0, justifyContent: 'center', gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              px: 3,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{
              px: 3,
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
} 