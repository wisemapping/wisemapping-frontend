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
import React, { ReactElement } from 'react';

/**
 * Stand-in for emoji-picker-react: the real grid lazy-loads hundreds of emoji and measures the
 * DOM, none of which jsdom can do. It offers one emoji to click and shows the props the pane
 * passed, so a test can pick an emoji and check the theme / placeholder it was given.
 */
type Props = {
  onEmojiClick: (emoji: { emoji: string }) => void;
  theme?: string;
  searchPlaceholder?: string;
};

export const EmojiStyle = { NATIVE: 'native' };
export const Theme = { DARK: 'dark', LIGHT: 'light', AUTO: 'auto' };

const EmojiPicker = ({ onEmojiClick, theme, searchPlaceholder }: Props): ReactElement => (
  <div data-testid="emoji-picker" data-theme={theme} data-placeholder={searchPlaceholder}>
    <button type="button" onClick={() => onEmojiClick({ emoji: '🎉' })}>
      pick party emoji
    </button>
  </div>
);

export default EmojiPicker;
