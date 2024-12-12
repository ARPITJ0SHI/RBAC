import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Card,
  Grid,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useRoles } from '../../hooks/useRoles';

export default function RoleList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { roles, loading, error, deleteRole } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionColor = (permission) => {
    switch (permission.toLowerCase()) {
      case 'create':
        return theme.palette.success;
      case 'read':
        return theme.palette.info;
      case 'update':
        return theme.palette.warning;
      case 'delete':
        return theme.palette.error;
      default:
        return theme.palette.primary;
    }
  };

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom={false} fontWeight={600}>
              Role Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and configure user roles and their permissions
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/roles/new')}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            },
          }}
        >
          Add Role
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search roles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography align="center">Loading...</Typography>
          </Grid>
        ) : filteredRoles.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center">No roles found</Typography>
          </Grid>
        ) : (
          filteredRoles.map((role) => (
            <Grid item xs={12} md={6} lg={4} key={role.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {role.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit Role">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/roles/${role.id}`)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Role">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(role.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      minHeight: 40,
                    }}
                  >
                    {role.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {role.permissions?.map((permission) => {
                      const color = getPermissionColor(permission);
                      return (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          sx={{
                            backgroundColor: alpha(color.main, 0.1),
                            color: color.main,
                            borderRadius: 1.5,
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: alpha(color.main, 0.2),
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
} 