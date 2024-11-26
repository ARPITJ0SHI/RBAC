import { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  VpnKey as PermissionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRBAC } from '../../contexts/RBACContext';
import PermissionDialog from './PermissionDialog';

export default function PermissionList() {
  const theme = useTheme();
  const { state, dispatch } = useRBAC();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);

  // Get unique categories from permissions
  const categories = ['all', ...new Set(state.permissions.map(perm => perm.category))];

  // Filter permissions based on search and category
  const filteredPermissions = state.permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const category = permission.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  const getPermissionColor = (category) => {
    const colors = {
      'user': theme.palette.primary.main,
      'role': theme.palette.secondary.main,
      'admin': theme.palette.error.main,
      'system': theme.palette.info.main,
      'default': theme.palette.success.main,
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const handleAddPermission = () => {
    setSelectedPermission(null);
    setDialogOpen(true);
  };

  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    setDialogOpen(true);
  };

  const handleDeleteClick = (permission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (permissionToDelete) {
      dispatch({
        type: 'DELETE_PERMISSION',
        payload: permissionToDelete.id,
      });
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
    }
  };

  const checkPermissionConflicts = (permission) => {
    // Check for role conflicts
    const conflictingRoles = state.roles.filter(role => 
      role.permissions?.includes(permission.name)
    );

    return conflictingRoles;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PermissionIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom={false} fontWeight={600}>
              Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system permissions and access controls
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Add new permission">
          <IconButton
            color="primary"
            onClick={handleAddPermission}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterIcon color="action" />
          {categories.map(category => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Box>
      </Box>

      {/* Permissions Grid */}
      {Object.entries(groupedPermissions).map(([category, permissions]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: getPermissionColor(category),
              textTransform: 'capitalize',
            }}
          >
            <PermissionIcon sx={{ fontSize: 20 }} />
            {category}
          </Typography>
          <Grid container spacing={2}>
            {permissions.map((permission) => {
              const conflicts = checkPermissionConflicts(permission);
              const hasConflicts = conflicts.length > 0;

              return (
                <Grid item xs={12} sm={6} md={4} key={permission.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {permission.name}
                          {hasConflicts && (
                            <Tooltip title={`Used by ${conflicts.length} role(s)`}>
                              <WarningIcon
                                sx={{
                                  ml: 1,
                                  fontSize: 16,
                                  color: theme.palette.warning.main,
                                  verticalAlign: 'text-top',
                                }}
                              />
                            </Tooltip>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {permission.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit permission">
                          <IconButton size="small" onClick={() => handleEditPermission(permission)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete permission">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(permission)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={permission.category}
                        sx={{
                          bgcolor: alpha(getPermissionColor(permission.category), 0.1),
                          color: getPermissionColor(permission.category),
                          textTransform: 'capitalize',
                        }}
                      />
                      {permission.roles?.map(role => (
                        <Chip
                          key={role}
                          size="small"
                          label={role}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      {/* Empty State */}
      {filteredPermissions.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
          }}
        >
          <PermissionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No permissions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? `No permissions match "${searchQuery}"`
              : 'Try adding some permissions to get started'}
          </Typography>
        </Box>
      )}

      {/* Permission Dialog */}
      <PermissionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        permission={selectedPermission}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Delete Permission
          </Typography>
        </DialogTitle>
        <DialogContent>
          {permissionToDelete && checkPermissionConflicts(permissionToDelete).length > 0 ? (
            <Box>
              <Typography color="error" gutterBottom>
                Warning: This permission is currently in use
              </Typography>
              <Typography variant="body2">
                This permission is assigned to roles. Deleting it may cause access control issues.
              </Typography>
            </Box>
          ) : (
            <Typography>
              Are you sure you want to delete this permission? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 