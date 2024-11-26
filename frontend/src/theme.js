import { createTheme } from '@mui/material';

const getTheme = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
      : {
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
          },
          secondary: {
            main: '#f48fb1',
            light: '#fce4ec',
            dark: '#f06292',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          ...(mode === 'dark' && {
            backgroundImage: 'none',
          }),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...(mode === 'dark' && {
            backgroundImage: 'none',
          }),
        },
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getTheme(mode));
export default createAppTheme('light');
