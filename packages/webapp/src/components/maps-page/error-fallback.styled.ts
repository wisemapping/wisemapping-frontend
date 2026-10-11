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
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

// The map page's error screen, which the app imports up front (it is the route's error element):
// kept out of styled.ts so the entry does not bring the map page's styles along.

export const FallbackBackdrop = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  ...theme.applyStyles('dark', { backgroundColor: 'rgba(0, 0, 0, 0.6)' }),
  padding: theme.spacing(3),
}));
export const FallbackCard = styled(Stack)(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  backgroundColor: theme.palette.background.paper,
  ...theme.applyStyles('dark', { backgroundColor: 'rgba(30, 30, 30, 0.95)' }),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  padding: theme.spacing(4),
  boxShadow: 'rgba(145, 158, 171, 0.2) 0px 10px 30px',
  ...theme.applyStyles('dark', { boxShadow: 'rgba(0, 0, 0, 0.35) 0px 10px 30px' }),
}));
