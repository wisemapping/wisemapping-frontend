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

import React, { ReactElement, useState } from 'react';
import { useIntl, IntlShape } from 'react-intl';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { AuthenticationType } from '../../../classes/client';

/**
 * Translates suspension reason codes to user-friendly labels.
 * Exported for use in other components that display suspension information.
 */
export const getSuspensionReasonLabel = (reason: string, intl: IntlShape): string => {
  const reasons: Record<string, string> = {
    ABUSE: intl.formatMessage({ id: 'admin.suspension.abuse', defaultMessage: 'Abuse' }),
    TERMS_VIOLATION: intl.formatMessage({
      id: 'admin.suspension.terms-violation',
      defaultMessage: 'Terms Violation',
    }),
    SECURITY_CONCERN: intl.formatMessage({
      id: 'admin.suspension.security-concern',
      defaultMessage: 'Security Concern',
    }),
    MANUAL_REVIEW: intl.formatMessage({
      id: 'admin.suspension.manual-review',
      defaultMessage: 'Manual Review',
    }),
    INACTIVITY: intl.formatMessage({
      id: 'admin.suspension.inactivity',
      defaultMessage: 'Inactivity',
    }),
    OTHER: intl.formatMessage({ id: 'admin.suspension.other', defaultMessage: 'Other' }),
  };
  return reasons[reason] || reason;
};

interface AccountStatusChipProps {
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedDate?: string;
  authenticationType?: AuthenticationType;
  // Optional callbacks for status changes
  onSuspend?: () => void;
  onUnsuspend?: () => void;
  onActivate?: () => void;
  // If true, clicking the chip will show a menu with actions
  interactive?: boolean;
}

/**
 * Shared component for displaying account status across the admin console.
 * Handles three states: Suspended, Not Activated, and Active.
 * Can be made interactive to allow quick status changes via click menu.
 */
const AccountStatusChip = ({
  isActive,
  isSuspended,
  suspensionReason,
  suspendedDate,
  authenticationType,
  onSuspend,
  onUnsuspend,
  onActivate,
  interactive = false,
}: AccountStatusChipProps): ReactElement => {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleChipClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactive && (onSuspend || onUnsuspend || onActivate)) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSuspend = () => {
    handleCloseMenu();
    if (onSuspend) {
      onSuspend();
    }
  };

  const handleUnsuspend = () => {
    handleCloseMenu();
    if (onUnsuspend) {
      onUnsuspend();
    }
  };

  const handleActivate = () => {
    handleCloseMenu();
    if (onActivate) {
      onActivate();
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Build the chip element
  const renderChip = () => {
    // Check if user is OAuth (Google, Facebook, etc.) - they don't need email activation
    const isOAuthUser =
      authenticationType === AuthenticationType.GOOGLE_OAUTH2 ||
      authenticationType === AuthenticationType.FACEBOOK_OAUTH2;

    // Suspended status (highest priority)
    if (isSuspended) {
      const tooltipParts: string[] = [];
      if (suspendedDate) {
        tooltipParts.push(
          intl.formatMessage(
            {
              id: 'admin.status.suspended-on',
              defaultMessage: 'Suspended on: {date}',
            },
            { date: formatDate(suspendedDate) },
          ),
        );
      }
      if (suspensionReason) {
        tooltipParts.push(
          intl.formatMessage(
            {
              id: 'admin.status.reason',
              defaultMessage: 'Reason: {reason}',
            },
            { reason: getSuspensionReasonLabel(suspensionReason, intl) },
          ),
        );
      }
      if (interactive) {
        tooltipParts.push(
          intl.formatMessage({
            id: 'admin.status.click-to-change',
            defaultMessage: 'Click to change status',
          }),
        );
      }
      const tooltip =
        tooltipParts.length > 0
          ? tooltipParts.join(' | ')
          : intl.formatMessage({ id: 'admin.status-suspended', defaultMessage: 'Suspended' });

      return (
        <Tooltip title={tooltip} disableInteractive>
          <span>
            <Chip
              label={intl.formatMessage({
                id: 'admin.status-suspended',
                defaultMessage: 'Suspended',
              })}
              color="error"
              size="small"
              onClick={handleChipClick}
              clickable={interactive}
              sx={{
                cursor: interactive ? 'pointer' : 'default',
                '&:hover': interactive
                  ? {
                      opacity: 0.8,
                    }
                  : {},
              }}
            />
          </span>
        </Tooltip>
      );
    }

    // Not Activated status (but skip for OAuth users - they're auto-activated)
    if (!isActive && !isOAuthUser) {
      const tooltip = interactive
        ? intl.formatMessage({
            id: 'admin.status-not-activated-tooltip-interactive',
            defaultMessage:
              'User has not confirmed their email address yet | Click to change status',
          })
        : intl.formatMessage({
            id: 'admin.status-not-activated-tooltip',
            defaultMessage: 'User has not confirmed their email address yet',
          });

      return (
        <Tooltip title={tooltip} disableInteractive>
          <span>
            <Chip
              label={intl.formatMessage({
                id: 'admin.status-not-activated',
                defaultMessage: 'Not Activated',
              })}
              color="warning"
              size="small"
              onClick={handleChipClick}
              clickable={interactive}
              sx={{
                cursor: interactive ? 'pointer' : 'default',
                '&:hover': interactive
                  ? {
                      opacity: 0.8,
                    }
                  : {},
              }}
            />
          </span>
        </Tooltip>
      );
    }

    // Active status (default)
    const tooltip = interactive
      ? intl.formatMessage({
          id: 'admin.status-active-tooltip-interactive',
          defaultMessage: 'Account is activated and in good standing | Click to change status',
        })
      : intl.formatMessage({
          id: 'admin.status-active-tooltip',
          defaultMessage: 'Account is activated and in good standing',
        });

    return (
      <Tooltip title={tooltip} disableInteractive>
        <span>
          <Chip
            label={intl.formatMessage({ id: 'admin.status-active', defaultMessage: 'Active' })}
            color="success"
            size="small"
            onClick={handleChipClick}
            clickable={interactive}
            sx={{
              cursor: interactive ? 'pointer' : 'default',
              '&:hover': interactive
                ? {
                    opacity: 0.8,
                  }
                : {},
            }}
          />
        </span>
      </Tooltip>
    );
  };

  return (
    <>
      {renderChip()}
      {interactive && (
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {isSuspended && onUnsuspend && (
            <MenuItem onClick={handleUnsuspend}>
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>
                {intl.formatMessage({
                  id: 'admin.unsuspend-user',
                  defaultMessage: 'Unsuspend User',
                })}
              </ListItemText>
            </MenuItem>
          )}
          {!isSuspended && isActive && onSuspend && (
            <MenuItem onClick={handleSuspend}>
              <ListItemIcon>
                <BlockIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>
                {intl.formatMessage({
                  id: 'admin.suspend-user',
                  defaultMessage: 'Suspend User',
                })}
              </ListItemText>
            </MenuItem>
          )}
          {!isActive && onActivate && (
            <MenuItem onClick={handleActivate}>
              <ListItemIcon>
                <MarkEmailReadIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>
                {intl.formatMessage({
                  id: 'admin.activate-user',
                  defaultMessage: 'Activate User',
                })}
              </ListItemText>
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  );
};

export default AccountStatusChip;
