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

import { createTheme, PaletteMode, Theme } from '@mui/material/styles';

const createAppTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        light: isLight ? '#ffb74d' : '#cc8500',
        main: isLight ? '#ffa800' : '#cc8500',
        dark: isLight ? '#ffcc80' : '#996400',
        contrastText: '#FFFFFF',
      },
      secondary: {
        light: '#a19f9f',
        main: '#5a5a5a',
        dark: '#424242',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? '#fafafa' : '#2a2a2a',
        paper: isLight ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: isLight ? '#333333' : '#ffffff',
        secondary: isLight ? '#666666' : '#b3b3b3',
      },
    },
    components: {
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& fieldset': {
              border: 'none',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '9px',
            fontSize: '14px',
            '& fieldset': {
              border: `solid 1px ${isLight ? '#ffcb66' : '#b37300'}`,
            },
            '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error) fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.main,
          }),
          outlined: {
            zIndex: 'inherit',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: '15px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textTransform: 'none',
            borderRadius: '9px',
            padding: '6px 20px 6px 20px',
          },
          containedPrimary: ({ theme }) => ({
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: `${theme.palette.background.paper} !important`,
            color: `${theme.palette.text.primary} !important`,
            boxShadow: `0 1px 3px ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
            '&.MuiAppBar-colorDefault': {
              backgroundColor: `${theme.palette.background.paper} !important`,
              color: `${theme.palette.text.primary} !important`,
            },
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
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
            },
            '& svg': {
              color: 'inherit',
            },
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
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },
    },
    typography: {
      fontFamily: ['Figtree', 'Noto Sans JP', 'Helvetica', 'system-ui', 'Arial', 'sans-serif'].join(
        ',',
      ),
      h4: {
        color: isLight ? '#ffa800' : '#cc8500',
        fontWeight: 600,
        marginBottom: '10px',
      },
      h6: {
        fontSize: '25px',
        fontWeight: 'bold',
      },
    },
  });
};

export { createAppTheme };
