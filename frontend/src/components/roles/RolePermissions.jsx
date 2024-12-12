import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { roleApi } from '../../services/roleApi';
import { permissionsApi } from '../../services/permissionsApi';

export default function RolePermissions({ roleId }) {
  const [role, setRole] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roleData, permissions, roles] = await Promise.all([
        roleApi.getRoleById(roleId),
        permissionsApi.getAllPermissions(),
        roleApi.getAllRoles(),
      ]);

      setRole(roleData);
      setAvailablePermissions(permissions);
      setAvailableRoles(roles.filter(r => r.id !== roleId));
      setSelectedPermissions(roleData.permissions);
    } catch (error) {
      setError(error.message);
      console.error('Error loading role data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (newPermissions) => {
    try {
      setLoading(true);
      const updatedRole = await roleApi.assignPermissions(roleId, newPermissions);
      setRole(updatedRole);
      setSelectedPermissions(updatedRole.permissions);
    } catch (error) {
      setError(error.message);
      console.error('Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInheritanceChange = async (parentRoleId) => {
    try {
      setLoading(true);
      const updatedRole = await roleApi.setInheritance(roleId, parentRoleId || null);
      setRole(updatedRole);
    } catch (error) {
      setError(error.message);
      console.error('Error updating inheritance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Role Inheritance
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Inherits From</InputLabel>
          <Select
            value={role.inheritsFrom || ''}
            onChange={(e) => handleInheritanceChange(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {availableRoles.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Permissions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={loading}
          >
            Add Permissions
          </Button>
        </Box>

        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Direct Permissions
        </Typography>
        <Box sx={{ mb: 3 }}>
          {role.permissions.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {role.permissions.map((permissionId) => {
                const permission = availablePermissions.find(p => p.id === permissionId);
                return permission ? (
                  <Chip
                    key={permission.id}
                    label={permission.name}
                    onDelete={() => handlePermissionChange(
                      role.permissions.filter(id => id !== permission.id)
                    )}
                    disabled={loading}
                  />
                ) : null;
              })}
            </Box>
          ) : (
            <Typography color="textSecondary">No direct permissions assigned</Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Inherited Permissions
        </Typography>
        <Box>
          {role.effectivePermissions
            .filter(permId => !role.permissions.includes(permId))
            .map((permissionId) => {
              const permission = availablePermissions.find(p => p.id === permissionId);
              return permission ? (
                <Chip
                  key={permission.id}
                  label={permission.name}
                  variant="outlined"
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ) : null;
            })}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Permissions</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={availablePermissions}
            getOptionLabel={(option) => option.name}
            value={availablePermissions.filter(p => selectedPermissions.includes(p.id))}
            onChange={(_, newValue) => {
              setSelectedPermissions(newValue.map(v => v.id));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Permissions"
                placeholder="Select permissions"
                margin="normal"
              />
            )}
            renderOption={(props, option) => (
              <MenuItem {...props}>
                <ListItemText
                  primary={option.name}
                  secondary={option.description}
                />
              </MenuItem>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handlePermissionChange(selectedPermissions);
              setOpenDialog(false);
            }}
            variant="contained"
            disabled={loading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 