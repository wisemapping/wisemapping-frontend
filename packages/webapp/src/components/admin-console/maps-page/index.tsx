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
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Star as StarIcon,
  Code as CodeIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { AdminMapsParams } from '../../../classes/client/admin-client';
import AppConfig from '../../../classes/app-config';
import { useMutation, useQuery, useQueryClient } from 'react-query';

// XML formatting utility
const formatXml = (xml: string): string => {
  if (!xml || xml.trim() === '') return '';

  try {
    // Basic XML formatting with proper indentation
    let formatted = xml;
    let indent = 0;
    const tab = '  '; // 2 spaces for indentation

    // Split by tags and process each part
    formatted = formatted.replace(/></g, '>\n<');
    const lines = formatted.split('\n');

    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }

      const indentedLine = tab.repeat(indent) + trimmed;

      // Increase indent for opening tags (but not self-closing)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent++;
      }

      return indentedLine;
    });

    return formattedLines.join('\n');
  } catch (error) {
    // If formatting fails, return original XML
    console.warn('Failed to format XML:', error);
    return xml;
  }
};

// Types for maps management
interface AdminMap {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdById: number;
  creationTime: string;
  lastModificationBy: string;
  lastModificationById: number;
  lastModificationTime: string;
  public: boolean;
  isLocked: boolean;
  isLockedBy?: string;
  starred: boolean;
  labels: string[];
  spam?: boolean;
  isCreatorSuspended?: boolean;
}

interface MapFormData {
  title: string;
  description: string;
  public: boolean;
  isLocked: boolean;
}

type SortField =
  | 'title'
  | 'id'
  | 'createdBy'
  | 'createdById'
  | 'creationTime'
  | 'lastModificationTime'
  | 'public';
type SortDirection = 'asc' | 'desc';

const MapsManagement = (): ReactElement => {
  const intl = useIntl();
  const client = AppConfig.getAdminClient();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [filterPublic, setFilterPublic] = useState<string>('all');
  const [filterLocked, setFilterLocked] = useState<string>('all');
  const [filterSpam, setFilterSpam] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('1');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [editingMap, setEditingMap] = useState<AdminMap | null>(null);

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
  }, [debouncedSearchTerm, filterPublic, filterLocked, filterSpam, dateFilter]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MapFormData>({
    title: '',
    description: '',
    public: false,
    isLocked: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // XML Viewer state
  const [viewingMap, setViewingMap] = useState<AdminMap | null>(null);
  const [isXmlViewerOpen, setIsXmlViewerOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [isLoadingXml, setIsLoadingXml] = useState(false);

  // User suspension state
  const [isSuspensionDialogOpen, setIsSuspensionDialogOpen] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState<{ userId: number; userName: string } | null>(
    null,
  );

  // Owner maps dialog state
  const [isOwnerMapsDialogOpen, setIsOwnerMapsDialogOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [selectedOwnerName, setSelectedOwnerName] = useState<string>('');
  const [ownerMaps, setOwnerMaps] = useState<AdminMap[]>([]);
  const [isLoadingOwnerMaps, setIsLoadingOwnerMaps] = useState(false);

  // Fetch maps with pagination and filters
  const {
    data: mapsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery(
    [
      'adminMaps',
      currentPage,
      pageSize,
      debouncedSearchTerm,
      sortField,
      sortDirection,
      filterPublic,
      filterLocked,
      filterSpam,
      dateFilter,
    ],
    () => {
      const params: AdminMapsParams = {
        page: currentPage - 1, // Convert to 0-based indexing for backend
        pageSize,
        search: debouncedSearchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection,
        filterPublic: filterPublic !== 'all' ? filterPublic === 'public' : undefined,
        filterLocked: filterLocked !== 'all' ? filterLocked === 'locked' : undefined,
        filterSpam: filterSpam !== 'all' ? filterSpam === 'spam' : undefined,
        dateFilter: dateFilter,
      };
      return client.getAdminMaps(params);
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

  const maps = mapsResponse?.data || [];
  const totalPages = mapsResponse?.totalPages || 0;

  // Update map mutation
  const updateMapMutation = useMutation(
    (mapData: MapFormData & { id: number }) => client.updateAdminMap(mapData.id, mapData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminMaps');
        setIsEditDialogOpen(false);
        setEditingMap(null);
        setFormData({
          title: '',
          description: '',
          public: false,
          isLocked: false,
        });
        setFormErrors({});
      },
      onError: (error: Error) => {
        console.error('Failed to update map:', error);
        setFormErrors({ general: 'Failed to update map. Please try again.' });
      },
    },
  );

  // Delete map mutation
  const deleteMapMutation = useMutation((mapId: number) => client.deleteAdminMap(mapId), {
    onSuccess: () => {
      queryClient.invalidateQueries('adminMaps');
    },
    onError: (error: Error) => {
      console.error('Failed to delete map:', error);
    },
  });

  // Update spam status mutation
  const updateSpamStatusMutation = useMutation(
    ({ mapId, spam }: { mapId: number; spam: boolean }) =>
      client.updateMapSpamStatus(mapId, { spam }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminMaps');
      },
      onError: (error: Error) => {
        console.error('Failed to update spam status:', error);
      },
    },
  );

  // Suspend user mutation
  const suspendUserMutation = useMutation(
    ({ userId }: { userId: number }) => {
      const suspensionData: { suspended: boolean; suspensionReason: string } = {
        suspended: true,
        suspensionReason: 'MANUAL_REVIEW',
      };

      return client.updateUserSuspension(userId, suspensionData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminMaps');
        setIsSuspensionDialogOpen(false);
        setSuspendingUser(null);
      },
      onError: (error: Error) => {
        console.error('Failed to suspend user:', error);
      },
    },
  );

  const handleEditMap = (map: AdminMap) => {
    setEditingMap(map);
    setFormData({
      title: map.title,
      description: map.description,
      public: map.public,
      isLocked: map.isLocked,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleSaveMap = () => {
    if (!editingMap) return;

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateMapMutation.mutate({ ...formData, id: editingMap.id });
  };

  const handleDeleteMap = (mapId: number, mapTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the map "${mapTitle}"?`)) {
      deleteMapMutation.mutate(mapId);
    }
  };

  const handleToggleSpamStatus = (mapId: number, currentSpamStatus: boolean) => {
    const newSpamStatus = !currentSpamStatus;
    const action = newSpamStatus ? 'mark as spam' : 'mark as not spam';
    if (window.confirm(`Are you sure you want to ${action} this map?`)) {
      updateSpamStatusMutation.mutate({ mapId, spam: newSpamStatus });
    }
  };

  const handleSuspendUser = (userId: number, userName: string) => {
    setSuspendingUser({ userId, userName });
    setIsSuspensionDialogOpen(true);
  };

  const handleConfirmSuspension = () => {
    if (suspendingUser) {
      suspendUserMutation.mutate({
        userId: suspendingUser.userId,
      });
    }
  };

  const handleViewXml = async (map: AdminMap) => {
    setViewingMap(map);
    setIsXmlViewerOpen(true);
    setIsLoadingXml(true);
    setXmlContent('');

    try {
      const xml = await client.getAdminMapXml(map.id);
      setXmlContent(xml);
    } catch (error: unknown) {
      console.error('Failed to fetch map XML:', error);
      setXmlContent(
        `Error loading XML: ${(error as Record<string, unknown>)?.message || 'Unknown error'}`,
      );
    } finally {
      setIsLoadingXml(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPublicChip = (isPublic: boolean) => (
    <Chip
      icon={isPublic ? <PublicIcon /> : <LockIcon />}
      label={isPublic ? 'Public' : 'Private'}
      color={isPublic ? 'success' : 'default'}
      size="small"
    />
  );

  const getLockedChip = (isLocked: boolean, lockedBy?: string) => (
    <Chip
      label={isLocked ? `Locked by ${lockedBy}` : 'Unlocked'}
      color={isLocked ? 'warning' : 'default'}
      size="small"
    />
  );

  const getSpamChip = (spam: boolean, spamType?: string, spamDetectedDate?: string) => {
    if (spam) {
      return (
        <Chip
          label={`Spam (${spamType || 'Unknown'})`}
          color="error"
          size="small"
          title={spamDetectedDate ? `Detected: ${formatDate(spamDetectedDate)}` : 'Spam detected'}
        />
      );
    }
    return (
      <Chip
        label={intl.formatMessage({ id: 'admin.status-clean', defaultMessage: 'Clean' })}
        color="success"
        size="small"
      />
    );
  };

  const getSuspendedUserChip = (isSuspended: boolean) => {
    if (isSuspended) {
      return (
        <Chip
          label={intl.formatMessage({ id: 'admin.status-suspended', defaultMessage: 'Suspended' })}
          color="error"
          size="small"
          icon={<PersonOffIcon />}
        />
      );
    }
    return null;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewOwnerMaps = async (ownerId: number, ownerName: string) => {
    setSelectedOwnerId(ownerId);
    setSelectedOwnerName(ownerName);
    setIsOwnerMapsDialogOpen(true);
    setIsLoadingOwnerMaps(true);
    setOwnerMaps([]);

    try {
      // Fetch all maps for this owner
      const maps = await client.getUserMaps(ownerId);
      setOwnerMaps(maps);
    } catch (err) {
      console.error('Failed to load owner maps:', err);
    } finally {
      setIsLoadingOwnerMaps(false);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load maps: {(error as Error)?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {intl.formatMessage({
            id: 'admin.maps.title',
            defaultMessage: 'Maps Management',
          })}
        </Typography>
        <IconButton
          onClick={() => refetch()}
          aria-label={intl.formatMessage({ id: 'admin.refresh', defaultMessage: 'Refresh' })}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Search and Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder={intl.formatMessage({
            id: 'admin.maps.search',
            defaultMessage: 'Search maps...',
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
            endAdornment: isLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          }}
          sx={{ minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Public</InputLabel>
          <Select
            value={filterPublic}
            label={intl.formatMessage({ id: 'admin.public', defaultMessage: 'Public' })}
            onChange={(e) => setFilterPublic(e.target.value)}
            disabled={isLoading || isFilterLoading}
            endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Locked</InputLabel>
          <Select
            value={filterLocked}
            label={intl.formatMessage({ id: 'admin.locked', defaultMessage: 'Locked' })}
            onChange={(e) => setFilterLocked(e.target.value)}
            disabled={isLoading || isFilterLoading}
            endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="locked">Locked</MenuItem>
            <MenuItem value="unlocked">Unlocked</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>
            {intl.formatMessage({
              id: 'admin.maps.filter.spam',
              defaultMessage: 'Spam',
            })}
          </InputLabel>
          <Select
            value={filterSpam}
            label={intl.formatMessage({
              id: 'admin.maps.filter.spam',
              defaultMessage: 'Spam',
            })}
            onChange={(e) => setFilterSpam(e.target.value)}
            disabled={isLoading || isFilterLoading}
            endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
            <MenuItem value="not-spam">Not Spam</MenuItem>
          </Select>
        </FormControl>

        {/* Date Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="date-filter-label">
            {intl.formatMessage({
              id: 'admin.maps.filter.date',
              defaultMessage: 'Date Range',
            })}
          </InputLabel>
          <Select
            labelId="date-filter-label"
            value={dateFilter}
            label={intl.formatMessage({
              id: 'admin.maps.filter.date',
              defaultMessage: 'Date Range',
            })}
            onChange={(e) => setDateFilter(e.target.value)}
            disabled={isLoading || isFilterLoading}
            endAdornment={isLoading || isFilterLoading ? <CircularProgress size={20} /> : null}
          >
            <MenuItem value="1">Last 1 Month</MenuItem>
            <MenuItem value="3">Last 3 Months</MenuItem>
            <MenuItem value="6">Last 6 Months</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Maps Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'id'}
                  direction={sortField === 'id' ? sortDirection : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  {intl.formatMessage({
                    id: 'admin.maps.table.id',
                    defaultMessage: 'Map ID',
                  })}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'creationTime'}
                  direction={sortField === 'creationTime' ? sortDirection : 'asc'}
                  onClick={() => handleSort('creationTime')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'lastModificationTime'}
                  direction={sortField === 'lastModificationTime' ? sortDirection : 'asc'}
                  onClick={() => handleSort('lastModificationTime')}
                >
                  Modified
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>
                {intl.formatMessage({
                  id: 'admin.maps.table.spam',
                  defaultMessage: 'Spam',
                })}
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : maps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {intl.formatMessage({
                      id: 'admin.maps.no-maps',
                      defaultMessage: 'No maps found',
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              maps.map((map) => (
                <TableRow key={map.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="medium"
                      component="a"
                      href={`/c/maps/${map.id}/public`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      #{map.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {map.starred && <StarIcon color="primary" fontSize="small" />}
                      <Typography variant="body2" fontWeight={map.starred ? 'bold' : 'normal'}>
                        {map.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {map.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                      onClick={() => handleViewOwnerMaps(map.createdById, map.createdBy)}
                      sx={{
                        minWidth: 'auto',
                        padding: '4px 8px',
                        textTransform: 'none',
                        fontWeight: 'medium',
                      }}
                    >
                      {map.createdBy}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(map.creationTime)}</TableCell>
                  <TableCell>{formatDate(map.lastModificationTime)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {getPublicChip(map.public)}
                      {getLockedChip(map.isLocked, map.isLockedBy)}
                      {getSuspendedUserChip(map.isCreatorSuspended || false)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getSpamChip(map.spam || false, map.spamType, map.spamDetectedDate)}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip
                        title={intl.formatMessage({
                          id: 'admin.maps.view-xml',
                          defaultMessage: 'View XML',
                        })}
                      >
                        <IconButton
                          onClick={() => handleViewXml(map)}
                          aria-label={intl.formatMessage({
                            id: 'admin.view-xml',
                            defaultMessage: 'View XML',
                          })}
                          color="info"
                          size="small"
                        >
                          <CodeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={intl.formatMessage({
                          id: 'admin.maps.edit',
                          defaultMessage: 'Edit map',
                        })}
                      >
                        <IconButton
                          onClick={() => handleEditMap(map)}
                          aria-label={intl.formatMessage({
                            id: 'admin.edit',
                            defaultMessage: 'Edit',
                          })}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={intl.formatMessage({
                          id: 'admin.maps.toggle-spam',
                          defaultMessage: map.spam ? 'Mark as not spam' : 'Mark as spam',
                        })}
                      >
                        <IconButton
                          onClick={() => handleToggleSpamStatus(map.id, map.spam || false)}
                          aria-label={map.spam ? 'mark-not-spam' : 'mark-spam'}
                          color={map.spam ? 'success' : 'warning'}
                          size="small"
                          disabled={updateSpamStatusMutation.isLoading}
                        >
                          {map.spam ? <CheckCircleIcon /> : <FlagIcon />}
                        </IconButton>
                      </Tooltip>
                      {!map.isCreatorSuspended && (
                        <Tooltip
                          title={intl.formatMessage({
                            id: 'admin.maps.suspend-user',
                            defaultMessage: 'Suspend user account',
                          })}
                        >
                          <IconButton
                            onClick={() => handleSuspendUser(map.createdById, map.createdBy)}
                            aria-label={intl.formatMessage({
                              id: 'admin.suspend-user',
                              defaultMessage: 'Suspend user',
                            })}
                            color="warning"
                            size="small"
                            disabled={suspendUserMutation.isLoading}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip
                        title={intl.formatMessage({
                          id: 'admin.maps.delete',
                          defaultMessage: 'Delete map',
                        })}
                      >
                        <IconButton
                          onClick={() => handleDeleteMap(map.id, map.title)}
                          aria-label={intl.formatMessage({
                            id: 'admin.delete',
                            defaultMessage: 'Delete',
                          })}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
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

      {/* Edit Map Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {intl.formatMessage({
            id: 'admin.maps.edit-title',
            defaultMessage: 'Edit Map',
          })}
        </DialogTitle>
        <DialogContent>
          {formErrors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.general}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label={intl.formatMessage({
              id: 'admin.maps.title',
              defaultMessage: 'Title',
            })}
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={!!formErrors.title}
            helperText={formErrors.title}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label={intl.formatMessage({
              id: 'admin.maps.description',
              defaultMessage: 'Description',
            })}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Public Access</InputLabel>
              <Select
                value={formData.public ? 'public' : 'private'}
                label={intl.formatMessage({
                  id: 'admin.public-access',
                  defaultMessage: 'Public Access',
                })}
                onChange={(e) => setFormData({ ...formData, public: e.target.value === 'public' })}
              >
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="public">Public</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Lock Status</InputLabel>
              <Select
                value={formData.isLocked ? 'locked' : 'unlocked'}
                label={intl.formatMessage({
                  id: 'admin.lock-status',
                  defaultMessage: 'Lock Status',
                })}
                onChange={(e) =>
                  setFormData({ ...formData, isLocked: e.target.value === 'locked' })
                }
              >
                <MenuItem value="unlocked">Unlocked</MenuItem>
                <MenuItem value="locked">Locked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>
            {intl.formatMessage({
              id: 'common.cancel',
              defaultMessage: 'Cancel',
            })}
          </Button>
          <Button
            onClick={handleSaveMap}
            variant="contained"
            disabled={updateMapMutation.isLoading}
          >
            {updateMapMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              intl.formatMessage({
                id: 'common.save',
                defaultMessage: 'Save',
              })
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* XML Viewer Dialog */}
      <Dialog
        open={isXmlViewerOpen}
        onClose={() => setIsXmlViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CodeIcon color="primary" />
            {intl.formatMessage({
              id: 'admin.maps.xml-viewer.title',
              defaultMessage: 'Map XML Content',
            })}
          </Box>
          {viewingMap && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {viewingMap.title} (ID: {viewingMap.id})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {isLoadingXml ? (
            <Box sx={{ p: 3 }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({
                  id: 'admin.maps.xml-viewer.loading',
                  defaultMessage: 'Loading XML content...',
                })}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {intl.formatMessage({
                    id: 'admin.maps.xml-viewer.info',
                    defaultMessage:
                      'This is the raw XML content of the mindmap. You can copy this content for backup or analysis purposes.',
                  })}
                </Typography>
              </Alert>

              <TextField
                multiline
                rows={20}
                fullWidth
                value={formatXml(xmlContent)}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey[900]
                        : theme.palette.grey[50],
                    '& .MuiInputBase-input': {
                      color: (theme) => theme.palette.text.primary,
                      whiteSpace: 'pre',
                      overflow: 'auto',
                    },
                  },
                }}
                placeholder={intl.formatMessage({
                  id: 'admin.maps.xml-viewer.no-content',
                  defaultMessage: 'No XML content available',
                })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsXmlViewerOpen(false)}>
            {intl.formatMessage({
              id: 'common.close',
              defaultMessage: 'Close',
            })}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (xmlContent) {
                navigator.clipboard.writeText(formatXml(xmlContent));
                // You could add a snackbar notification here
              }
            }}
            disabled={!xmlContent || isLoadingXml}
            startIcon={<CodeIcon />}
          >
            {intl.formatMessage({
              id: 'admin.maps.xml-viewer.copy',
              defaultMessage: 'Copy Formatted XML',
            })}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Suspension Dialog */}
      <Dialog
        open={isSuspensionDialogOpen}
        onClose={() => setIsSuspensionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {intl.formatMessage({
            id: 'admin.maps.suspend-user.title',
            defaultMessage: 'Suspend User Account',
          })}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {intl.formatMessage({
                id: 'admin.maps.suspend-user.warning',
                defaultMessage:
                  'This action will suspend the user account, preventing them from accessing the system.',
              })}
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {intl.formatMessage(
              {
                id: 'admin.maps.suspend-user.confirm',
                defaultMessage:
                  'Are you sure you want to suspend the account for user "{userName}" (ID: {userId})? This will be marked as a manual review suspension.',
              },
              {
                userName: suspendingUser?.userName || '',
                userId: suspendingUser?.userId || '',
              },
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSuspensionDialogOpen(false)}>
            {intl.formatMessage({
              id: 'common.cancel',
              defaultMessage: 'Cancel',
            })}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmSuspension}
            disabled={suspendUserMutation.isLoading}
            startIcon={<BlockIcon />}
          >
            {suspendUserMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              intl.formatMessage({
                id: 'admin.maps.suspend-user.confirm-button',
                defaultMessage: 'Suspend User',
              })
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Owner Maps Dialog */}
      <Dialog
        open={isOwnerMapsDialogOpen}
        onClose={() => setIsOwnerMapsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Maps owned by {selectedOwnerName} (ID: #{selectedOwnerId})
        </DialogTitle>
        <DialogContent>
          {isLoadingOwnerMaps ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : ownerMaps.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" p={3}>
              No maps found for this owner
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Map ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Modified</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ownerMaps.map((map) => (
                    <TableRow key={map.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="primary"
                          fontWeight="medium"
                          component="a"
                          href={`/c/maps/${map.id}/public`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          #{map.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {map.starred && <StarIcon color="primary" fontSize="small" />}
                          <Typography variant="body2" fontWeight={map.starred ? 'bold' : 'normal'}>
                            {map.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {map.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(map.creationTime)}</TableCell>
                      <TableCell>{formatDate(map.lastModificationTime)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {getPublicChip(map.public)}
                          {getLockedChip(map.isLocked, map.isLockedBy)}
                          {getSuspendedUserChip(map.isCreatorSuspended || false)}
                          {map.spam && getSpamChip(map.spam, map.spamType, map.spamDetectedDate)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<BlockIcon />}
              onClick={() => {
                setIsOwnerMapsDialogOpen(false);
                if (selectedOwnerId !== null) {
                  handleSuspendUser(selectedOwnerId, selectedOwnerName);
                }
              }}
            >
              {intl.formatMessage({
                id: 'admin.maps.suspend-user.button',
                defaultMessage: 'Suspend User',
              })}
            </Button>
          </Box>
          <Button onClick={() => setIsOwnerMapsDialogOpen(false)}>
            {intl.formatMessage({
              id: 'common.close',
              defaultMessage: 'Close',
            })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapsManagement;
