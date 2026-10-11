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
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import { useTheme } from '../../../contexts/ThemeContext';
import { useIntl } from 'react-intl';
import { ToggleRoot } from './styled';

interface ThemeToggleProps {
  showBackground?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ showBackground = false }) => {
  const { mode, toggleMode } = useTheme();
  const intl = useIntl();

  const isDark = mode === 'dark';

  return (
    <ToggleRoot showBackground={showBackground}>
      <Brightness7
        sx={{
          fontSize: '0.9rem',
          color: !isDark ? 'primary.main' : 'text.disabled',
        }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={isDark}
            onChange={toggleMode}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'primary.main',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'primary.main',
              },
            }}
          />
        }
        label={
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            {isDark
              ? intl.formatMessage({ id: 'theme.dark', defaultMessage: 'Dark' })
              : intl.formatMessage({ id: 'theme.light', defaultMessage: 'Light' })}
          </Typography>
        }
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.7rem',
          },
        }}
      />
      <Brightness4
        sx={{
          fontSize: '0.9rem',
          color: isDark ? 'primary.main' : 'text.disabled',
        }}
      />
    </ToggleRoot>
  );
};

export default ThemeToggle;
