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

import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

/** The read-only XML of a map, in a monospaced, unwrapped block. */
export const XmlInput = styled(OutlinedInput)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  backgroundColor: theme.palette.grey[50],
  ...theme.applyStyles('dark', { backgroundColor: theme.palette.grey[900] }),
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    whiteSpace: 'pre',
    overflow: 'auto',
  },
}));
