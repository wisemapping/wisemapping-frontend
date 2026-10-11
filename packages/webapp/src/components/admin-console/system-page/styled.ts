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

/** A row of information cards that wraps when they no longer fit. */
export const InfoCards = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
}));

/** One card of an InfoCards row, at least 300px wide. */
export const InfoCard = styled(Box)({
  flex: '1 1 300px',
});

/** A headline statistic: its figure over its name, in an outlined tile. */
export const StatTile = styled(Box)(({ theme }) => ({
  flex: '1 1 200px',
  textAlign: 'center',
  padding: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
}));
