import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Fade,
  Zoom,
  CircularProgress,
  Snackbar,
  Backdrop,
  InputAdornment,
  alpha,
  CardHeader,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  ContentCopy as CloneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VpnKey as KeyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ChevronRight as ChevronRightIcon,
  FiberManualRecord as FiberManualRecordIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { roleApi } from '../../services/roleApi';
import { permissionsApi } from '../../services/permissionsApi';

export default function RoleManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedRoles, setExpandedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    inheritsFrom: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Fetching role data...');
      const [rolesData, permissionsData] = await Promise.all([
        roleApi.getRoleHierarchy(),
        permissionsApi.getAllPermissions(),
      ]);
      
      console.log('Received roles data:', rolesData);
      console.log('Received permissions data:', permissionsData);
      
      // Ensure we have valid arrays
      const processedRoles = Array.isArray(rolesData) ? rolesData : [];
      
      // Initialize empty arrays for undefined properties
      const normalizedRoles = processedRoles.map(role => {
        console.log('Processing role:', role);
        return {
          _id: role._id,
          name: role.name,
          description: role.description,
          permissions: Array.isArray(role.permissions) ? role.permissions : [],
          effectivePermissions: Array.isArray(role.effectivePermissions) ? role.effectivePermissions : 
                              Array.isArray(role.permissions) ? role.permissions : [],
          parentRole: role.parentRole || null,
          level: role.level || 0,
          children: Array.isArray(role.children) ? role.children.map(child => ({
            _id: child._id,
            name: child.name,
            description: child.description,
            permissions: Array.isArray(child.permissions) ? child.permissions : [],
            effectivePermissions: Array.isArray(child.effectivePermissions) ? child.effectivePermissions :
                                Array.isArray(child.permissions) ? child.permissions : [],
            parentRole: child.parentRole || null,
            level: child.level || 0
          })) : []
        };
      });

      console.log('Normalized roles:', normalizedRoles);
      setRoles(normalizedRoles);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data: ' + error.message, 'error');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (role = null) => {
    console.log('Opening dialog with role:', role);
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: Array.isArray(role.permissions) ? role.permissions.map(p => p._id || p) : [],
        inheritsFrom: role.parentRole?._id || '',
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
        inheritsFrom: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting form data:', formData);
      
      const submitData = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        parentRole: formData.inheritsFrom || null,
      };

      console.log('Processed submit data:', submitData);

      if (selectedRole) {
        await roleApi.updateRole(selectedRole._id, submitData);
        showSnackbar('Role updated successfully');
      } else {
        await roleApi.createRole(submitData);
        showSnackbar('Role created successfully');
      }
      handleCloseDialog();
      await loadData();
    } catch (error) {
      console.error('Error saving role:', error);
      setError(error.message);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await roleApi.deleteRole(id);
      showSnackbar('Role deleted successfully');
      loadData();
    } catch (error) {
      showSnackbar(error.message, 'error');
      console.error('Error deleting role:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const handleToggleExpand = (roleId) => {
    setExpandedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRoleCard = (role) => {
    console.log('Rendering role card:', role);
    return (
      <Zoom in={true} key={role._id} style={{ transitionDelay: '100ms' }}>
        <Card 
          sx={{ 
            mb: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <CardHeader
            title={role.name}
            subheader={role.description || 'No description available'}
            titleTypographyProps={{
              variant: 'h6',
              fontWeight: 'medium'
            }}
            subheaderTypographyProps={{
              variant: 'body2',
              color: 'text.secondary',
              sx: { mt: 0.5 }
            }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit Role" arrow>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(role)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Role" arrow>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(role._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          <CardContent>
            {role.parentRole && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Inherits from: {role.parentRole.name}
              </Typography>
            )}
            <Typography variant="subtitle2" gutterBottom>
              Permissions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.isArray(role.permissions) && role.permissions.map(permission => (
                <Chip
                  key={permission._id}
                  label={permission.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              {(!Array.isArray(role.permissions) || role.permissions.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No permissions assigned
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    );
  };

  const renderRoleHierarchy = (roles) => {
    // Sort roles by number of permissions
    const sortedRoles = [...roles].sort((a, b) => 
      (b.permissions?.length || 0) - (a.permissions?.length || 0)
    );

    return (
      <Grid container spacing={2}>
        {sortedRoles.map((role) => (
          <Grid item xs={12} key={role._id}>
            <Paper
              sx={{
                p: 2,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {role.name}
                  </Typography>
                  {role.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {role.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit Role" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(role)}
                      sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Role" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(role._id)}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SecurityIcon 
                    color="primary" 
                    sx={{ fontSize: 20 }}
                  />
                  <Typography variant="subtitle2" color="primary">
                    Permissions ({role.permissions?.length || 0})
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'relative',
                    height: 8,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${(role.permissions?.length || 0) / Math.max(...roles.map(r => r.permissions?.length || 0)) * 100}%`,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>

              {role.permissions && role.permissions.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Chip
                      key={permission._id}
                      label={permission.name}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        height: 24,
                        '& .MuiChip-label': {
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                  ))}
                  {role.permissions.length > 3 && (
                    <Chip
                      label={`+${role.permissions.length - 3} more`}
                      size="small"
                      color="default"
                      sx={{ 
                        height: 24,
                        '& .MuiChip-label': {
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h4" component="h1">
          Role Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search roles..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
            sx={{
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              boxShadow: theme.shadows[2],
            }}
          >
            Add Role
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: 3, 
          mb: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Roles
          </Typography>
        </Box>
        {renderRoleHierarchy(filteredRoles)}
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={Zoom}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedRole ? 'Edit Role' : 'Add Role'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                select
                label="Inherits From"
                value={formData.inheritsFrom}
                onChange={(e) => setFormData({ ...formData, inheritsFrom: e.target.value })}
                fullWidth
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {roles
                  .filter(role => role._id !== selectedRole?._id)
                  .map(role => (
                    <MenuItem key={role._id} value={role._id}>
                      {role.name}
                    </MenuItem>
                  ))
                }
              </TextField>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Permissions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {permissions.map(permission => (
                    <Chip
                      key={permission._id}
                      label={permission.name}
                      onClick={() => {
                        const newPermissions = formData.permissions.includes(permission._id)
                          ? formData.permissions.filter(id => id !== permission._id)
                          : [...formData.permissions, permission._id];
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      color={formData.permissions.includes(permission._id) ? 'primary' : 'default'}
                      variant={formData.permissions.includes(permission._id) ? 'filled' : 'outlined'}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {selectedRole ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
} 