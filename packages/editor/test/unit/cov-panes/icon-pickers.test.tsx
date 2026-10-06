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
import IconPicker from '../../../src/components/action-widget/pane/icon-picker';
import IconImageTab from '../../../src/components/action-widget/pane/icon-picker/image-icon-tab';
import TopicIconEditor from '../../../src/components/action-widget/pane/topic-icon-editor';
import { property, readOnlyProperty, renderPane } from './helpers';
import { BURST_TEXT, typeInBurst } from '../burst-typing';

const pause = jest.fn();
const resume = jest.fn();
jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: {
    pause: () => pause(),
    resume: () => resume(),
  },
  SvgImageIcon: { getImageUrl: (id: string) => `/icons/${id}.svg` },
}));
jest.mock('emoji-picker-react', () => jest.requireActual('./emoji-picker-mock'));

const RECENTLY_USED_KEY = 'wisemapping:icon-picker:recently-used';

const iconImages = (): HTMLImageElement[] =>
  Array.from(document.querySelectorAll<HTMLImageElement>('img[src^="/icons/"]'));

const iconImage = (id: string): HTMLImageElement => {
  const image = iconImages().find((img) => img.getAttribute('src') === `/icons/${id}.svg`);
  if (!image) {
    throw new Error(`no icon ${id}`);
  }
  return image;
};

const search = (term: string): void => {
  fireEvent.change(screen.getByPlaceholderText('Search icons...'), { target: { value: term } });
};

beforeEach(() => {
  pause.mockClear();
  resume.mockClear();
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('IconImageTab (image gallery)', () => {
  it('sets the clicked image icon and remembers it as frequently used', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<IconImageTab iconModel={iconModel} />);

    expect(screen.queryByText('Frequently Used')).toBeNull();
    const total = iconImages().length;

    fireEvent.click(iconImage('flag_blue'));

    expect(iconModel.setValue).toHaveBeenCalledWith('image:flag_blue');
    expect(screen.getByText('Frequently Used')).toBeTruthy();
    // The frequently-used row repeats the icon above the full gallery.
    expect(iconImages()).toHaveLength(total + 1);
    expect(JSON.parse(localStorage.getItem(RECENTLY_USED_KEY) as string)).toEqual(['flag_blue']);
  });

  it('keeps the most recent icon first, without duplicates, and at most 16 of them', () => {
    const stored = Array.from({ length: 16 }, (_, i) => `old_${i}`);
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(['flag_green', ...stored]));
    const iconModel = property<string | undefined>(undefined);
    renderPane(<IconImageTab iconModel={iconModel} />);

    // Clicking a frequently-used icon picks it as well.
    fireEvent.click(iconImages()[0]);
    expect(iconModel.setValue).toHaveBeenLastCalledWith('image:flag_green');

    fireEvent.click(iconImage('flag_pink'));

    const recent = JSON.parse(localStorage.getItem(RECENTLY_USED_KEY) as string) as string[];
    expect(recent).toHaveLength(16);
    expect(recent.slice(0, 3)).toEqual(['flag_pink', 'flag_green', 'old_0']);
  });

  it('filters the gallery ignoring case, spaces, dashes and underscores', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<IconImageTab iconModel={iconModel} />);

    search('Flag-Blue');

    expect(iconImages().map((img) => img.getAttribute('src'))).toEqual(['/icons/flag_blue.svg']);
    fireEvent.click(iconImage('flag_blue'));
    expect(iconModel.setValue).toHaveBeenCalledWith('image:flag_blue');

    search('flag');
    expect(iconImages()).toHaveLength(6);
  });

  it('hides the frequently-used row while searching', () => {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(['flag_green']));
    renderPane(<IconImageTab iconModel={property<string | undefined>(undefined)} />);

    expect(screen.getByText('Frequently Used')).toBeTruthy();
    search('flag');
    expect(screen.queryByText('Frequently Used')).toBeNull();
  });

  it('says so when nothing matches, and clears the search from its button', () => {
    renderPane(<IconImageTab iconModel={property<string | undefined>(undefined)} />);

    search('zzzz-no-such-icon');
    expect(screen.getByText('No icons found')).toBeTruthy();
    expect(iconImages()).toHaveLength(0);

    fireEvent.click(screen.getByTestId('ClearIcon').closest('button') as HTMLElement);

    expect(screen.queryByText('No icons found')).toBeNull();
    expect((screen.getByPlaceholderText('Search icons...') as HTMLInputElement).value).toBe('');
    expect(iconImages().length).toBeGreaterThan(50);
  });

  it('treats a blank search as no search', () => {
    renderPane(<IconImageTab iconModel={property<string | undefined>(undefined)} />);
    const total = iconImages().length;

    search('   ');

    expect(iconImages()).toHaveLength(total);
    expect(screen.queryByText('No icons found')).toBeNull();
  });

  it('works without storage: corrupt data or a throwing localStorage', () => {
    localStorage.setItem(RECENTLY_USED_KEY, '{not json');
    const iconModel = readOnlyProperty<string | undefined>(undefined);
    const { unmount } = renderPane(<IconImageTab iconModel={iconModel} />);
    expect(screen.queryByText('Frequently Used')).toBeNull();
    unmount();

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const writable = property<string | undefined>(undefined);
    renderPane(<IconImageTab iconModel={writable} />);
    fireEvent.click(iconImage('flag_blue'));

    expect(writable.setValue).toHaveBeenCalledWith('image:flag_blue');
    expect(screen.queryByText('Frequently Used')).toBeNull();
  });
});

describe('IconPicker', () => {
  it('pauses the map keyboard while open', () => {
    const { unmount } = renderPane(
      <IconPicker triggerClose={jest.fn()} iconModel={property<string | undefined>(undefined)} />,
    );

    expect(pause).toHaveBeenCalledTimes(1);
    expect(resume).not.toHaveBeenCalled();
    unmount();
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('sets an emoji icon picked from the emoji picker', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<IconPicker triggerClose={jest.fn()} iconModel={iconModel} />);

    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('auto');
    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(iconModel.setValue).toHaveBeenCalledWith('emoji:🎉');
  });

  it('switches to the image gallery with "Show images"', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<IconPicker triggerClose={jest.fn()} iconModel={iconModel} />);

    fireEvent.click(screen.getByLabelText('Show images'));

    expect(screen.queryByTestId('emoji-picker')).toBeNull();
    fireEvent.click(iconImage('flag_blue'));
    expect(iconModel.setValue).toHaveBeenCalledWith('image:flag_blue');

    fireEvent.click(screen.getByLabelText('Show images'));
    expect(screen.getByTestId('emoji-picker')).toBeTruthy();
  });

  it('ignores an emoji when the icon cannot be changed', () => {
    renderPane(
      <IconPicker
        triggerClose={jest.fn()}
        iconModel={readOnlyProperty<string | undefined>(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));
    expect(screen.getByTestId('emoji-picker')).toBeTruthy();
  });
});

describe('TopicIconEditor', () => {
  it('opens on the emoji tab and sets the picked emoji', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<TopicIconEditor closeModal={jest.fn()} iconModel={iconModel} />);

    expect(screen.getByRole('tab', { name: 'Emojis' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(iconModel.setValue).toHaveBeenCalledWith('emoji:🎉');
  });

  it('uses the dark emoji theme in dark mode', () => {
    renderPane(
      <TopicIconEditor closeModal={jest.fn()} iconModel={property<string | undefined>('x')} />,
      'dark',
    );

    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('dark');
  });

  it('sets an image icon from the gallery tab', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<TopicIconEditor closeModal={jest.fn()} iconModel={iconModel} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Icons Gallery' }));
    expect(screen.queryByTestId('emoji-picker')).toBeNull();
    fireEvent.click(iconImage('flag_green'));

    expect(iconModel.setValue).toHaveBeenCalledWith('image:flag_green');
  });

  it('pauses the map keyboard while open and closes from its button', () => {
    const closeModal = jest.fn();
    const { unmount } = renderPane(
      <TopicIconEditor
        closeModal={closeModal}
        iconModel={readOnlyProperty<string | undefined>('')}
      />,
    );

    expect(pause).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));
    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);
    expect(closeModal).toHaveBeenCalledTimes(1);

    unmount();
    expect(resume).toHaveBeenCalledTimes(1);
  });
});

describe('icon search typing', () => {
  it('takes 200 characters typed in one burst, as Cypress types them', async () => {
    renderPane(<IconImageTab iconModel={property<string | undefined>(undefined)} />);
    const field = screen.getByPlaceholderText('Search icons...') as HTMLInputElement;

    const errors = await typeInBurst(field);

    expect(errors).toEqual([]);
    expect(field.value).toBe(BURST_TEXT);
    // The search ran on the typed text: nothing matches it.
    expect(screen.getByText('No icons found')).toBeTruthy();
  });
});
