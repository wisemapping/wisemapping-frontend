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
import { FormattedMessage, useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import {
  ListToolbar,
  SearchBox,
  SearchContainer,
  SearchIconWrapper,
  SearchInput,
  ToolbarActions,
  ToolbarEnd,
} from './styled';

interface MapsListToolbarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onLabelSelected: () => void;
  onSearchChange: (value: string) => void;
  /** Shown at the end of the toolbar: the pagination, on wide screens. */
  end?: React.ReactNode;
}

/** Above the list: the actions on the selected maps, the search box and the pagination. */
export const MapsListToolbar = ({
  selectedCount,
  onDeleteSelected,
  onLabelSelected,
  onSearchChange,
  end,
}: MapsListToolbarProps): React.ReactElement => {
  const intl = useIntl();

  return (
    <ListToolbar variant="dense">
      <ToolbarActions>
        {selectedCount > 0 && (
          <Tooltip
            arrow={true}
            title={intl.formatMessage({
              id: 'map.delete-selected',
              defaultMessage: 'Delete selected',
            })}
          >
            <Button
              color="primary"
              size="medium"
              variant="outlined"
              type="button"
              disableElevation={true}
              onClick={onDeleteSelected}
              startIcon={<DeleteOutlined />}
            >
              <span className="button-text">
                <FormattedMessage id="action.delete" defaultMessage="Delete" />
              </span>
            </Button>
          </Tooltip>
        )}

        {selectedCount > 0 && (
          <Tooltip
            arrow={true}
            title={intl.formatMessage({
              id: 'map.tooltip-add',
              defaultMessage: 'Add label to selected',
            })}
          >
            <Button
              color="primary"
              size="medium"
              variant="outlined"
              type="button"
              sx={{ marginLeft: '10px' }}
              disableElevation={true}
              startIcon={<LabelTwoTone />}
              onClick={onLabelSelected}
            >
              <span className="button-text">
                <FormattedMessage id="action.label" defaultMessage="Add Label" />
              </span>
            </Button>
          </Tooltip>
        )}
      </ToolbarActions>

      <SearchContainer>
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <SearchInput
            placeholder={intl.formatMessage({
              id: 'maps.search-action',
              defaultMessage: 'Search ...',
            })}
            slotProps={{
              input: {
                'aria-label': intl.formatMessage({
                  id: 'maps.search-label',
                  defaultMessage: 'Search maps',
                }),
              },
            }}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </SearchBox>
      </SearchContainer>

      <ToolbarEnd>{end}</ToolbarEnd>
    </ListToolbar>
  );
};
