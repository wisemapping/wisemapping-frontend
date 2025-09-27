import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
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
