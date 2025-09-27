/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { createTheme, PaletteMode, Theme } from '@mui/material/styles';

const createEditorTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        light: '#ffb74d',
        main: '#ffa800',
        dark: '#e57373',
        contrastText: isLight ? '#FFFFFF' : '#000000',
      },
      secondary: {
        light: '#a19f9f',
        main: '#5a5a5a',
        dark: '#424242',
        contrastText: '#FFFFFF',
      },
      background: {
        paper: isLight ? '#ffffff' : '#1e1e1e',
        default: isLight ? '#f5f5f5' : '#121212',
      },
      text: {
        primary: isLight ? '#313131' : '#ffffff',
        secondary: isLight ? '#666666' : '#b3b3b3',
      },
      divider: isLight ? '#e0e0e0' : '#424242',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: `0 1px 3px ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
          }),
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          containedPrimary: ({ theme }) => ({
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
            },
            '&.Mui-disabled': {
              color: theme.palette.text.disabled,
            },
            '&[aria-pressed="true"]': {
              backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)',
            },
            '& svg': {
              color: 'inherit',
            },
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: () => ({
            backgroundColor: isLight ? '#616161' : '#424242',
            color: '#ffffff',
          }),
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
          },
        },
      },
    },
  });
};

export { createEditorTheme };
