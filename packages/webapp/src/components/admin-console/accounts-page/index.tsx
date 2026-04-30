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
import Collapse from '@mui/material/Collapse';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MapIcon from '@mui/icons-material/Map';
import StorageIcon from '@mui/icons-material/Storage';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { AdminUsersParams } from '../../../classes/client/admin-client';
import { AuthenticationType } from '../../../classes/client';
import AppConfig from '../../../classes/app-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UserMapsDialog from '../shared/UserMapsDialog';
import AccountStatusChip, { getSuspensionReasonLabel } from '../shared/AccountStatusChip';

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
  authenticationType: AuthenticationType;
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
  const facebookEnabled = AppConfig.isFacebookOauth2Enabled();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [filterActive] = useState<string>('all');
  const [filterSuspended, setFilterSuspended] = useState<string>('all');
  const [filterAuthType, setFilterAuthType] = useState<string>('all');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

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
  }, [debouncedSearchTerm, filterAuthType, filterSuspended]);
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

  // User maps dialog state
  const [isUserMapsDialogOpen, setIsUserMapsDialogOpen] = useState(false);
  const [viewingMapsUser, setViewingMapsUser] = useState<User | null>(null);

  // Change password dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Facebook data deletion state
  const [isFacebookFilterExpanded, setIsFacebookFilterExpanded] = useState(false);
  const [facebookIdInput, setFacebookIdInput] = useState('');
  const [facebookLookupResult, setFacebookLookupResult] = useState<User | null>(null);
  const [facebookLookupError, setFacebookLookupError] = useState('');
  const [isFacebookLookupLoading, setIsFacebookLookupLoading] = useState(false);
  const [isRemoveFacebookDialogOpen, setIsRemoveFacebookDialogOpen] = useState(false);
  const [removingFacebookUser, setRemovingFacebookUser] = useState<User | null>(null);

  // Suspension reasons
  const suspensionReasons = [
    {
      value: 'ABUSE',
      label: intl.formatMessage({ id: 'admin.suspension.abuse', defaultMessage: 'Abuse' }),
    },
    {
      value: 'TERMS_VIOLATION',
      label: intl.formatMessage({
        id: 'admin.suspension.terms-violation',
        defaultMessage: 'Terms Violation',
      }),
    },
    {
      value: 'SECURITY_CONCERN',
      label: intl.formatMessage({
        id: 'admin.suspension.security-concern',
        defaultMessage: 'Security Concern',
      }),
    },
    {
      value: 'MANUAL_REVIEW',
      label: intl.formatMessage({
        id: 'admin.suspension.manual-review',
        defaultMessage: 'Manual Review',
      }),
    },
    {
      value: 'INACTIVITY',
      label: intl.formatMessage({
        id: 'admin.suspension.inactivity',
        defaultMessage: 'Inactivity',
      }),
    },
    {
      value: 'OTHER',
      label: intl.formatMessage({ id: 'admin.suspension.other', defaultMessage: 'Other' }),
    },
  ];

  // Fetch users
  const {
    data: usersResponse,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: [
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
    queryFn: () => {
      const params: AdminUsersParams = {
        page: currentPage - 1, // Convert to 0-based indexing for backend
        pageSize,
        search: debouncedSearchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection,
        filterActive: filterActive !== 'all' ? filterActive === 'active' : undefined,
        // filterSuspended: 'all' → undefined (show all users)
        // filterSuspended: 'suspended' → true (show only suspended)
        // filterSuspended: 'not-suspended' → false (show only non-suspended)
        filterSuspended: filterSuspended === 'all' ? undefined : filterSuspended === 'suspended',
        filterAuthType: filterAuthType !== 'all' ? filterAuthType : undefined,
      };
      console.log('Users Query triggered with params:', params);
      return client.getAdminUsers(params);
    },
    retry: 1,
    staleTime: 0, // Always refetch when query key changes
  });

  const users = usersResponse?.data || [];
  const totalPages = usersResponse?.totalPages || 0;

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: number; userData: Partial<UserFormData> }) =>
      client.updateAdminUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setFormErrors({});
    },
    onError: (error: Error) => {
      console.error('Failed to update user:', error);
      setFormErrors({
        general: intl.formatMessage({
          id: 'admin.error.update-user-failed',
          defaultMessage: 'Failed to update user. Please try again.',
        }),
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: UserFormData & { password: string }) => {
      const adminUserData = {
        ...userData,
        creationDate: new Date().toISOString(),
        isActive: true,
        isSuspended: false,
        authenticationType: AuthenticationType.DATABASE,
      };
      return client.createAdminUser(adminUserData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
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
      setFormErrors({
        general: intl.formatMessage({
          id: 'admin.error.create-user-failed',
          defaultMessage: 'Failed to create user. Please try again.',
        }),
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => client.deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    },
    onError: (error: Error) => {
      console.error('Failed to delete user:', error);
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason?: string }) =>
      client.updateUserSuspension(userId, { suspended: true, suspensionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsSuspensionDialogOpen(false);
      setSuspendingUser(null);
      setSuspensionReason('');
    },
    onError: (error: Error) => {
      console.error('Failed to suspend user:', error);
    },
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: (userId: number) => client.updateUserSuspension(userId, { suspended: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsUnsuspendDialogOpen(false);
      setUnsuspendingUser(null);
    },
    onError: (error: Error) => {
      console.error('Failed to unsuspend user:', error);
    },
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: (userId: number) => client.activateAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsActivateDialogOpen(false);
      setActivatingUser(null);
    },
    onError: (error: Error) => {
      console.error('Failed to activate user:', error);
    },
  });

  // Lazy query for user maps (only fetches when enabled)
  const {
    data: userMaps,
    isPending: isPendingUserMaps,
    refetch: refetchUserMaps,
  } = useQuery({
    queryKey: ['userMaps', viewingMapsUser?.id],
    queryFn: () => client.getUserMaps(viewingMapsUser!.id),
    enabled: false, // Lazy loading - only fetch when manually triggered
  });

  // Remove Facebook account mutation
  const removeFacebookAccountMutation = useMutation({
    mutationFn: (userId: number) => client.removeFacebookAccount(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsRemoveFacebookDialogOpen(false);
      setRemovingFacebookUser(null);
      // Clear lookup result since the account changed
      setFacebookLookupResult(null);
      setFacebookIdInput('');
    },
    onError: (error: Error) => {
      console.error('Failed to remove Facebook account:', error);
    },
  });

  const handleFacebookLookup = () => {
    const id = facebookIdInput.trim();
    if (!id) return;
    setIsFacebookLookupLoading(true);
    setFacebookLookupResult(null);
    setFacebookLookupError('');
    client
      .getUserByFacebookId(id)
      .then((user) => setFacebookLookupResult(user as unknown as User))
      .catch(() =>
        setFacebookLookupError(
          intl.formatMessage({
            id: 'admin.facebook.lookup-not-found',
            defaultMessage: 'No account found for this Facebook user ID.',
          }),
        ),
      )
      .finally(() => setIsFacebookLookupLoading(false));
  };

  const handleRemoveFacebookAccount = (user: User) => {
    setRemovingFacebookUser(user);
    setIsRemoveFacebookDialogOpen(true);
  };

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
      errors.firstname = intl.formatMessage({
        id: 'admin.validation.firstname-required',
        defaultMessage: 'First name is required',
      });
    }
    if (!formData.lastname.trim()) {
      errors.lastname = intl.formatMessage({
        id: 'admin.validation.lastname-required',
        defaultMessage: 'Last name is required',
      });
    }
    if (!formData.email.trim()) {
      errors.email = intl.formatMessage({
        id: 'admin.validation.email-required',
        defaultMessage: 'Email is required',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = intl.formatMessage({
        id: 'admin.validation.email-invalid',
        defaultMessage: 'Invalid email format',
      });
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
      const password = prompt(
        intl.formatMessage({
          id: 'admin.prompt.new-user-password',
          defaultMessage: 'Enter password for new user:',
        }),
      );
      if (password) {
        createUserMutation.mutate({
          ...formData,
          password,
        });
      }
    }
  };

  const handleChangePassword = (user: User) => {
    // Check if user uses OAuth authentication
    if (user.authenticationType === AuthenticationType.GOOGLE_OAUTH2) {
      setPasswordError(
        intl.formatMessage({
          id: 'admin.password-error-google',
          defaultMessage:
            'This user is authenticated via Google. Password changes are not available for Google accounts. Please ask the user to manage their password through their Google account.',
        }),
      );
      setChangingPasswordUser(user);
      setIsPasswordDialogOpen(true);
      return;
    }

    if (user.authenticationType === AuthenticationType.FACEBOOK_OAUTH2) {
      setPasswordError(
        intl.formatMessage({
          id: 'admin.password-error-facebook',
          defaultMessage:
            'This user is authenticated via Facebook. Password changes are not available for Facebook accounts. Please ask the user to manage their password through their Facebook account.',
        }),
      );
      setChangingPasswordUser(user);
      setIsPasswordDialogOpen(true);
      return;
    }

    setChangingPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsPasswordDialogOpen(true);
  };

  const handleConfirmPasswordChange = () => {
    if (!changingPasswordUser) return;

    // Validation
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(
        intl.formatMessage({
          id: 'admin.password-error-length',
          defaultMessage: 'Password must be at least 6 characters',
        }),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        intl.formatMessage({
          id: 'admin.password-error-mismatch',
          defaultMessage: 'Passwords do not match',
        }),
      );
      return;
    }

    client
      .changeUserPassword(changingPasswordUser.id, newPassword)
      .then(() => {
        setIsPasswordDialogOpen(false);
        setChangingPasswordUser(null);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      })
      .catch((error) => {
        console.error('Failed to change password:', error);
        setPasswordError(
          intl.formatMessage({
            id: 'admin.password-error-failed',
            defaultMessage: 'Failed to change password',
          }),
        );
      });
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
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

  const handleViewUserMaps = (user: User) => {
    setViewingMapsUser(user);
    setIsUserMapsDialogOpen(true);
    // Trigger lazy loading when dialog opens
    setTimeout(() => refetchUserMaps(), 0);
  };

  const handleCloseUserMapsDialog = () => {
    setIsUserMapsDialogOpen(false);
    setViewingMapsUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAuthIcon = (authenticationType: AuthenticationType) => {
    switch (authenticationType) {
      case AuthenticationType.GOOGLE_OAUTH2:
        return (
          <Tooltip
            title={intl.formatMessage({ id: 'admin.auth.google', defaultMessage: 'Google' })}
          >
            <GoogleIcon color="action" fontSize="small" />
          </Tooltip>
        );
      case AuthenticationType.FACEBOOK_OAUTH2:
        return (
          <Tooltip
            title={intl.formatMessage({ id: 'admin.auth.facebook', defaultMessage: 'Facebook' })}
          >
            <FacebookIcon color="action" fontSize="small" />
          </Tooltip>
        );
      case AuthenticationType.LDAP:
        return (
          <Tooltip title={intl.formatMessage({ id: 'admin.auth.ldap', defaultMessage: 'LDAP' })}>
            <StorageIcon color="action" fontSize="small" />
          </Tooltip>
        );
      case AuthenticationType.DATABASE:
      default:
        return (
          <Tooltip
            title={intl.formatMessage({ id: 'admin.auth.database', defaultMessage: 'Database' })}
          >
            <StorageIcon color="action" fontSize="small" />
          </Tooltip>
        );
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {intl.formatMessage(
          {
            id: 'admin.error.load-users',
            defaultMessage: 'Failed to load users: {message}',
          },
          {
            message:
              (error as Error)?.message ||
              intl.formatMessage({ id: 'admin.error.unknown', defaultMessage: 'Unknown error' }),
          },
        )}
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
                  disabled={isPending || isFilterLoading}
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
          <Box
            display="flex"
            gap={2}
            mb={facebookEnabled && isFacebookFilterExpanded ? 1 : 2}
            flexWrap="wrap"
          >
            <TextField
              placeholder={intl.formatMessage({
                id: 'admin.accounts.search',
                defaultMessage: 'Search users...',
              })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isPending || isFilterLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment:
                  isPending || isFilterLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Auth Type</InputLabel>
              <Select
                value={filterAuthType}
                label={intl.formatMessage({ id: 'admin.auth-type', defaultMessage: 'Auth Type' })}
                onChange={(e) => setFilterAuthType(e.target.value)}
                disabled={isPending || isFilterLoading}
                endAdornment={isPending || isFilterLoading ? <CircularProgress size={20} /> : null}
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
                disabled={isPending || isFilterLoading}
                endAdornment={isPending || isFilterLoading ? <CircularProgress size={20} /> : null}
              >
                <MenuItem value="all">All (Suspended + Active)</MenuItem>
                <MenuItem value="not-suspended">Not Suspended</MenuItem>
                <MenuItem value="suspended">Suspended Only</MenuItem>
              </Select>
            </FormControl>

            {facebookEnabled && (
              <Tooltip
                title={intl.formatMessage({
                  id: 'admin.facebook.filter-tooltip',
                  defaultMessage: 'Facebook data deletion lookup',
                })}
              >
                <IconButton
                  size="small"
                  onClick={() => setIsFacebookFilterExpanded((v) => !v)}
                  sx={{
                    color: isFacebookFilterExpanded ? '#1877F2' : 'text.secondary',
                    alignSelf: 'center',
                  }}
                >
                  <FacebookIcon fontSize="small" />
                  {isFacebookFilterExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {facebookEnabled && (
            <Collapse in={isFacebookFilterExpanded}>
              <Box
                display="flex"
                gap={2}
                alignItems="flex-start"
                flexWrap="wrap"
                pt={1}
                pb={1}
                borderTop="1px dashed"
                borderColor="divider"
              >
                <TextField
                  label="facebookId"
                  placeholder="652098797767905"
                  value={facebookIdInput}
                  onChange={(e) => {
                    setFacebookIdInput(e.target.value);
                    setFacebookLookupResult(null);
                    setFacebookLookupError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFacebookLookup()}
                  size="small"
                  sx={{ minWidth: 240, fontFamily: 'monospace' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />
                      </InputAdornment>
                    ),
                    endAdornment: isFacebookLookupLoading ? (
                      <InputAdornment position="end">
                        <CircularProgress size={16} />
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleFacebookLookup}
                  disabled={!facebookIdInput.trim() || isFacebookLookupLoading}
                  sx={{ alignSelf: 'center', borderColor: '#1877F2', color: '#1877F2' }}
                >
                  {intl.formatMessage({
                    id: 'admin.facebook.lookup-button',
                    defaultMessage: 'Find Account',
                  })}
                </Button>
                {facebookLookupError && (
                  <Alert severity="warning" sx={{ py: 0, alignSelf: 'center' }}>
                    {facebookLookupError}
                  </Alert>
                )}
                {facebookLookupResult && (
                  <Alert
                    severity="success"
                    sx={{ py: 0, alignSelf: 'center' }}
                    action={
                      <Button
                        size="small"
                        color="error"
                        startIcon={<LinkOffIcon />}
                        onClick={() => handleRemoveFacebookAccount(facebookLookupResult)}
                      >
                        {intl.formatMessage({
                          id: 'admin.facebook.remove-button',
                          defaultMessage: 'Remove',
                        })}
                      </Button>
                    }
                  >
                    <strong>{facebookLookupResult.fullName}</strong> &lt;
                    {facebookLookupResult.email}&gt;
                  </Alert>
                )}
              </Box>
            </Collapse>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
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
              <TableCell align="center">Auth</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'creationDate'}
                  direction={sortField === 'creationDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('creationDate')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isPending ? (
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
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.fullName} &lt;{user.email}&gt;
                  </TableCell>
                  <TableCell>
                    <AccountStatusChip
                      isActive={user.isActive}
                      isSuspended={user.isSuspended}
                      suspensionReason={user.suspensionReason}
                      suspendedDate={user.suspendedDate}
                      authenticationType={user.authenticationType}
                      interactive={true}
                      onSuspend={() => handleSuspendUser(user)}
                      onUnsuspend={() => handleUnsuspendUser(user)}
                      onActivate={() => handleActivateUser(user)}
                    />
                  </TableCell>
                  <TableCell align="center">{getAuthIcon(user.authenticationType)}</TableCell>
                  <TableCell>{formatDate(user.creationDate)}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
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
                    {!user.isActive && user.authenticationType === AuthenticationType.DATABASE && (
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
                      onClick={() => handleChangePassword(user)}
                      title={intl.formatMessage({
                        id: 'admin.change-password',
                        defaultMessage: 'Change password',
                      })}
                      color="primary"
                    >
                      <VpnKeyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleViewUserMaps(user)}
                      title={intl.formatMessage({
                        id: 'admin.view-user-maps',
                        defaultMessage: 'View user maps',
                      })}
                      color="info"
                    >
                      <MapIcon />
                    </IconButton>
                    {facebookEnabled &&
                      user.authenticationType === AuthenticationType.FACEBOOK_OAUTH2 && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFacebookAccount(user)}
                          title={intl.formatMessage({
                            id: 'admin.facebook.remove-button',
                            defaultMessage: 'Remove Facebook Account',
                          })}
                          sx={{ color: '#1877F2' }}
                        >
                          <LinkOffIcon />
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
            disabled={isPending || isFilterLoading || isPaginationLoading}
          />
          {(isPending || isFilterLoading || isPaginationLoading) && <CircularProgress size={24} />}
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
              required
            />
            <TextField
              label={intl.formatMessage({ id: 'common.last-name', defaultMessage: 'Last Name' })}
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              error={!!formErrors.lastname}
              helperText={formErrors.lastname}
              fullWidth
              required
            />
            <TextField
              label={intl.formatMessage({ id: 'common.email', defaultMessage: 'Email' })}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
              required
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
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending
              ? intl.formatMessage({ id: 'admin.button.updating', defaultMessage: 'Updating...' })
              : intl.formatMessage({
                  id: 'admin.button.update-user',
                  defaultMessage: 'Update User',
                })}
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
              required
            />
            <TextField
              label={intl.formatMessage({ id: 'common.last-name', defaultMessage: 'Last Name' })}
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              error={!!formErrors.lastname}
              helperText={formErrors.lastname}
              fullWidth
              required
            />
            <TextField
              label={intl.formatMessage({ id: 'common.email', defaultMessage: 'Email' })}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
              required
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
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog
        open={isSuspensionDialogOpen}
        onClose={suspendUserMutation.isPending ? undefined : handleCancelSuspension}
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
          <Button onClick={handleCancelSuspension} disabled={suspendUserMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSuspension}
            color="error"
            variant="contained"
            disabled={suspendUserMutation.isPending}
          >
            {suspendUserMutation.isPending ? 'Suspending...' : 'Suspend User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={deleteUserMutation.isPending ? undefined : handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
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
          <Button onClick={handleCancelDelete} disabled={deleteUserMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsuspend Confirmation Dialog */}
      <Dialog
        open={isUnsuspendDialogOpen}
        onClose={unsuspendUserMutation.isPending ? undefined : handleCancelUnsuspend}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Unsuspend User</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to unsuspend user &quot;{unsuspendingUser?.email}&quot;?
          </Typography>
          {unsuspendingUser?.suspensionReason && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {intl.formatMessage({
                id: 'admin.current-suspension-reason',
                defaultMessage: 'Current suspension reason:',
              })}{' '}
              {getSuspensionReasonLabel(unsuspendingUser.suspensionReason, intl)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnsuspend} disabled={unsuspendUserMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUnsuspend}
            color="success"
            variant="contained"
            disabled={unsuspendUserMutation.isPending}
          >
            {unsuspendUserMutation.isPending ? 'Unsuspending...' : 'Unsuspend User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog
        open={isActivateDialogOpen}
        onClose={activateUserMutation.isPending ? undefined : handleCancelActivate}
        maxWidth="sm"
        fullWidth
      >
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
          <Button onClick={handleCancelActivate} disabled={activateUserMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmActivate}
            color="primary"
            variant="contained"
            disabled={activateUserMutation.isPending}
          >
            {activateUserMutation.isPending ? 'Activating...' : 'Activate User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Maps Dialog */}
      <UserMapsDialog
        open={isUserMapsDialogOpen}
        onClose={handleCloseUserMapsDialog}
        user={viewingMapsUser}
        maps={userMaps || []}
        isPendingUser={false}
        isPendingMaps={isPendingUserMaps}
        onSuspend={
          viewingMapsUser
            ? () => {
                handleCloseUserMapsDialog();
                handleSuspendUser(viewingMapsUser);
              }
            : undefined
        }
        onUnsuspend={
          viewingMapsUser
            ? () => {
                handleCloseUserMapsDialog();
                handleUnsuspendUser(viewingMapsUser);
              }
            : undefined
        }
        formatDate={formatDate}
      />

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {intl.formatMessage({
            id: 'admin.change-password-title',
            defaultMessage: 'Change Password',
          })}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {intl.formatMessage(
              {
                id: 'admin.change-password-description',
                defaultMessage: 'Change password for user: {email}',
              },
              { email: changingPasswordUser?.email },
            )}
          </Typography>

          {passwordError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          {changingPasswordUser?.authenticationType === AuthenticationType.DATABASE && (
            <>
              <TextField
                fullWidth
                type="password"
                label={intl.formatMessage({
                  id: 'admin.new-password',
                  defaultMessage: 'New Password',
                })}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                margin="normal"
                autoFocus
              />

              <TextField
                fullWidth
                type="password"
                label={intl.formatMessage({
                  id: 'admin.confirm-password',
                  defaultMessage: 'Confirm Password',
                })}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPasswordDialogOpen(false)}>
            {intl.formatMessage({
              id:
                changingPasswordUser?.authenticationType === AuthenticationType.DATABASE
                  ? 'admin.cancel'
                  : 'admin.close',
              defaultMessage:
                changingPasswordUser?.authenticationType === AuthenticationType.DATABASE
                  ? 'Cancel'
                  : 'Close',
            })}
          </Button>
          {changingPasswordUser?.authenticationType === AuthenticationType.DATABASE && (
            <Button onClick={handleConfirmPasswordChange} variant="contained" color="primary">
              {intl.formatMessage({
                id: 'admin.change-password-button',
                defaultMessage: 'Change Password',
              })}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Remove Facebook Account Confirmation Dialog */}
      <Dialog
        open={isRemoveFacebookDialogOpen}
        onClose={
          removeFacebookAccountMutation.isPending
            ? undefined
            : () => setIsRemoveFacebookDialogOpen(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FacebookIcon sx={{ color: '#1877F2' }} />
          {intl.formatMessage({
            id: 'admin.facebook.remove-dialog-title',
            defaultMessage: 'Remove Facebook Account',
          })}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {intl.formatMessage({
              id: 'admin.facebook.remove-warning',
              defaultMessage:
                'This will disconnect the Facebook authentication from this account. The user will receive a password reset email to regain access.',
            })}
          </Alert>
          <Typography variant="body2">
            {intl.formatMessage(
              {
                id: 'admin.facebook.remove-confirm',
                defaultMessage: 'Remove Facebook association for "{email}"?',
              },
              { email: removingFacebookUser?.email },
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsRemoveFacebookDialogOpen(false)}
            disabled={removeFacebookAccountMutation.isPending}
          >
            {intl.formatMessage({ id: 'admin.cancel', defaultMessage: 'Cancel' })}
          </Button>
          <Button
            onClick={() =>
              removingFacebookUser && removeFacebookAccountMutation.mutate(removingFacebookUser.id)
            }
            color="error"
            variant="contained"
            startIcon={<LinkOffIcon />}
            disabled={removeFacebookAccountMutation.isPending}
          >
            {removeFacebookAccountMutation.isPending
              ? intl.formatMessage({ id: 'admin.facebook.removing', defaultMessage: 'Removing...' })
              : intl.formatMessage({
                  id: 'admin.facebook.remove-button',
                  defaultMessage: 'Remove Facebook Account',
                })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountManagement;
