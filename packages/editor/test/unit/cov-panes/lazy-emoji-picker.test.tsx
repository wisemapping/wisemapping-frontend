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

import { render, screen } from '@testing-library/react';
import LazyEmojiPicker from '../../../src/components/action-widget/pane/shared/emoji-picker';

const pickerProps = jest.fn();
jest.mock('emoji-picker-react', () => ({
  __esModule: true,
  EmojiStyle: { NATIVE: 'native' },
  Theme: { DARK: 'dark', LIGHT: 'light', AUTO: 'auto' },
  default: (props: Record<string, unknown>) => {
    pickerProps(props);
    return <div data-testid="emoji-picker" />;
  },
}));

describe('LazyEmojiPicker', () => {
  beforeEach(() => pickerProps.mockReset());

  it('loads the picker and gives it the configuration every pane uses', async () => {
    const onEmojiClick = jest.fn();
    render(<LazyEmojiPicker onEmojiClick={onEmojiClick} theme="dark" searchPlaceholder="Find" />);

    await screen.findByTestId('emoji-picker');
    expect(pickerProps).toHaveBeenLastCalledWith({
      onEmojiClick,
      lazyLoadEmojis: true,
      autoFocusSearch: true,
      previewConfig: { showPreview: false },
      emojiStyle: 'native',
      skinTonesDisabled: true,
      theme: 'dark',
      width: '100%',
      height: '100%',
      searchPlaceholder: 'Find',
    });
  });

  it("leaves the picker's own placeholder when none is given", async () => {
    render(<LazyEmojiPicker onEmojiClick={jest.fn()} theme="auto" />);

    await screen.findByTestId('emoji-picker');
    expect(pickerProps.mock.lastCall[0]).not.toHaveProperty('searchPlaceholder');
    expect(pickerProps.mock.lastCall[0].theme).toBe('auto');
  });
});
