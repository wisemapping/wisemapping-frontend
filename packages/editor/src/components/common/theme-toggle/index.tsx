import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
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
