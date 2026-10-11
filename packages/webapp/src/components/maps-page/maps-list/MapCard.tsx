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

import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MapInfo } from '../../../classes/client';
import { useDate } from '../../../classes/app-i18n/dates';
import type { MapItemHandlers } from './MapRow';
import { CardTitle, CompactCardHeader, MapCardRoot, StarIcon } from './styled';

interface MapCardProps extends MapItemHandlers {
  map: MapInfo;
}

/** A map on a narrow screen: the whole card opens the map in the editor. */
const MapCardComponent = ({ map, onStar, onOpenMenu }: MapCardProps): React.ReactElement => {
  const intl = useIntl();
  const date = useDate();

  // Both buttons sit inside the card's link: neither may follow it.
  const handleStar = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    event.preventDefault();
    onStar(map.id, !map.starred);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onOpenMenu(map.id, event.currentTarget);
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <MapCardRoot>
      <Link href={`/c/maps/${map.id}/edit`} underline="none" onClick={(e) => e.stopPropagation()}>
        <CompactCardHeader
          avatar={
            <Tooltip
              arrow={true}
              title={intl.formatMessage({ id: 'maps.tooltip-starred', defaultMessage: 'Starred' })}
            >
              <IconButton size="small" onClick={handleStar}>
                <StarIcon color="action" starred={map.starred} />
              </IconButton>
            </Tooltip>
          }
          action={
            <Tooltip
              arrow={true}
              title={intl.formatMessage({ id: 'map.more-actions', defaultMessage: 'More Actions' })}
            >
              <IconButton
                aria-label={intl.formatMessage({
                  id: 'common.settings',
                  defaultMessage: 'Settings',
                })}
                onClick={handleOpenMenu}
              >
                <MoreVertIcon color="action" />
              </IconButton>
            </Tooltip>
          }
          // Not a Typography itself, so the header wraps it in its title Typography.
          title={<CardTitle noWrap>{map.title}</CardTitle>}
          subheader={
            <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>
              {intl.formatMessage({ id: 'map.last-update', defaultMessage: 'Last Update' })}
              <span>: </span>
              <Tooltip
                arrow={true}
                title={intl.formatMessage(
                  { id: 'maps.modified-by-desc', defaultMessage: 'Modified by {by} on {on}' },
                  { by: map.lastModificationBy, on: date(map.lastModificationTime).format('lll') },
                )}
                placement="bottom-start"
              >
                <span>{date(map.lastModificationTime).fromNow()}</span>
              </Tooltip>
            </Typography>
          }
        />
      </Link>
    </MapCardRoot>
  );
};

export const MapCard = memo(MapCardComponent);
