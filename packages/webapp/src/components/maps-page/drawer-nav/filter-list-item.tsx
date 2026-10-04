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
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import withEmotionStyles from '../../HOCs/withEmotionStyles';
import type { Filter, LabelFilter } from '../index';

export interface ListItemProps {
  icon: React.ReactElement;
  label: string;
  filter: Filter;
  active?: Filter;
  onClick: (filter: Filter) => void;
  onDelete?: (id: number) => void;
}

// https://stackoverflow.com/questions/61486061/how-to-set-selected-and-hover-color-of-listitem-in-mui
export const CustomListItem = withEmotionStyles((theme) => ({
  position: 'relative',
  '&.Mui-selected': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.common.white, 0.2)
        : theme.palette.grey[800],
    color:
      theme.palette.mode === 'light'
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
    '& .MuiListItemIcon-root': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.contrastText
          : theme.palette.text.primary,
    },
  },
  '&.Mui-selected:hover': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.common.white, 0.25)
        : theme.palette.grey[700],
    color:
      theme.palette.mode === 'light'
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
    '& .MuiListItemIcon-root': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.contrastText
          : theme.palette.text.primary,
    },
  },
  '&:hover ~ .MuiListItemSecondaryAction-root .label-delete-button': {
    opacity: '1 !important',
  },
}))(ListItemButton);

const StyleListItem = (props: ListItemProps): ReactElement => {
  const intl = useIntl();
  const icon = props.icon;
  const label = props.label;
  const filter = props.filter;
  const activeFilter = props.active;
  const onClick = props.onClick;
  const onDeleteLabel = props.onDelete;
  const isSelected =
    activeFilter &&
    activeFilter.type == filter.type &&
    (activeFilter.type != 'label' ||
      (activeFilter as LabelFilter).label == (filter as LabelFilter).label);
  const handleOnClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, filter: Filter) => {
    event.stopPropagation();
    onClick(filter);
  };

  const handleOnDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    filter: Filter,
  ) => {
    event.stopPropagation();
    if (!onDeleteLabel) {
      throw 'Illegal state exeption';
    }
    onDeleteLabel((filter as LabelFilter).label.id);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        '&:hover .label-delete-button': {
          opacity: '1 !important',
        },
      }}
    >
      <CustomListItem
        selected={isSelected}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleOnClick(e, filter)}
      >
        <Tooltip title={label} disableInteractive>
          <ListItemIcon>{icon}</ListItemIcon>
        </Tooltip>
        <ListItemText primary={label} />
        {filter.type == 'label' && (
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
              onClick={(e) => handleOnDelete(e, filter)}
              size="small"
              className="label-delete-button"
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s ease',
                padding: '4px',
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <ClearIcon
                sx={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.95)',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                }}
              />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </CustomListItem>
    </Box>
  );
};

export default StyleListItem;
