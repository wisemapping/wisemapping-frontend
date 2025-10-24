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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import StorageIcon from '@mui/icons-material/Storage';
import { AuthenticationType } from '../../../classes/client';
import AccountStatusChip, { getSuspensionReasonLabel } from './AccountStatusChip';

interface UserInfoCardProps {
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    fullName: string;
    creationDate: string;
    isActive: boolean;
    isSuspended: boolean;
    suspensionReason?: string;
    suspendedDate?: string;
    authenticationType: AuthenticationType;
  };
  totalMaps?: number;
  isLoadingMaps?: boolean;
  onSuspend?: () => void;
  onUnsuspend?: () => void;
}

const UserInfoCard = ({
  user,
  totalMaps,
  isLoadingMaps,
  onSuspend,
  onUnsuspend,
}: UserInfoCardProps): ReactElement => {
  const intl = useIntl();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAuthIcon = (authenticationType: AuthenticationType): ReactElement => {
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

  const getAuthLabel = (authenticationType: AuthenticationType): string => {
    switch (authenticationType) {
      case AuthenticationType.GOOGLE_OAUTH2:
        return intl.formatMessage({ id: 'admin.auth.google', defaultMessage: 'Google' });
      case AuthenticationType.FACEBOOK_OAUTH2:
        return intl.formatMessage({ id: 'admin.auth.facebook', defaultMessage: 'Facebook' });
      case AuthenticationType.LDAP:
        return intl.formatMessage({ id: 'admin.auth.ldap', defaultMessage: 'LDAP' });
      case AuthenticationType.DATABASE:
      default:
        return intl.formatMessage({ id: 'admin.auth.database', defaultMessage: 'Database' });
    }
  };

  return (
    <Card elevation={0} sx={{ mb: 3, bgcolor: 'background.default' }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PersonIcon color="primary" />
          {intl.formatMessage({
            id: 'admin.user-info.title',
            defaultMessage: 'User Information',
          })}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr',
            },
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <CalendarTodayIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
              {intl.formatMessage({
                id: 'admin.user-info.created',
                defaultMessage: 'Created',
              })}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(user.creationDate)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <VerifiedUserIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
              {intl.formatMessage({
                id: 'admin.user-info.auth-type',
                defaultMessage: 'Authentication',
              })}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {getAuthIcon(user.authenticationType)}
              <Typography variant="body1" fontWeight="medium">
                {getAuthLabel(user.authenticationType)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {intl.formatMessage({
                id: 'admin.user-info.status',
                defaultMessage: 'Status',
              })}
            </Typography>
            <Box>
              <AccountStatusChip
                isActive={user.isActive}
                isSuspended={user.isSuspended}
                suspensionReason={user.suspensionReason}
                suspendedDate={user.suspendedDate}
                interactive={!!(onSuspend || onUnsuspend)}
                onSuspend={onSuspend}
                onUnsuspend={onUnsuspend}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {intl.formatMessage({
                id: 'admin.user-info.total-maps',
                defaultMessage: 'Total Maps',
              })}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {isLoadingMaps ? <CircularProgress size={16} /> : totalMaps || 0}
            </Typography>
          </Box>
        </Box>
        {user.isSuspended && user.suspensionReason && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              {intl.formatMessage({
                id: 'admin.user-info.suspension-reason',
                defaultMessage: 'Suspension Reason:',
              })}{' '}
              {getSuspensionReasonLabel(user.suspensionReason, intl)}
            </Typography>
            {user.suspendedDate && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                {intl.formatMessage(
                  {
                    id: 'admin.status.suspended-on',
                    defaultMessage: 'Suspended on: {date}',
                  },
                  { date: formatDate(user.suspendedDate) },
                )}
              </Typography>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
