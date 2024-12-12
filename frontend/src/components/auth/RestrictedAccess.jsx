import { Box, Typography, Button, Container, useTheme, alpha } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function RestrictedAccess() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(45deg, 
          ${alpha(theme.palette.error.main, 0.05)} 0%, 
          ${alpha(theme.palette.error.light, 0.05)} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <BlockIcon
              sx={{
                fontSize: 40,
                color: theme.palette.error.main,
              }}
            />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.error.main,
            }}
          >
            Access Restricted
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              },
            }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 