/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

/** The switch's pill, filled when it sits on a background of its own. */
export const ToggleRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'showBackground',
})<{ showBackground: boolean }>(({ theme, showBackground }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderRadius: '50px',
  border: `1px solid ${theme.palette.themeToggle.border}`,
  backgroundColor: showBackground ? theme.palette.themeToggle.background : 'transparent',
  minWidth: '120px',
  height: '32px',
  marginRight: theme.spacing(0.5),
}));
