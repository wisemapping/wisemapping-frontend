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

import { styled } from '@mui/material/styles';

type ResponsiveProps = {
  /** A vertical divider in its own grid column from tablets up; horizontal otherwise. */
  responsive: boolean;
};

export const SeparatorRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'responsive' && prop !== 'maxWidth',
})<ResponsiveProps & { maxWidth?: number | undefined }>(({ theme, responsive, maxWidth }) => ({
  position: 'relative',
  width: '100%',
  display: 'inline-block',
  // Only the responsive variant is a vertical divider spanning its own grid
  // column, so only it stretches to the parent's height. Applying this to the
  // horizontal variant makes it claim 90% of the container and push the
  // following content out of the layout.
  ...(responsive && {
    height: '90%',
    top: '5%',
    [theme.breakpoints.down('md')]: {
      paddingTop: '25px',
      paddingBottom: '25px',
    },
  }),
  ...(!responsive && {
    paddingTop: '25px',
    paddingBottom: '25px',
  }),
  ...(maxWidth && {
    maxWidth: maxWidth,
  }),
}));

const notResponsive = (prop: PropertyKey): boolean => prop !== 'responsive';

export const SeparatorLine = styled('div', { shouldForwardProp: notResponsive })<ResponsiveProps>(
  ({ theme, responsive }) => ({
    backgroundColor: theme.palette.separator,
    position: 'absolute',
    left: '50%',
    height: '1px',
    width: '100%',
    transform: 'translateX(-50%)',
    ...(responsive && {
      [theme.breakpoints.up('md')]: {
        height: '100%',
        width: '1px',
        transform: 'translateX(0%) translateY(0%)',
      },
    }),
  }),
);

/** The "or" badge, over the middle of the line. */
export const SeparatorText = styled('div', { shouldForwardProp: notResponsive })<ResponsiveProps>(
  ({ theme, responsive }) => ({
    backgroundColor: theme.palette.separator,
    padding: '5px 10px',
    minWidth: '36px',
    borderRadius: '18px',
    fontSize: '18px',
    color: theme.palette.common.white,
    textAlign: 'center',
    display: 'inline-block',
    position: 'absolute',
    transform: 'translateX(-50%) translateY(-50%)',
    left: '50%',
    ...(responsive && {
      [theme.breakpoints.up('md')]: {
        top: '15%',
      },
    }),
  }),
);
