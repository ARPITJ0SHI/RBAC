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
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        roleApi.getRoleHierarchy(),
        permissionsApi.getAllPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      showSnackbar('Failed to load data', 'error');
      console.error('Error loading data:', error);
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
    if (role) {
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        inheritsFrom: role.inheritsFrom || '',
        isActive: role.isActive,
      });
    } else {
      setSelectedRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
        inheritsFrom: '',
        isActive: true,
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
      if (selectedRole) {
        await roleApi.updateRole(selectedRole.id, formData);
        showSnackbar('Role updated successfully');
      } else {
        await roleApi.createRole(formData);
        showSnackbar('Role created successfully');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      setError(error.message);
      showSnackbar(error.message, 'error');
      console.error('Error saving role:', error);
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

  const handleCloneRole = async (role) => {
    try {
      setLoading(true);
      await roleApi.cloneRole(role.id);
      showSnackbar('Role cloned successfully');
      loadData();
    } catch (error) {
      showSnackbar('Failed to clone role', 'error');
      console.error('Error cloning role:', error);
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

  const renderRoleCard = (role) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card 
        key={role.id} 
        sx={{ 
          mb: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {role.name}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {role.description}
              </Typography>
            </Box>
            <Chip
              label={role.isActive ? 'Active' : 'Inactive'}
              color={role.isActive ? 'success' : 'default'}
              size="small"
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions ({role.effectivePermissions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {role.effectivePermissions.map(permId => {
                const permission = permissions.find(p => p.id === permId);
                return permission ? (
                  <Chip
                    key={permission.id}
                    label={permission.name}
                    size="small"
                    variant={role.permissions.includes(permId) ? 'filled' : 'outlined'}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  />
                ) : null;
              })}
            </Box>
          </Box>

          {role.inheritsFrom && (
            <Typography variant="body2" color="textSecondary">
              Inherits from: {roles.find(r => r.id === role.inheritsFrom)?.name}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Clone Role" arrow>
            <IconButton
              size="small"
              onClick={() => handleCloneRole(role)}
              color="primary"
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <CloneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Role" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(role)}
              color="primary"
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={role.children?.length > 0 ? 'Cannot delete: has dependent roles' : 'Delete Role'} arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => handleDelete(role.id)}
                color="error"
                disabled={role.children?.length > 0}
                sx={{ 
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </CardActions>
      </Card>
    </Zoom>
  );

  const renderRoleHierarchy = (roles, level = 0) => (
    <List sx={{ pl: level * 3 }}>
      {roles.map(role => (
        <Fade in={true} key={role.id}>
          <Box>
            <ListItem
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                mb: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon>
                <KeyIcon color={role.isActive ? 'primary' : 'disabled'} />
              </ListItemIcon>
              <ListItemText
                primary={role.name}
                secondary={`${role.effectivePermissions.length} permissions`}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleCloneRole(role)}
                  color="primary"
                >
                  <CloneIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(role)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                {role.children?.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => handleToggleExpand(role.id)}
                  >
                    {expandedRoles.includes(role.id) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                )}
              </Box>
            </ListItem>
            <Collapse in={expandedRoles.includes(role.id)}>
              {renderRoleHierarchy(role.children || [], level + 1)}
            </Collapse>
          </Box>
        </Fade>
      ))}
    </List>
  );

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Role Hierarchy
            </Typography>
            {renderRoleHierarchy(filteredRoles.filter(role => !role.inheritsFrom))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            {filteredRoles.map(role => renderRoleCard(role))}
          </Stack>
        </Grid>
      </Grid>

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
                  .filter(role => role.id !== selectedRole?.id)
                  .map(role => (
                    <MenuItem key={role.id} value={role.id}>
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
                      key={permission.id}
                      label={permission.name}
                      onClick={() => {
                        const newPermissions = formData.permissions.includes(permission.id)
                          ? formData.permissions.filter(id => id !== permission.id)
                          : [...formData.permissions, permission.id];
                        setFormData({ ...formData, permissions: newPermissions });
                      }}
                      color={formData.permissions.includes(permission.id) ? 'primary' : 'default'}
                      variant={formData.permissions.includes(permission.id) ? 'filled' : 'outlined'}
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
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
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