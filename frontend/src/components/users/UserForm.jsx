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
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  OutlinedInput,
  useTheme,
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  autoClose: true,
};

function getStyles(name, selectedNames, theme) {
  return {
    fontWeight:
      selectedNames.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function UserForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, createUser, updateUser } = useUsers();
  const { roles } = useRoles();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    roles: [],
    status: 'Active',
  });
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const user = users.find(u => u.id === id);
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          roles: user.roles || [],
          status: user.status || 'Active',
        });
      }
    }
  }, [id, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (id) {
        await updateUser(id, formData);
      } else {
        await createUser(formData);
      }
      navigate('/users');
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

  const handleRoleChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      roles: typeof value === 'string' ? [value] : value,
    }));
  };

  const handleStatusChange = (event) => {
    setFormData(prev => ({
      ...prev,
      status: event.target.checked ? 'Active' : 'Inactive',
    }));
  };

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {id ? 'Edit User' : 'Create New User'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="role-select-label">Roles</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            multiple
            open={selectOpen}
            onOpen={() => setSelectOpen(true)}
            onClose={() => setSelectOpen(false)}
            value={formData.roles}
            onChange={handleRoleChange}
            input={<OutlinedInput label="Roles" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value}
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      color: 'white',
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {roles.map((role) => (
              <MenuItem
                key={role.id}
                value={role.name}
                style={getStyles(role.name, formData.roles, theme)}
              >
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={formData.status === 'Active'}
              onChange={handleStatusChange}
              color="primary"
            />
          }
          label={formData.status}
          sx={{ my: 2, display: 'block' }}
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              px: 4,
              py: 1,
              fontSize: '1rem',
            }}
          >
            {id ? 'Update' : 'Create'} User
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/users')}
            sx={{
              px: 4,
              py: 1,
              fontSize: '1rem',
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 