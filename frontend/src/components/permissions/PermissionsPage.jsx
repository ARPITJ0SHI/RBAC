import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';

const categories = ['User Management', 'Role Management', 'Permission Management', 'System'];

export default function PermissionsPage() {
  const theme = useTheme();
  const { permissions, loading, error, createPermission, updatePermission, deletePermission } = usePermissions();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
  });

  const handleOpenDialog = (permission = null) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormData({
        name: permission.name || '',
        description: permission.description || '',
        category: permission.category || '',
        isActive: permission.isActive ?? true,
      });
    } else {
      setSelectedPermission(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPermission(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isActive: formData.isActive,
      };

      if (selectedPermission) {
        await updatePermission(selectedPermission._id, updateData);
      } else {
        await createPermission(updateData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save permission:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await deletePermission(id);
      } catch (error) {
        console.error('Failed to delete permission:', error);
      }
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3, color: 'error.main' }}>Error: {error}</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Permissions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Permission
        </Button>
      </Box>

      <Grid container spacing={3}>
        {permissions.map((permission) => (
          <Grid item xs={12} sm={6} md={4} key={permission._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {permission.name}
                  </Typography>
                  <Chip
                    label={permission.isActive ? 'Active' : 'Inactive'}
                    color={permission.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {permission.category}
                </Typography>
                <Typography variant="body2">
                  {permission.description}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(permission)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(permission._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedPermission ? 'Edit Permission' : 'Add Permission'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                fullWidth
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<CheckIcon />}>
              {selectedPermission ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 