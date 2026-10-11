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
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Label, MapInfo } from '../../../classes/client';
import { useDate } from '../../../classes/app-i18n/dates';
import { LabelsCell } from './labels-cell';
import { BodyCell, CellText, LabelsBodyCell, SelectCheckbox, StarIcon, TitleLink } from './styled';

/**
 * What a row or a card hands back to the list. The handlers take the map's id rather than
 * closing over it, so the list passes the same functions to every row and a memoized row only
 * re-renders when its own map or selection changes.
 */
export interface MapItemHandlers {
  /** `starred` is the new value. */
  onStar: (mapId: number, starred: boolean) => void;
  /** Opens the row menu of the map next to `anchor`. */
  onOpenMenu: (mapId: number, anchor: HTMLElement) => void;
}

interface MapRowProps extends MapItemHandlers {
  map: MapInfo;
  selected: boolean;
  onToggleSelected: (mapId: number) => void;
  onRemoveLabel: (mapId: number, labelId: number) => void;
}

/** A map in the table: clicking the row (anywhere but its controls) selects it. */
const MapRowComponent = ({
  map,
  selected,
  onToggleSelected,
  onStar,
  onOpenMenu,
  onRemoveLabel,
}: MapRowProps): React.ReactElement => {
  const intl = useIntl();
  const date = useDate();

  const handleStar = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    event.preventDefault();
    onStar(map.id, !map.starred);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onOpenMenu(map.id, event.currentTarget);
    event.preventDefault();
    // The row toggles its selection on click: opening the menu must not.
    event.stopPropagation();
  };

  return (
    <TableRow hover onClick={() => onToggleSelected(map.id)} tabIndex={-1} selected={selected}>
      <BodyCell padding="checkbox">
        <SelectCheckbox
          checked={selected}
          size="small"
          slotProps={{
            input: {
              // Named after the map explicitly: the "Open for edition" tooltip names the title
              // link, so pointing at it read the tooltip instead of the title.
              'aria-label': intl.formatMessage(
                { id: 'maps.select-map', defaultMessage: 'Select {title}' },
                { title: map.title },
              ),
            },
          }}
        />
      </BodyCell>
      <BodyCell>
        <Tooltip
          arrow={true}
          title={intl.formatMessage({
            id: 'maps.tooltip-open',
            defaultMessage: 'Open for edition',
          })}
          placement="bottom-start"
        >
          <TitleLink
            id={`map-title-${map.id}`}
            href={`/c/maps/${map.id}/edit`}
            color="textPrimary"
            underline="always"
            onClick={(e) => e.stopPropagation()}
          >
            {map.title}
          </TitleLink>
        </Tooltip>
      </BodyCell>
      <LabelsBodyCell>
        <LabelsCell
          labels={map.labels}
          onDelete={(label: Label) => onRemoveLabel(map.id, label.id)}
        />
      </LabelsBodyCell>
      <BodyCell>
        <CellText variant="body2">{map.createdBy}</CellText>
      </BodyCell>
      <BodyCell>
        <Tooltip
          arrow={true}
          title={intl.formatMessage(
            { id: 'maps.modified-by-desc', defaultMessage: 'Modified by {by} on {on}' },
            { by: map.lastModificationBy, on: date(map.lastModificationTime).format('lll') },
          )}
          placement="bottom-start"
        >
          <CellText variant="body2">{date(map.lastModificationTime).fromNow()}</CellText>
        </Tooltip>
      </BodyCell>
      <BodyCell padding="checkbox">
        <Tooltip
          arrow={true}
          title={intl.formatMessage({ id: 'maps.tooltip-starred', defaultMessage: 'Starred' })}
        >
          <IconButton size="small" onClick={handleStar}>
            <StarIcon color="action" starred={map.starred} />
          </IconButton>
        </Tooltip>
      </BodyCell>
      <BodyCell>
        <Tooltip
          arrow={true}
          title={intl.formatMessage({ id: 'map.more-actions', defaultMessage: 'More Actions' })}
        >
          <IconButton
            aria-label={intl.formatMessage({ id: 'common.others', defaultMessage: 'Others' })}
            size="small"
            onClick={handleOpenMenu}
          >
            <MoreHorizIcon color="action" />
          </IconButton>
        </Tooltip>
      </BodyCell>
    </TableRow>
  );
};

export const MapRow = memo(MapRowComponent);
