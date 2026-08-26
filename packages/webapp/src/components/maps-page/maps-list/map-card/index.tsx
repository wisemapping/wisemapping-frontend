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

import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { MapInfo, Label } from '../../../../classes/client';
import { LabelsCell } from '../labels-cell';

dayjs.extend(LocalizedFormat);
dayjs.extend(relativeTime);

export interface MapCardProps {
  map: MapInfo;
  getEditUrl: (map: MapInfo) => string;
  onStarToggle: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => void;
  onOpenActions: (id: number) => (event: React.MouseEvent) => void;
  onRemoveLabel: (mapId: number, labelId: number) => void;
}

export const MapCard = ({
  map,
  getEditUrl,
  onStarToggle,
  onOpenActions,
  onRemoveLabel,
}: MapCardProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <Card data-testid={`map-card-${map.id}`} sx={{ width: '100%', maxWidth: '420px' }}>
      <CardHeader
        avatar={
          <Tooltip
            arrow
            title={intl.formatMessage({ id: 'maps.tooltip-starred', defaultMessage: 'Starred' })}
          >
            <IconButton size="small" onClick={(e) => onStarToggle(e, map.id)}>
              <StarRateRoundedIcon
                color="action"
                style={{ color: map.starred ? 'yellow' : 'gray' }}
              />
            </IconButton>
          </Tooltip>
        }
        action={
          <Tooltip
            arrow
            title={intl.formatMessage({
              id: 'map.more-actions',
              defaultMessage: 'More Actions',
            })}
          >
            <IconButton
              aria-label={intl.formatMessage({
                id: 'common.settings',
                defaultMessage: 'Settings',
              })}
              onClick={onOpenActions(map.id)}
            >
              <MoreVertIcon color="action" />
            </IconButton>
          </Tooltip>
        }
        title={
          <Link
            href={getEditUrl(map)}
            underline="always"
            onClick={(e) => e.stopPropagation()}
            sx={{
              fontSize: '0.96rem',
              fontFamily: 'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            {map.title}
            {map.sourceType === 'gdrive' && (
              <Chip
                size="small"
                icon={<CloudQueueIcon style={{ fontSize: '0.9rem' }} />}
                label="Google Drive"
                variant="outlined"
                color="primary"
                sx={{ height: 20, fontSize: '0.72rem' }}
              />
            )}
          </Link>
        }
        subheader={
          <Tooltip
            arrow
            title={intl.formatMessage(
              { id: 'maps.modified-by-desc', defaultMessage: 'Modified by {by} on {on}' },
              { by: map.lastModificationBy, on: dayjs(map.lastModificationTime).format('lll') },
            )}
            placement="bottom-start"
          >
            <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>
              {dayjs(map.lastModificationTime).fromNow()}
            </Typography>
          </Tooltip>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.85rem',
            marginBottom: '6px',
          }}
        >
          {map.createdBy}
        </Typography>
        <LabelsCell
          labels={map.labels}
          onDelete={(label: Label) => onRemoveLabel(map.id, label.id)}
        />
      </CardContent>
    </Card>
  );
};

export default MapCard;
