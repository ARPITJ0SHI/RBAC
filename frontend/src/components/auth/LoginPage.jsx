import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, verifyMFA, loading, error, mfaRequired, mfaSessionId, userId, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim(),
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mfaRequired) {
        // Validate MFA code format
        if (!/^\d{6}$/.test(formData.mfaCode)) {
          return;
        }
        console.log('Verifying MFA code:', formData.mfaCode, 'Session ID:', mfaSessionId, 'User ID:', userId);
        const result = await verifyMFA(formData.mfaCode);
        if (result.success) {
          navigate('/dashboard');
        }
      } else {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (!result.requireMFA && result.success) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login/MFA error:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("https://cintel.co/wp-content/uploads/2023/11/ethical-hacking-cintel.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.default, 0.7),
        }
      }}
    >
      <Container 
        maxWidth="xs" 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.secondary.main}, 
                ${theme.palette.primary.main})`,
              backgroundSize: '200% 100%',
              animation: 'gradient 4s linear infinite',
            },
            '@keyframes gradient': {
              '0%': { backgroundPosition: '0% 0%' },
              '100%': { backgroundPosition: '200% 0%' },
            },
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              transform: 'rotate(45deg)',
              '& .icon': {
                transform: 'rotate(-45deg)',
                transition: 'transform 0.3s ease-in-out',
              },
              '&:hover .icon': {
                transform: 'rotate(-45deg) scale(1.1)',
              },
            }}
          >
            {mfaRequired ? (
              <SecurityIcon className="icon" sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            ) : (
              <LockIcon className="icon" sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            )}
          </Box>

          <Typography
            variant="h4" 
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
          >
            {mfaRequired ? 'Verification Required' : 'Welcome Back'}
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            align="center"
            sx={{ mb: 4 }}
          >
            {mfaRequired
              ? 'Please enter the verification code from your authenticator app'
              : 'Sign in to access your dashboard'}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                '& .MuiAlert-icon': {
                  color: theme.palette.error.main,
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              mt: 1,
            }}
          >
            {!mfaRequired ? (
              <>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <TextField
                fullWidth
                label="Verification Code"
                name="mfaCode"
                value={formData.mfaCode}
                onChange={handleChange}
                required
                autoFocus
                sx={{ mb: 3 }}
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  style: { letterSpacing: '0.5em', textAlign: 'center' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Enter the 6-digit code from your authenticator app"
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || (mfaRequired && !formData.mfaCode) || (!mfaRequired && (!formData.email || !formData.password))}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                transition: 'all 0.2s ease-in-out',
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.6),
                  color: '#fff',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : mfaRequired ? (
                'Verify Code'
              ) : (
                'Sign In'
              )}
            </Button>

            {!mfaRequired && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Test Credentials
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      fontFamily: 'monospace',
                    }}
                  >
                    Admin User (with MFA)
                    <br />
                    Email: admin@gmail.com
                    <br />
                    Pass: admin123
                    <br />
                   
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 