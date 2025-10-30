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

import React, { ReactElement } from 'react';
import { useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import UserInfoCard from './UserInfoCard';
import type { AdminUser, AdminMap } from '../../../classes/client/admin-client';

interface UserMapsDialogProps {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
  maps: AdminMap[];
  isLoadingUser: boolean;
  isLoadingMaps: boolean;
  onSuspend?: () => void;
  onUnsuspend?: () => void;
  onViewXml?: (map: AdminMap) => void;
  onEditMap?: (map: AdminMap) => void;
  onToggleSpam?: (mapId: number, currentSpamStatus: boolean) => void;
  onDeleteMap?: (mapId: number, mapTitle: string) => void;
  getPublicChip?: (isPublic: boolean) => ReactElement;
  getLockedChip?: (isLocked: boolean, lockedBy?: string) => ReactElement;
  getSuspendedUserChip?: (isSuspended: boolean) => ReactElement | null;
  getSpamChip?: (spam: boolean, spamType?: string, spamDetectedDate?: string) => ReactElement;
  formatDate: (dateString: string) => string;
  updateSpamStatusLoading?: boolean;
  deleteMapLoading?: boolean;
}

const UserMapsDialog = ({
  open,
  onClose,
  user,
  maps,
  isLoadingUser,
  isLoadingMaps,
  onSuspend,
  onUnsuspend,
  onViewXml,
  onEditMap,
  onToggleSpam,
  onDeleteMap,
  getPublicChip,
  getLockedChip,
  getSuspendedUserChip,
  getSpamChip,
  formatDate,
  updateSpamStatusLoading = false,
  deleteMapLoading = false,
}: UserMapsDialogProps): ReactElement => {
  const intl = useIntl();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {user
          ? intl.formatMessage(
              {
                id: 'admin.user-maps-dialog.title',
                defaultMessage: 'Maps owned by {name} (ID: #{id})',
              },
              { name: user.email, id: user.id },
            )
          : intl.formatMessage({
              id: 'admin.user-maps-dialog.loading',
              defaultMessage: 'Loading user...',
            })}
      </DialogTitle>
      <DialogContent>
        {user && !isLoadingUser && (
          <UserInfoCard
            user={user}
            totalMaps={maps.length}
            isLoadingMaps={isLoadingMaps}
            onSuspend={onSuspend}
            onUnsuspend={onUnsuspend}
          />
        )}
        {isLoadingUser && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}
        {isLoadingMaps && !isLoadingUser ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : maps.length === 0 && !isLoadingMaps ? (
          <Alert severity="info">
            {intl.formatMessage({
              id: 'admin.user-maps-dialog.no-maps',
              defaultMessage: 'This user has no maps.',
            })}
          </Alert>
        ) : (
          !isLoadingMaps && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.id',
                        defaultMessage: 'Map ID',
                      })}
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.title',
                        defaultMessage: 'Title',
                      })}
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.description',
                        defaultMessage: 'Description',
                      })}
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.created',
                        defaultMessage: 'Created',
                      })}
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.modified',
                        defaultMessage: 'Modified',
                      })}
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.status',
                        defaultMessage: 'Status',
                      })}
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage({
                        id: 'admin.maps.table.spam-status',
                        defaultMessage: 'Spam Status',
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {intl.formatMessage({
                        id: 'admin.maps.table.actions',
                        defaultMessage: 'Actions',
                      })}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maps.map((map) => (
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
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {map.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(map.creationTime)}</TableCell>
                      <TableCell>{formatDate(map.lastModificationTime)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {getPublicChip && getPublicChip(map.public)}
                          {getLockedChip && getLockedChip(map.isLocked, map.isLockedBy)}
                          {getSuspendedUserChip &&
                            getSuspendedUserChip(map.isCreatorSuspended || false)}
                          {!getPublicChip && (
                            <Chip
                              label={map.public ? 'Public' : 'Private'}
                              color={map.public ? 'success' : 'default'}
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {/* Spam Status Chip */}
                          <Tooltip
                            title={
                              map.spam
                                ? map.spamDetectedDate
                                  ? intl.formatMessage(
                                      {
                                        id: 'admin.maps.spam-tooltip',
                                        defaultMessage: 'Detected as spam on {date}',
                                      },
                                      { date: formatDate(map.spamDetectedDate) },
                                    )
                                  : intl.formatMessage({
                                      id: 'admin.maps.spam-tooltip-no-date',
                                      defaultMessage: 'Marked as spam',
                                    })
                                : intl.formatMessage({
                                    id: 'admin.maps.clean-tooltip',
                                    defaultMessage: 'Not marked as spam',
                                  })
                            }
                          >
                            <Chip
                              label={
                                map.spam
                                  ? `Spam (${map.spamType || 'Unknown'})`
                                  : intl.formatMessage({
                                      id: 'admin.status-clean',
                                      defaultMessage: 'Clean',
                                    })
                              }
                              color={map.spam ? 'error' : 'success'}
                              size="small"
                              icon={map.spam ? <FlagIcon /> : <CheckCircleIcon />}
                            />
                          </Tooltip>
                          {/* Spam Description */}
                          {map.spam && map.spamDescription && (
                            <Tooltip title={map.spamDescription} arrow>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: '0.7rem',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'help',
                                }}
                              >
                                {map.spamDescription}
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          {onViewXml && (
                            <Tooltip
                              title={intl.formatMessage({
                                id: 'admin.maps.view-xml',
                                defaultMessage: 'View XML',
                              })}
                            >
                              <IconButton
                                onClick={() => onViewXml(map)}
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
                          )}
                          {onEditMap && (
                            <Tooltip
                              title={intl.formatMessage({
                                id: 'admin.maps.edit',
                                defaultMessage: 'Edit map',
                              })}
                            >
                              <IconButton
                                onClick={() => onEditMap(map)}
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
                          )}
                          {onToggleSpam && (
                            <Tooltip
                              title={intl.formatMessage({
                                id: 'admin.maps.toggle-spam',
                                defaultMessage: map.spam ? 'Mark as not spam' : 'Mark as spam',
                              })}
                            >
                              <IconButton
                                onClick={() => onToggleSpam(map.id, map.spam || false)}
                                aria-label={map.spam ? 'mark-not-spam' : 'mark-spam'}
                                color={map.spam ? 'success' : 'warning'}
                                size="small"
                                disabled={updateSpamStatusLoading}
                              >
                                {map.spam ? <CheckCircleIcon /> : <FlagIcon />}
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDeleteMap && (
                            <Tooltip
                              title={intl.formatMessage({
                                id: 'admin.maps.delete',
                                defaultMessage: 'Delete map',
                              })}
                            >
                              <IconButton
                                onClick={() => onDeleteMap(map.id, map.title)}
                                aria-label={intl.formatMessage({
                                  id: 'admin.delete',
                                  defaultMessage: 'Delete',
                                })}
                                color="error"
                                size="small"
                                disabled={deleteMapLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {intl.formatMessage({
            id: 'common.close',
            defaultMessage: 'Close',
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserMapsDialog;
