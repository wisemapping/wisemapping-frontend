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

/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import TopicImagePicker from '../../../src/components/action-widget/pane/topic-image-picker';
import { property, readOnlyProperty, renderPane } from './helpers';

const pause = jest.fn();
const resume = jest.fn();
jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: {
    pause: () => pause(),
    resume: () => resume(),
  },
}));
jest.mock('emoji-picker-react', () => jest.requireActual('./emoji-picker-mock'));

beforeEach(() => {
  pause.mockClear();
  resume.mockClear();
});

describe('TopicImagePicker', () => {
  const models = () => ({
    emojiModel: property<string | undefined>(undefined),
    iconsGalleryModel: property<string | undefined>('coffee'),
  });

  it('pauses the map keyboard while open', () => {
    const { unmount } = renderPane(<TopicImagePicker triggerClose={jest.fn()} {...models()} />);

    expect(pause).toHaveBeenCalledTimes(1);
    unmount();
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('offers emojis only, with a search in the user language', () => {
    renderPane(<TopicImagePicker triggerClose={jest.fn()} {...models()} />);

    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByText('Icons Gallery')).toBeNull();
    const picker = screen.getByTestId('emoji-picker');
    expect(picker.getAttribute('data-theme')).toBe('light');
    expect(picker.getAttribute('data-placeholder')).toBe('Search emojis...');
  });

  it('sets the emoji and clears the gallery icon an older map may have, staying open', () => {
    const m = models();
    const triggerClose = jest.fn();
    renderPane(<TopicImagePicker triggerClose={triggerClose} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(m.emojiModel.setValue).toHaveBeenCalledWith('🎉');
    expect(m.iconsGalleryModel.setValue).toHaveBeenCalledWith(undefined);
    expect(triggerClose).not.toHaveBeenCalled();
  });

  it('uses the dark emoji theme in dark mode', () => {
    renderPane(<TopicImagePicker triggerClose={jest.fn()} {...models()} />, 'dark');

    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('dark');
  });

  it('ignores an emoji when the models cannot be changed', () => {
    renderPane(
      <TopicImagePicker
        triggerClose={jest.fn()}
        emojiModel={readOnlyProperty<string | undefined>(undefined)}
        iconsGalleryModel={readOnlyProperty<string | undefined>(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(screen.getByTestId('emoji-picker')).toBeTruthy();
  });

  it('closes from the close button', () => {
    const triggerClose = jest.fn();
    renderPane(<TopicImagePicker triggerClose={triggerClose} {...models()} />);

    fireEvent.click(screen.getAllByTestId('CloseIcon')[0].closest('button') as HTMLElement);

    expect(triggerClose).toHaveBeenCalledTimes(1);
  });
});
