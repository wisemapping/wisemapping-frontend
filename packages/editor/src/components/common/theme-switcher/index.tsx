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
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useIntl } from 'react-intl';

const ThemeSwitcher: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const muiTheme = useMuiTheme();
  const intl = useIntl();

  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        pl: 1,
        pr: 1.5,
        py: 0.5,
        borderRadius: '50px',
        border: `1px solid ${muiTheme.palette.primary.main}`,
        backgroundColor: 'transparent',
        minWidth: '120px',
        height: '32px',
        mr: 0.5,
      }}
    >
      <Brightness7
        sx={{
          fontSize: '0.9rem',
          color: !isDark ? muiTheme.palette.primary.main : muiTheme.palette.text.disabled,
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
                color: muiTheme.palette.primary.main,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: muiTheme.palette.primary.main,
              },
            }}
          />
        }
        label={
          <Typography
            variant="caption"
            sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#000000' }}
          >
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
          color: isDark ? muiTheme.palette.primary.main : muiTheme.palette.text.disabled,
        }}
      />
    </Box>
  );
};

export default ThemeSwitcher;
