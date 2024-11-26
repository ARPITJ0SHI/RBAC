import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { useRoles } from '../../hooks/useRoles';
import { useRBAC } from '../../contexts/RBACContext';

export default function RoleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { roles, createRole, updateRole } = useRoles();
  const { state } = useRBAC();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    if (id) {
      const role = roles.find(r => r.id === id);
      if (role) {
        setFormData({
          name: role.name || '',
          description: role.description || '',
          permissions: role.permissions || [],
        });
      }
    }
  }, [id, roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (id) {
        await updateRole(id, formData);
      } else {
        await createRole(formData);
      }
      navigate('/roles');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      permissions: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {id ? 'Edit Role' : 'Create New Role'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Role Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Permissions</InputLabel>
          <Select
            multiple
            value={formData.permissions}
            onChange={handlePermissionChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {state.permissions.map((permission) => (
              <MenuItem key={permission.id} value={permission.name}>
                {permission.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            {id ? 'Update' : 'Create'} Role
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/roles')}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 