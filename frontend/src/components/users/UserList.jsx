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
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRBAC } from '../../contexts/RBACContext';

export default function UserList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, dispatch } = useRBAC();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionAnchorEl, setbulkActionAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

 
  const roles = ['all', ...new Set(state.users.map(user => user.role))];
  const statuses = ['all', 'active', 'inactive'];

  
  const filteredUsers = state.users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAddUser = () => {
    navigate('/users/new');
  };

  const handleEditUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      dispatch({
        type: 'DELETE_USER',
        payload: userToDelete.id,
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'activate':
        dispatch({
          type: 'UPDATE_USERS_STATUS',
          payload: { ids: selectedUsers, status: 'active' },
        });
        break;
      case 'deactivate':
        dispatch({
          type: 'UPDATE_USERS_STATUS',
          payload: { ids: selectedUsers, status: 'inactive' },
        });
        break;
      case 'delete':
        dispatch({
          type: 'DELETE_USERS',
          payload: selectedUsers,
        });
        break;
      default:
        break;
    }
    setSelectedUsers([]);
    setbulkActionAnchorEl(null);
  };

  const handleExport = () => {
    const exportData = filteredUsers.map(user => ({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom={false} fontWeight={600}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system users and their roles
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
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
          {roles.map(role => (
            <Chip
              key={role}
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              onClick={() => setSelectedRole(role)}
              color={selectedRole === role ? 'primary' : 'default'}
              variant={selectedRole === role ? 'filled' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
          {statuses.map(status => (
            <Chip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              onClick={() => setSelectedStatus(status)}
              color={selectedStatus === status ? 'primary' : 'default'}
              variant={selectedStatus === status ? 'filled' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Box>
      </Box>

     
      <Grid container spacing={2}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
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
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit user">
                    <IconButton size="small" onClick={() => handleEditUser(user.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete user">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={user.role}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    textTransform: 'capitalize',
                  }}
                />
                <Chip
                  size="small"
                  label={user.status}
                  sx={{
                    bgcolor: user.status === 'active'
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    color: user.status === 'active'
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

   
      {filteredUsers.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
          }}
        >
          <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? `No users match "${searchQuery}"`
              : 'Try adding some users to get started'}
          </Typography>
        </Box>
      )}

   
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
            Delete User
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
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