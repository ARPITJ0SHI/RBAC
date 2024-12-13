import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  Tooltip,
  Alert,
  TablePagination,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Stack,
  Grid,
  Fade,
  Zoom,
  CircularProgress,
  Snackbar,
  Backdrop,
  InputAdornment,
  alpha,
  TableSortLabel,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { userApi } from '../../services/userApi';
import { formatISO9075 } from 'date-fns';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

export default function UserManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    status: 'active',
    password: '',
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      showSnackbar('Failed to load users', 'error');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await userApi.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    handleFilterClose();
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || user.status === statusFilter) &&
      (roleFilter === 'all' || user.role === roleFilter)
    )
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (a[sortConfig.field] < b[sortConfig.field]) return -1 * direction;
      if (a[sortConfig.field] > b[sortConfig.field]) return 1 * direction;
      return 0;
    });

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role._id,
        status: user.status,
        password: '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        name: '',
        role: '',
        status: 'active',
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedUser) {
        const { role, ...userData } = formData;
     
        const updatedUser = await userApi.updateUser(selectedUser._id, userData);
        
        
        if (role !== selectedUser.role._id) {
          await userApi.updateUserRole(selectedUser._id, role);
        }
      } else {
        const result = await userApi.createUser(formData);
        if (result.generatedPassword) {
          showSnackbar(
            `User created successfully. Generated password: ${result.generatedPassword}`,
            'success'
          );
        } else {
          showSnackbar('User created successfully', 'success');
        }
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      setError(error.message);
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await userApi.deleteUser(id);
        loadUsers();
      } catch (error) {
        setError('Failed to delete user');
        console.error('Error deleting user:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      await userApi.updateUserStatus(id, newStatus);
      loadUsers();
    } catch (error) {
      setError('Failed to update user status');
      console.error('Error updating user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedUsers.length === 0) return;
    try {
      setLoading(true);
      await userApi.bulkUpdateStatus(selectedUsers, status);
      loadUsers();
      setSelectedUsers([]);
    } catch (error) {
      setError('Failed to update users status');
      console.error('Error updating users status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {filteredAndSortedUsers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((user) => (
          <Grid item xs={12} key={user._id}>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Card sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{user.name}</Typography>
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'error'}
                        size="small"
                        sx={{ 
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                    </Box>
                    <Typography color="textSecondary">{user.email}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">Role:</Typography>
                      <Chip
                        label={user.role.name}
                        color={user.role.name === 'admin' ? 'primary' : 'default'}
                        size="small"
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Last Login: {user.lastLogin ? formatISO9075(new Date(user.lastLogin)) : 'Never'}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="Edit User" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Status" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleStatusChange(
                        user._id,
                        user.status === 'active' ? 'inactive' : 'active'
                      )}
                      color={user.status === 'active' ? 'error' : 'success'}
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    >
                      {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user._id)}
                      color="error"
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Zoom>
          </Grid>
        ))}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer 
      component={Paper}
      sx={{
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedUsers.length === filteredAndSortedUsers.length}
                indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredAndSortedUsers.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            {['name', 'email', 'role', 'status', 'lastLogin'].map((field) => (
              <TableCell key={field}>
                <TableSortLabel
                  active={sortConfig.field === field}
                  direction={sortConfig.field === field ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort(field)}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAndSortedUsers
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((user) => (
              <Fade in={true} key={user._id}>
                <TableRow
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.name}
                      color={user.role.name === 'admin' ? 'primary' : 'default'}
                      size="small"
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? formatISO9075(new Date(user.lastLogin)) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit User" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                          color="primary"
                          sx={{ 
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'scale(1.1)' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Toggle Status" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(
                            user._id,
                            user.status === 'active' ? 'inactive' : 'active'
                          )}
                          color={user.status === 'active' ? 'error' : 'success'}
                          sx={{ 
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'scale(1.1)' },
                          }}
                        >
                          {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user._id)}
                          color="error"
                          sx={{ 
                            transition: 'all 0.2s ease',
                            '&:hover': { transform: 'scale(1.1)' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
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
          User Management
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' } 
        }}>
          <TextField
            placeholder="Search users..."
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
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            Filters
          </Button>
          {selectedUsers.length > 0 && (
            <>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleBulkStatusChange('active')}
                startIcon={<CheckCircleIcon />}
                fullWidth={isMobile}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Activate Selected
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleBulkStatusChange('inactive')}
                startIcon={<BlockIcon />}
                fullWidth={isMobile}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Deactivate Selected
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Box sx={{ mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          component="div"
          count={filteredAndSortedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

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
            {selectedUser ? 'Edit User' : 'Add User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              {!selectedUser && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  fullWidth
                  helperText="Password must be at least 6 characters long"
                />
              )}
              <TextField
                select
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                fullWidth
              >
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
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
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => handleStatusFilterChange('all')}>
          <ListItemIcon>
            <FilterIcon />
          </ListItemIcon>
          <ListItemText>All Status</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilterChange('active')}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText>Active Only</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilterChange('inactive')}>
          <ListItemIcon>
            <BlockIcon color="error" />
          </ListItemIcon>
          <ListItemText>Inactive Only</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRoleFilterChange('all')}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText>All Roles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleRoleFilterChange('admin')}>
          <ListItemIcon>
            <SecurityIcon color="primary" />
          </ListItemIcon>
          <ListItemText>Admins Only</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleRoleFilterChange('user')}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText>Users Only</ListItemText>
        </MenuItem>
      </Menu>

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