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

import { ReactElement } from 'react';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiPickerProps } from '.';

const THEMES = { light: Theme.LIGHT, dark: Theme.DARK, auto: Theme.AUTO };

/** The emoji picker as every pane shows it. Loaded on demand: see ./index. */
const EmojiPickerGrid = ({
  onEmojiClick,
  theme,
  searchPlaceholder,
}: EmojiPickerProps): ReactElement => (
  <EmojiPicker
    onEmojiClick={onEmojiClick}
    lazyLoadEmojis={true}
    autoFocusSearch={true}
    previewConfig={{ showPreview: false }}
    emojiStyle={EmojiStyle.NATIVE}
    skinTonesDisabled
    theme={THEMES[theme]}
    width="100%"
    height="100%"
    {...(searchPlaceholder !== undefined && { searchPlaceholder })}
  />
);

export default EmojiPickerGrid;
