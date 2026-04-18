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

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import iconGroups from './iconGroups.json';
import { SvgImageIcon } from '@wisemapping/mindplot';
import NodeProperty from '../../../../../classes/model/node-property';
import { SvgIcon } from './styled';

const RECENTLY_USED_KEY = 'wisemapping:icon-picker:recently-used';
const MAX_RECENTLY_USED = 16;
const allIcons: string[] = iconGroups.flatMap((group) => group.icons);

function getRecentlyUsed(): string[] {
  try {
    const stored = localStorage.getItem(RECENTLY_USED_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function addToRecentlyUsed(icon: string): void {
  try {
    const recent = getRecentlyUsed().filter((i) => i !== icon);
    recent.unshift(icon);
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recent.slice(0, MAX_RECENTLY_USED)));
  } catch {
    // ignore storage errors
  }
}

type IconImageTab = {
  iconModel: NodeProperty<string | undefined>;
};
const IconImageTab = ({ iconModel }: IconImageTab): ReactElement => {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(getRecentlyUsed);

  const handleIconClick = useCallback(
    (icon: string) => {
      const setValue = iconModel.setValue;
      if (setValue) {
        setValue(`image:${icon}`);
      }
      addToRecentlyUsed(icon);
      setRecentlyUsed(getRecentlyUsed());
    },
    [iconModel],
  );

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return allIcons;
    const query = searchQuery.toLowerCase().replace(/[\s_-]+/g, '');
    return allIcons.filter((icon) =>
      icon
        .toLowerCase()
        .replace(/[\s_-]+/g, '')
        .includes(query),
    );
  }, [searchQuery]);

  const showFrequentlyUsed = recentlyUsed.length > 0 && !searchQuery.trim();
  const showNoResults = searchQuery.trim().length > 0 && filteredIcons.length === 0;

  return (
    <Box sx={{ width: '450px' }}>
      <TextField
        fullWidth
        size="small"
        autoFocus
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={intl.formatMessage({
          id: 'icon-picker.search-placeholder',
          defaultMessage: 'Search icons...',
        })}
        sx={{ mb: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />

      {showFrequentlyUsed && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, px: 0.5 }}
          >
            <FormattedMessage id="icon-picker.frequently-used" defaultMessage="Frequently Used" />
          </Typography>
          <Box>
            {recentlyUsed.map((icon) => (
              <SvgIcon
                key={icon}
                src={SvgImageIcon.getImageUrl(icon)}
                onClick={() => handleIconClick(icon)}
              />
            ))}
          </Box>
        </Box>
      )}

      {showNoResults ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="icon-picker.no-results" defaultMessage="No icons found" />
          </Typography>
        </Box>
      ) : (
        <Box>
          {searchQuery.trim()
            ? filteredIcons.map((icon) => (
                <SvgIcon
                  key={icon}
                  src={SvgImageIcon.getImageUrl(icon)}
                  onClick={() => handleIconClick(icon)}
                />
              ))
            : iconGroups.map((family, i) => (
                <span key={i}>
                  {family.icons.map((icon: string) => (
                    <SvgIcon
                      key={icon}
                      src={SvgImageIcon.getImageUrl(icon)}
                      onClick={() => handleIconClick(icon)}
                    />
                  ))}
                </span>
              ))}
        </Box>
      )}
    </Box>
  );
};
export default IconImageTab;
