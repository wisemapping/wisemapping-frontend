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

import React from 'react';
import { StyledUserAvatar, tintFor } from './styled';

/** Up to two initials: "Ana Ruiz" is AR, "ana@wisemapping.com" is A. */
export const initialsOf = (name: string): string => {
  const words = name
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
};

type UserAvatarProps = {
  /** A name or an email: it picks the initials and the colour. */
  name: string;
};

/** A person's initials in a colour of their own. Decorative: the name is shown next to it. */
const UserAvatar = ({ name }: UserAvatarProps): React.ReactElement => (
  <StyledUserAvatar tint={tintFor(name)} aria-hidden="true">
    {initialsOf(name)}
  </StyledUserAvatar>
);

export default UserAvatar;
