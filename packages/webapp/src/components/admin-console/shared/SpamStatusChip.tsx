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
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';

interface SpamStatusChipProps {
  spam: boolean;
  spamType?: string;
  spamDescription?: string;
  spamDetectedDate?: string;
  onToggleSpam?: (newSpamStatus: boolean) => void;
  formatDate: (dateString: string) => string;
  loading?: boolean;
  showToggleButton?: boolean;
}

const SpamStatusChip = ({
  spam,
  spamType,
  spamDescription,
  spamDetectedDate,
  onToggleSpam,
  formatDate,
  loading = false,
  showToggleButton = true,
}: SpamStatusChipProps): ReactElement => {
  const intl = useIntl();

  const getSpamTooltip = () => {
    if (spam) {
      if (spamDetectedDate) {
        return intl.formatMessage(
          {
            id: 'admin.maps.spam-tooltip',
            defaultMessage: 'Detected as spam on {date}',
          },
          { date: formatDate(spamDetectedDate) },
        );
      }
      return intl.formatMessage({
        id: 'admin.maps.spam-tooltip-no-date',
        defaultMessage: 'Marked as spam',
      });
    }
    return intl.formatMessage({
      id: 'admin.maps.clean-tooltip',
      defaultMessage: 'Not marked as spam',
    });
  };

  const handleToggle = () => {
    if (onToggleSpam && !loading) {
      onToggleSpam(!spam);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box display="flex" flexDirection="column" gap={0.5}>
        {/* Spam Status Chip */}
        <Tooltip title={getSpamTooltip()}>
          <Chip
            label={
              spam
                ? `Spam (${spamType || 'Unknown'})`
                : intl.formatMessage({
                    id: 'admin.status-clean',
                    defaultMessage: 'Clean',
                  })
            }
            color={spam ? 'error' : 'success'}
            size="small"
            icon={spam ? <FlagIcon /> : <CheckCircleIcon />}
          />
        </Tooltip>
        {/* Spam Description */}
        {spam && spamDescription && (
          <Tooltip title={spamDescription} arrow>
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
              {spamDescription}
            </Typography>
          </Tooltip>
        )}
      </Box>
      {/* Toggle Spam Button */}
      {showToggleButton && onToggleSpam && (
        <Tooltip
          title={intl.formatMessage({
            id: 'admin.maps.toggle-spam',
            defaultMessage: spam ? 'Mark as not spam' : 'Mark as spam',
          })}
        >
          <IconButton
            onClick={handleToggle}
            aria-label={spam ? 'mark-not-spam' : 'mark-spam'}
            color={spam ? 'success' : 'warning'}
            size="small"
            disabled={loading}
          >
            {spam ? <CheckCircleIcon /> : <FlagIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default SpamStatusChip;
