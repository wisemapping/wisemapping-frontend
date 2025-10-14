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
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import { useTheme } from '../../../contexts/ThemeContext';
import { useIntl } from 'react-intl';

const ThemeToggleButton: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const intl = useIntl();

  const isDark = mode === 'dark';

  return (
    <Tooltip
      arrow={true}
      title={intl.formatMessage({
        id: 'theme.toggle',
        defaultMessage: 'Toggle Theme',
      })}
    >
      <Button
        size="small"
        variant="outlined"
        disableElevation={true}
        color="primary"
        onClick={toggleMode}
        startIcon={
          !isDark ? (
            <Brightness7 style={{ color: 'inherit' }} />
          ) : (
            <Brightness4 style={{ color: 'inherit' }} />
          )
        }
      >
        <span className="message">
          {isDark
            ? intl.formatMessage({ id: 'theme.dark', defaultMessage: 'Dark' })
            : intl.formatMessage({ id: 'theme.light', defaultMessage: 'Light' })}
        </span>
      </Button>
    </Tooltip>
  );
};

export default ThemeToggleButton;
