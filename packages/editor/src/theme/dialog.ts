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
import type { Components, Theme } from '@mui/material/styles';

/**
 * The one dialog look, shared by the editor's theme and the webapp's: rounded paper with a soft
 * shadow and no coloured border, a light blurred backdrop, and the same paddings for the title,
 * the content and the actions. Dialogs used to set their own (a 2px orange border on Choose
 * Theme and Choose Layout, 39px paddings on the webapp's), so two dialogs opened from the same
 * editor looked unrelated.
 *
 * The webapp imports this module by its path, not through the editor's entry point, so that its
 * theme does not pull in the editor.
 */
export const createDialogComponents = (isLight: boolean): Components<Theme> => ({
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        color: theme.palette.text.primary,
        borderRadius: 16,
        boxShadow: isLight
          ? '0 24px 48px -12px rgba(16, 24, 40, 0.18), 0 0 0 1px rgba(16, 24, 40, 0.06)'
          : '0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }),
      backdrop: {
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.32)' : 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(2px)',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '20px 24px 12px',
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '16px 24px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }),
      dividers: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '12px 24px 20px',
        gap: '8px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        '& > :not(style) ~ :not(style)': { marginLeft: 0 },
      }),
    },
  },
});

export default createDialogComponents;
