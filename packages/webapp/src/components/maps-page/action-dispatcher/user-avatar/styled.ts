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

import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

/** The tint of a person's avatar: always the same one for the same key. */
const tintFor = (tints: [string, ...string[]], key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return tints[Math.abs(hash) % tints.length] ?? tints[0];
};

export const StyledUserAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'tintKey',
})<{ tintKey: string }>(({ theme, tintKey }) => ({
  width: 32,
  height: 32,
  fontSize: '0.8rem',
  fontWeight: 600,
  color: theme.palette.avatar.text,
  backgroundColor: tintFor(theme.palette.avatar.tints, tintKey),
}));
