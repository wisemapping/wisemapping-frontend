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
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/** A page's title row: the heading on the left, its actions on the right. */
export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

/** The search field and the filters above a list, wrapping on narrow screens. */
export const FilterBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'gutter',
})<{ gutter: number }>(({ theme, gutter }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(gutter),
  flexWrap: 'wrap',
}));

/** The pagination below a list. */
export const PaginationBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  gap: theme.spacing(2),
}));

/** A map's id, linking to its public page; underlined on hover only. */
export const MapLink = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
})) as typeof Typography;

/** A text button as compact as the table cell it sits in. */
export const CellButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '4px 8px',
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
}));
