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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useIntl } from 'react-intl';

const ThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const intl = useIntl();

  const tooltipText =
    mode === 'light'
      ? intl.formatMessage({ id: 'theme.switch-to-dark', defaultMessage: 'Switch to dark mode' })
      : intl.formatMessage({ id: 'theme.switch-to-light', defaultMessage: 'Switch to light mode' });

  return (
    <Tooltip title={tooltipText}>
      <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme" size="small">
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
