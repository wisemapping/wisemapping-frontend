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

import React, { ReactElement, Suspense } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';

export type EmojiPickerProps = {
  onEmojiClick: (emoji: EmojiClickData) => void;
  theme: 'light' | 'dark' | 'auto';
  searchPlaceholder?: string;
};

// emoji-picker-react is about 300 KB with its emoji data: loaded the first time a picker opens,
// not with the editor.
const EmojiPickerGrid = React.lazy(() => import('./EmojiPickerGrid'));

/** The emoji picker; it fills its container, which keeps its size while the picker loads. */
const LazyEmojiPicker = (props: EmojiPickerProps): ReactElement => (
  <Suspense fallback={null}>
    <EmojiPickerGrid {...props} />
  </Suspense>
);

export default LazyEmojiPicker;
