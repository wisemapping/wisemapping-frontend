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

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import TableCell from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';

// What the map list and its loading placeholder share: kept apart from styled.ts so that the
// placeholder, which every page's loading screen shows, does not bring the list's styles along.

export const BodyCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.96rem',
  fontFamily: theme.typography.fontFamily,
  padding: theme.spacing(1, 1.5),
}));
export const CompactCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));
export const MapCardRoot = styled(Card)({
  maxWidth: '94vw',
  margin: '3vw',
});
