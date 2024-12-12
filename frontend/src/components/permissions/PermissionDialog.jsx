import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Typography,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import { useRBAC } from '../../contexts/RBACContext';

const PERMISSION_CATEGORIES = ['user',  'admin', 'system'];

export default function PermissionDialog({ open, onClose, permission = null }) {
  const theme = useTheme();
  const { state, dispatch } = useRBAC();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    roles: [],
  });
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);

  const isEdit = Boolean(permission);

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description,
        category: permission.category,
        roles: permission.roles || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        roles: [],
      });
    }
    setErrors({});
    setConflicts([]);
  }, [permission]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Check for naming conflicts
    const conflictingPerms = state.permissions.filter(
      p => p.name.toLowerCase() === formData.name.toLowerCase() && p._id !== permission?._id
    );
    
    if (conflictingPerms.length > 0) {
      newErrors.name = 'Permission name already exists';
      setConflicts(conflictingPerms);
    } else {
      setConflicts([]);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const permissionData = {
      ...formData,
      _id: permission?._id || Date.now().toString(),
    };

    if (isEdit) {
      dispatch({
        type: 'UPDATE_PERMISSION',
        payload: permissionData,
      });
    } else {
      dispatch({
        type: 'ADD_PERMISSION',
        payload: permissionData,
      });
    }

    onClose();
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {isEdit ? 'Edit Permission' : 'Create Permission'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit ? 'Modify existing permission details' : 'Add a new permission to the system'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {conflicts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This permission name conflicts with existing permissions
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Permission Name"
            value={formData.name}
            onChange={handleChange('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            error={Boolean(errors.description)}
            helperText={errors.description}
            fullWidth
            multiline
            rows={2}
          />

          <FormControl fullWidth error={Boolean(errors.category)}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange('category')}
              label="Category"
            >
              {PERMISSION_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            multiple
            value={formData.roles}
            onChange={(_, newValue) => {
              setFormData(prev => ({ ...prev, roles: newValue }));
            }}
            options={state.roles.map(role => role.name)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assigned Roles"
                placeholder="Select roles"
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Permission'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 