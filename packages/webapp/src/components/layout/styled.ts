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

import { Link as RouterLink } from 'react-router';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

/** The page content between the header and the footer, centred vertically. */
export const LayoutContent = styled('section', {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact: boolean }>(({ theme, compact }) => ({
  flex: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  [theme.breakpoints.up('xs')]: {
    padding: compact ? '8px 16px' : '32px 16px',
  },
  [theme.breakpoints.up('md')]: {
    padding: compact ? '16px 16px' : '48px 16px',
  },
}));

/** A router link around a button: the button is the link, so no underline. */
export const ButtonLink = styled(RouterLink)({
  textDecoration: 'none',
});

/** "By continuing, you agree to our Terms...", in small print under the sign-in options. */
export const TermsNotice = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'gutter',
})<{ gutter: number }>(({ theme, gutter }) => ({
  fontSize: '12px',
  marginTop: theme.spacing(gutter),
  textAlign: 'center',
  width: '100%',
}));
