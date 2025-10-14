/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { ReactElement, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TableSortLabel from '@mui/material/TableSortLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { AdminUsersParams } from '../../../classes/client/admin-client';
import AppConfig from '../../../classes/app-config';
import { useMutation, useQuery, useQueryClient } from 'react-query';

interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  locale: string;
  creationDate: string;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedDate?: string;
  allowSendEmail: boolean;
  authenticationType: string;
}

interface UserFormData {
  firstname: string;
  lastname: string;
  email: string;
  locale: string;
  allowSendEmail: boolean;
}

type SortField = 'email' | 'firstname' | 'lastname' | 'creationDate' | 'isActive';
type SortDirection = 'asc' | 'desc';

const AccountManagement = (): ReactElement => {
  const intl = useIntl();
  const client = AppConfig.getAdminClient();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filterActive] = useState<string>('all');
  const [filterSuspended, setFilterSuspended] = useState<string>('all');
  const [filterAuthType, setFilterAuthType] = useState<string>('all');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set filter loading state when filters change
  useEffect(() => {
    setIsFilterLoading(true);
  }, [debouncedSearchTerm, filterStatus, filterAuthType, filterSuspended]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    firstname: '',
    lastname: '',
    email: '',
    locale: 'en',
    allowSendEmail: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Suspension dialog state
  const [isSuspensionDialogOpen, setIsSuspensionDialogOpen] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [suspensionReason, setSuspensionReason] = useState<string>('');

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Unsuspend confirmation dialog state
  const [isUnsuspendDialogOpen, setIsUnsuspendDialogOpen] = useState(false);
  const [unsuspendingUser, setUnsuspendingUser] = useState<User | null>(null);

  // Activate confirmation dialog state
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [activatingUser, setActivatingUser] = useState<User | null>(null);

  // Suspension reasons
  const suspensionReasons = [
    { value: 'ABUSE', label: 'Abuse' },
    { value: 'TERMS_VIOLATION', label: 'Terms Violation' },
    { value: 'SECURITY_CONCERN', label: 'Security Concern' },
    { value: 'MANUAL_REVIEW', label: 'Manual Review' },
    { value: 'INACTIVITY', label: 'Inactivity' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Fetch users
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery(
    [
      'adminUsers',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      sortField,
      sortDirection,
      filterActive,
      filterSuspended,
      filterAuthType,
    ],
    () => {
      const params: AdminUsersParams = {
        page: currentPage - 1, // Convert to 0-based indexing for backend
        pageSize,
        search: debouncedSearchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection,
        filterActive: filterActive !== 'all' ? filterActive === 'active' : undefined,
        filterSuspended: filterSuspended !== 'all' ? filterSuspended === 'suspended' : undefined,
        filterAuthType: filterAuthType !== 'all' ? filterAuthType : undefined,
      };
      console.log('Users Query triggered with params:', params);
      return client.getAdminUsers(params);
    },
    {
      retry: 1,
      staleTime: 0, // Always refetch when query key changes
      keepPreviousData: true,
      onSettled: () => {
        // Clear filter and pagination loading states when query completes
        setIsFilterLoading(false);
        setIsPaginationLoading(false);
      },
    },
  );

  const users = usersResponse?.data || [];
  const totalPages = usersResponse?.totalPages || 0;

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ userId, userData }: { userId: number; userData: Partial<UserFormData> }) =>
      client.updateAdminUser(userId, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        setIsEditDialogOpen(false);
        setEditingUser(null);
        setFormErrors({});
      },
      onError: (error: Error) => {
        console.error('Failed to update user:', error);
        setFormErrors({ general: 'Failed to update user. Please try again.' });
      },
    },
  );

  // Create user mutation
  const createUserMutation = useMutation(
    (userData: UserFormData & { password: string }) => {
      const adminUserData = {
        ...userData,
        creationDate: new Date().toISOString(),
        isActive: true,
        isSuspended: false,
        authenticationType: 'DATABASE',
      };
      return client.createAdminUser(adminUserData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        setIsCreateDialogOpen(false);
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          locale: 'en',
          allowSendEmail: false,
        });
        setFormErrors({});
      },
      onError: (error: Error) => {
        console.error('Failed to create user:', error);
        setFormErrors({ general: 'Failed to create user. Please try again.' });
      },
    },
  );

  // Delete user mutation
  const deleteUserMutation = useMutation((userId: number) => client.deleteAdminUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries('adminUsers');
    },
    onError: (error: Error) => {
      console.error('Failed to delete user:', error);
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation(
    ({ userId, reason }: { userId: number; reason?: string }) =>
      client.updateUserSuspension(userId, { suspended: true, suspensionReason: reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        setIsSuspensionDialogOpen(false);
        setSuspendingUser(null);
        setSuspensionReason('');
      },
      onError: (error: Error) => {
        console.error('Failed to suspend user:', error);
      },
    },
  );

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation(
    (userId: number) => client.updateUserSuspension(userId, { suspended: false }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
      },
      onError: (error: Error) => {
        console.error('Failed to unsuspend user:', error);
      },
    },
  );

  // Activate user mutation
  const activateUserMutation = useMutation((userId: number) => client.activateAdminUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries('adminUsers');
    },
    onError: (error: Error) => {
      console.error('Failed to activate user:', error);
    },
  });

  // TODO: Implement filtering and sorting functionality

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      locale: user.locale || 'en',
      allowSendEmail: user.allowSendEmail,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      locale: 'en',
      allowSendEmail: false,
    });
    setFormErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleFormSubmit = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      errors.firstname = 'First name is required';
    }
    if (!formData.lastname.trim()) {
      errors.lastname = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingUser) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        userData: formData,
      });
    } else {
      // For creating, we need a password
      const password = prompt('Enter password for new user:');
      if (password) {
        createUserMutation.mutate({
          ...formData,
          password,
        });
      }
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleSuspendUser = (user: User) => {
    setSuspendingUser(user);
    setIsSuspensionDialogOpen(true);
    setSuspensionReason('');
  };

  const handleUnsuspendUser = (user: User) => {
    setUnsuspendingUser(user);
    setIsUnsuspendDialogOpen(true);
  };

  const handleConfirmUnsuspend = () => {
    if (unsuspendingUser) {
      unsuspendUserMutation.mutate(unsuspendingUser.id);
      setIsUnsuspendDialogOpen(false);
      setUnsuspendingUser(null);
    }
  };

  const handleCancelUnsuspend = () => {
    setIsUnsuspendDialogOpen(false);
    setUnsuspendingUser(null);
  };

  const handleActivateUser = (user: User) => {
    setActivatingUser(user);
    setIsActivateDialogOpen(true);
  };

  const handleConfirmActivate = () => {
    if (activatingUser) {
      activateUserMutation.mutate(activatingUser.id);
      setIsActivateDialogOpen(false);
      setActivatingUser(null);
    }
  };

  const handleCancelActivate = () => {
    setIsActivateDialogOpen(false);
    setActivatingUser(null);
  };

  const handleConfirmSuspension = () => {
    if (suspendingUser) {
      suspendUserMutation.mutate({
        userId: suspendingUser.id,
        reason: suspensionReason || undefined,
      });
    }
  };

  const handleCancelSuspension = () => {
    setIsSuspensionDialogOpen(false);
    setSuspendingUser(null);
    setSuspensionReason('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (user: User) => {
    if (user.isSuspended) {
      const reason = user.suspensionReason ? ` (${user.suspensionReason})` : '';
      const tooltip = user.suspendedDate
        ? `Suspended on: ${formatDate(user.suspendedDate)}`
        : 'Suspended';
      return (
        <Tooltip title={tooltip}>
          <Chip label={`Suspended${reason}`} color="error" size="small" />
        </Tooltip>
      );
    } else if (!user.isActive) {
      return (
        <Chip
          label={intl.formatMessage({
            id: 'admin.status-inactive',
            defaultMessage: 'Inactive',
          })}
          color="warning"
          size="small"
        />
      );
    } else {
      return (
        <Chip
          label={intl.formatMessage({ id: 'admin.status-active', defaultMessage: 'Active' })}
          color="success"
          size="small"
        />
      );
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load users: {(error as Error)?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                {intl.formatMessage({
                  id: 'admin.accounts.title',
                  defaultMessage: 'User Management',
                })}
              </Typography>
            </Box>
          }
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip
                title={intl.formatMessage({
                  id: 'admin.accounts.refresh',
                  defaultMessage: 'Refresh Data',
                })}
              >
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  disabled={isLoading || isFilterLoading}
                  sx={{ borderRadius: 2 }}
                >
                  {intl.formatMessage({
                    id: 'admin.accounts.refresh',
                    defaultMessage: 'Refresh',
                  })}
                </Button>
              </Tooltip>
              <Tooltip
                title={intl.formatMessage({
                  id: 'admin.accounts.add-user',
                  defaultMessage: 'Add New User',
                })}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateUser}
                  sx={{ borderRadius: 2 }}
                >
                  {intl.formatMessage({
                    id: 'admin.accounts.create',
                    defaultMessage: 'Create User',
                  })}
                </Button>
              </Tooltip>
            </Stack>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {intl.formatMessage({
                id: 'admin.accounts.subtitle',
                defaultMessage: 'Manage user accounts, permissions, and settings',
              })}
            </Typography>
          }
        />
      </Card>

      {/* Filters Section */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <SearchIcon color="primary" />
            {intl.formatMessage({
              id: 'admin.accounts.filters',
              defaultMessage: 'Search & Filters',
            })}
          </Typography>
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <TextField
              placeholder={intl.formatMessage({
                id: 'admin.accounts.search',
                defaultMessage: 'Search users...',
              })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || isFilterLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment:
                  isLoading || isFilterLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label={intl.formatMessage({ id: 'admin.status', defaultMessage: 'Status' })}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={isLoading || isFilterLoading}
                endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Auth Type</InputLabel>
              <Select
                value={filterAuthType}
                label={intl.formatMessage({ id: 'admin.auth-type', defaultMessage: 'Auth Type' })}
                onChange={(e) => setFilterAuthType(e.target.value)}
                disabled={isLoading || isFilterLoading}
                endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="DATABASE">Database</MenuItem>
                <MenuItem value="GOOGLE_OAUTH2">Google</MenuItem>
                <MenuItem value="FACEBOOK_OAUTH2">Facebook</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Suspension Status</InputLabel>
              <Select
                value={filterSuspended}
                label={intl.formatMessage({
                  id: 'admin.suspension-status',
                  defaultMessage: 'Suspension Status',
                })}
                onChange={(e) => setFilterSuspended(e.target.value)}
                disabled={isLoading || isFilterLoading}
                endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="suspended">Suspended Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortDirection : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'firstname'}
                  direction={sortField === 'firstname' ? sortDirection : 'asc'}
                  onClick={() => handleSort('firstname')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Auth Type</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'creationDate'}
                  direction={sortField === 'creationDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('creationDate')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {intl.formatMessage({
                      id: 'admin.accounts.no-users',
                      defaultMessage: 'No users found',
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{getStatusChip(user)}</TableCell>
                  <TableCell>
                    <Chip label={user.authenticationType} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>{formatDate(user.creationDate)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditUser(user)}
                      title={intl.formatMessage({
                        id: 'admin.edit-user',
                        defaultMessage: 'Edit user',
                      })}
                    >
                      <EditIcon />
                    </IconButton>
                    {!user.isActive && user.authenticationType === 'DATABASE' && (
                      <IconButton
                        size="small"
                        onClick={() => handleActivateUser(user)}
                        title={intl.formatMessage({
                          id: 'admin.activate-user',
                          defaultMessage: 'Activate user',
                        })}
                        color="info"
                      >
                        <MarkEmailReadIcon />
                      </IconButton>
                    )}
                    {user.isSuspended ? (
                      <IconButton
                        size="small"
                        onClick={() => handleUnsuspendUser(user)}
                        title={intl.formatMessage({
                          id: 'admin.unsuspend-user',
                          defaultMessage: 'Unsuspend user',
                        })}
                        color="success"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleSuspendUser(user)}
                        title={intl.formatMessage({
                          id: 'admin.suspend-user',
                          defaultMessage: 'Suspend user',
                        })}
                        color="warning"
                      >
                        <BlockIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user)}
                      title={intl.formatMessage({
                        id: 'admin.delete-user',
                        defaultMessage: 'Delete user',
                      })}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => {
              console.log('Users Pagination clicked:', { oldPage: currentPage, newPage: page });
              setIsPaginationLoading(true);
              setCurrentPage(page);
            }}
            color="primary"
            variant="outlined"
            shape="rounded"
            showFirstButton
            showLastButton
            disabled={isLoading || isFilterLoading || isPaginationLoading}
          />
          {(isLoading || isFilterLoading || isPaginationLoading) && <CircularProgress size={24} />}
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {intl.formatMessage({
            id: 'admin.accounts.edit-user',
            defaultMessage: 'Edit User',
          })}
        </DialogTitle>
        <DialogContent>
          {formErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.general}
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'common.first-name', defaultMessage: 'First Name' })}
              value={formData.firstname}
              onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              error={!!formErrors.firstname}
              helperText={formErrors.firstname}
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'common.last-name', defaultMessage: 'Last Name' })}
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              error={!!formErrors.lastname}
              helperText={formErrors.lastname}
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'common.email', defaultMessage: 'Email' })}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Locale</InputLabel>
              <Select
                value={formData.locale}
                label={intl.formatMessage({ id: 'common.locale', defaultMessage: 'Locale' })}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="it">Italian</MenuItem>
                <MenuItem value="pt">Portuguese</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowSendEmail}
                  onChange={(e) => setFormData({ ...formData, allowSendEmail: e.target.checked })}
                />
              }
              label={intl.formatMessage({
                id: 'common.allow-email-notifications',
                defaultMessage: 'Allow Email Notifications',
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={updateUserMutation.isLoading}
          >
            {updateUserMutation.isLoading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {intl.formatMessage({
            id: 'admin.accounts.create-user',
            defaultMessage: 'Create User',
          })}
        </DialogTitle>
        <DialogContent>
          {formErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.general}
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'common.first-name', defaultMessage: 'First Name' })}
              value={formData.firstname}
              onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              error={!!formErrors.firstname}
              helperText={formErrors.firstname}
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'common.last-name', defaultMessage: 'Last Name' })}
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              error={!!formErrors.lastname}
              helperText={formErrors.lastname}
              fullWidth
            />
            <TextField
              label={intl.formatMessage({ id: 'common.email', defaultMessage: 'Email' })}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Locale</InputLabel>
              <Select
                value={formData.locale}
                label={intl.formatMessage({ id: 'common.locale', defaultMessage: 'Locale' })}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="it">Italian</MenuItem>
                <MenuItem value="pt">Portuguese</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowSendEmail}
                  onChange={(e) => setFormData({ ...formData, allowSendEmail: e.target.checked })}
                />
              }
              label={intl.formatMessage({
                id: 'common.allow-email-notifications',
                defaultMessage: 'Allow Email Notifications',
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={createUserMutation.isLoading}
          >
            {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog
        open={isSuspensionDialogOpen}
        onClose={handleCancelSuspension}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to suspend user &quot;{suspendingUser?.email}&quot;?
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Suspension Reason</InputLabel>
            <Select
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              label={intl.formatMessage({
                id: 'admin.suspension-reason',
                defaultMessage: 'Suspension Reason',
              })}
            >
              {suspensionReasons.map((reason) => (
                <MenuItem key={reason.value} value={reason.value}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSuspension}>Cancel</Button>
          <Button
            onClick={handleConfirmSuspension}
            color="error"
            variant="contained"
            disabled={suspendUserMutation.isLoading}
          >
            {suspendUserMutation.isLoading ? 'Suspending...' : 'Suspend User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body2">
            Are you sure you want to delete user &quot;{deletingUser?.email}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isLoading}
          >
            {deleteUserMutation.isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsuspend Confirmation Dialog */}
      <Dialog open={isUnsuspendDialogOpen} onClose={handleCancelUnsuspend} maxWidth="sm" fullWidth>
        <DialogTitle>Unsuspend User</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to unsuspend user &quot;{unsuspendingUser?.email}&quot;?
          </Typography>
          {unsuspendingUser?.suspensionReason && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Current suspension reason: {unsuspendingUser.suspensionReason}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnsuspend}>Cancel</Button>
          <Button
            onClick={handleConfirmUnsuspend}
            color="success"
            variant="contained"
            disabled={unsuspendUserMutation.isLoading}
          >
            {unsuspendUserMutation.isLoading ? 'Unsuspending...' : 'Unsuspend User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={isActivateDialogOpen} onClose={handleCancelActivate} maxWidth="sm" fullWidth>
        <DialogTitle>Activate User</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will allow the user to login immediately without email confirmation.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to manually activate user &quot;{activatingUser?.email}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelActivate}>Cancel</Button>
          <Button
            onClick={handleConfirmActivate}
            color="primary"
            variant="contained"
            disabled={activateUserMutation.isLoading}
          >
            {activateUserMutation.isLoading ? 'Activating...' : 'Activate User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountManagement;
