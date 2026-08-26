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
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { useIntl } from 'react-intl';
import type { Filter, LabelFilter } from '../index';

export interface FilterPillButton {
  filter: Filter;
  label: string;
  icon: React.ReactElement;
}

export interface FilterPillsProps {
  buttons: FilterPillButton[];
  active: Filter;
  onSelect: (filter: Filter) => void;
  onDeleteLabel?: (labelId: number) => void;
}

const isSameFilter = (a: Filter, b: Filter): boolean =>
  a.type === b.type &&
  (a.type !== 'label' || (a as LabelFilter).label.id === (b as LabelFilter).label.id);

const testId = (filter: Filter): string =>
  filter.type === 'label'
    ? `filter-pill-label-${(filter as LabelFilter).label.id}`
    : `filter-pill-${filter.type}`;

export const FilterPills = ({
  buttons,
  active,
  onSelect,
  onDeleteLabel,
}: FilterPillsProps): React.ReactElement => {
  const intl = useIntl();
  return (
    <Box
      role="tablist"
      aria-label={intl.formatMessage({ id: 'maps.filters', defaultMessage: 'Filters' })}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 24px' }}
    >
      {buttons.map((button) => {
        const selected = isSameFilter(button.filter, active);
        const isLabel = button.filter.type === 'label';
        return (
          <Box key={`${button.filter.type}:${button.label}`} sx={{ position: 'relative' }}>
            <Chip
              role="tab"
              aria-selected={selected}
              data-testid={testId(button.filter)}
              icon={button.icon}
              label={button.label}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => onSelect(button.filter)}
              sx={{ borderRadius: '999px' }}
            />
            {isLabel && onDeleteLabel && (
              <IconButton
                aria-label={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteLabel((button.filter as LabelFilter).label.id);
                }}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  padding: '2px',
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'background.paper' },
                }}
              >
                <ClearIcon sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default FilterPills;
