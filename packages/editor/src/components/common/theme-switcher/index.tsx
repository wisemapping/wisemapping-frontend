import React from 'react';
import { Box, Switch, Typography, FormControlLabel, useTheme as useMuiTheme } from '@mui/material';
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
        border: '1px solid #cc8400',
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
          color: isDark ? muiTheme.palette.primary.main : muiTheme.palette.text.disabled,
        }}
      />
    </Box>
  );
};

export default ThemeSwitcher;
