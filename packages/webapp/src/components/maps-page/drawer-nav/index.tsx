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
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import logoIconBlack from '../../../../images/logo-and-text-black.svg';
import logoIconWhite from '../../../../images/logo-and-text-white.svg';
import { useTheme } from '../../../contexts/ThemeContext';
import StyleListItem from './filter-list-item';
import type { AccountInfo } from '../../../classes/client';
import type { Filter, GenericFilter, LabelFilter } from '../index';
import { useIntl } from 'react-intl';

export interface ToolbarButtonInfo {
  filter: GenericFilter | LabelFilter;
  label: string;
  icon: React.ReactElement;
}

export interface DrawerNavProps {
  /** Account of the logged-in user, when already fetched. */
  account: AccountInfo | undefined;
  /** True when either the desktop or the mobile drawer is expanded. */
  drawerOpen: boolean;
  /** Filter entries to render, in order. */
  filterButtons: ToolbarButtonInfo[];
  /** Currently applied filter. */
  activeFilter: Filter;
  onFilterClick: (filter: Filter) => void;
  onLabelDelete: (id: number) => void;
}

/**
 * Contents shared by the maps page mobile and desktop drawers: product logo,
 * the signed-in user's details and the filter navigation list.
 */
const DrawerNav = ({
  account,
  drawerOpen,
  filterButtons,
  activeFilter,
  onFilterClick,
  onLabelDelete,
}: DrawerNavProps): ReactElement => {
  const intl = useIntl();
  const { mode } = useTheme();
  return (
    <>
      <div
        style={{
          padding: '24px 16px 20px 16px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 0,
        }}
        key="logo"
      >
        <img
          src={mode === 'dark' ? logoIconWhite : logoIconBlack}
          alt={intl.formatMessage({ id: 'common.logo', defaultMessage: 'WiseMapping logo' })}
          style={{ height: '32px', width: 'auto' }}
        />
      </div>

      {/* User Info Box */}
      {account && drawerOpen && (
        <Box
          sx={{
            padding: '16px',
            margin: '0 8px 16px 8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: '16px',
                fontWeight: 500,
                fontFamily: 'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {account.firstname && account.lastname
                ? `${account.firstname} ${account.lastname}`
                : account.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '14px',
                fontFamily: 'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {account.email}
            </Typography>
          </Box>
        </Box>
      )}

      <List component="nav">
        {filterButtons.map((buttonInfo) => {
          return (
            <StyleListItem
              icon={buttonInfo.icon}
              label={buttonInfo.label}
              filter={buttonInfo.filter}
              active={activeFilter}
              onClick={onFilterClick}
              onDelete={onLabelDelete}
              key={`${buttonInfo.filter.type}:${buttonInfo.label}`}
            />
          );
        })}
      </List>
    </>
  );
};

export default DrawerNav;
