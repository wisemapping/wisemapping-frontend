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

import { Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Shared styled tabs component used across all editor dialogs
 * Provides consistent styling for topic-style-editor, topic-image-picker, and topic-icon-editor
 */
export const StyledEditorsTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '34px',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 500,
    minHeight: '34px',
    fontSize: '0.75rem',
    padding: '6px 5px',
    margin: '0px',
    minWidth: '60px',
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    height: '2px',
    borderRadius: '1px',
    backgroundColor: theme.palette.primary.main,
  },
}));
