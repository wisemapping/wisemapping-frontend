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

import Typography from '@mui/material/Typography';
import { styled, SxProps, Theme } from '@mui/material/styles';

export const paperSx: SxProps<Theme> = {
  maxWidth: '500px',
  minWidth: '400px',
};

/** The title of the map being labelled, broken anywhere to fit. */
export const MapTitle = styled(Typography)({
  marginTop: '10px',
  maxWidth: '100%',
  wordBreak: 'break-all',
});
