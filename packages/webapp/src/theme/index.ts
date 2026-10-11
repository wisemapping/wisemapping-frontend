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
import { createDialogComponents } from '@wisemapping/editor/theme/dialog';
import logo from '../components/layout/header/logo-small.svg';
import logoWhiteText from '../components/layout/header/logo-small-white-text.svg';

/** A brand colour: its base, its hover shade and the text drawn on it. */
type BrandColor = { main: string; dark: string; contrastText: string };
type CodeBlockColors = { background: string; text: string };
type UrlFieldColors = { background: string; hoverBackground: string; text: string };
type AvatarColors = { text: string; tints: [string, ...string[]] };
type ThemeToggleColors = { border: string; background: string };

declare module '@mui/material/styles' {
  interface Theme {
    /** The WiseMapping logo whose text reads on this mode's background. */
    logo: string;
  }
  interface ThemeOptions {
    logo?: string;
  }
  interface Palette {
    /** Facebook's brand blue, for the Facebook sign-in and account controls. */
    facebook: BrandColor;
    /** A block of code to copy, such as the publish dialog's embed snippet. */
    codeBlock: CodeBlockColors;
    /** A link to copy, such as the publish dialog's public URL. */
    urlField: UrlFieldColors;
    /** The initials avatars of the people a map is shared with. */
    avatar: AvatarColors;
    /** The line and the "or" badge between the sign-in form and the social buttons. */
    separator: string;
    /** The light/dark switch of the footer. */
    themeToggle: ThemeToggleColors;
  }
  interface PaletteOptions {
    facebook?: BrandColor;
    codeBlock?: CodeBlockColors;
    urlField?: UrlFieldColors;
    avatar?: AvatarColors;
    separator?: string;
    themeToggle?: ThemeToggleColors;
  }
}

const createAppTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';

  return createTheme({
    logo: String(isLight ? logo : logoWhiteText),
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
      facebook: {
        main: '#1877f2',
        dark: '#166fe5',
        contrastText: '#ffffff',
      },
      codeBlock: {
        background: '#f5f5f5',
        text: '#2c3e50',
      },
      urlField: {
        background: '#f0f7ff',
        hoverBackground: '#e3f2fd',
        text: '#1976d2',
      },
      avatar: {
        text: '#ffffff',
        // Soft tints that read on light and dark paper; a person always gets the same one.
        tints: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
      },
      separator: '#dce2e6',
      themeToggle: {
        border: '#cc8400',
        background: '#ffcc80',
      },
    },
    components: {
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& fieldset:not(.MuiOutlinedInput-notchedOutline)': {
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
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: ({ theme }) => ({
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }),
          },
        ],
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
      ...createDialogComponents(isLight),
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
