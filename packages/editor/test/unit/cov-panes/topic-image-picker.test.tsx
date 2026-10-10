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
import ImageIconTab, {
  PICKER_ICON_NAMES,
} from '../../../src/components/action-widget/pane/topic-image-picker/image-icon-tab';
import { property, readOnlyProperty, renderPane } from './helpers';
import { BURST_TEXT, typeInBurst } from '../burst-typing';

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

/**
 * The category bar comes before the icon grid, and several category icons also appear in the
 * grid, so the first element with the icon is the category button.
 */
const categoryButton = (iconTestId: string): HTMLElement =>
  screen.getAllByTestId(iconTestId)[0].closest('button') as HTMLElement;

const search = (term: string): void => {
  fireEvent.change(screen.getByPlaceholderText('Search icons...'), { target: { value: term } });
};

describe('ImageIconTab (material icon gallery)', () => {
  const models = () => ({
    iconModel: property<string | undefined>(undefined),
    emojiModel: property<string | undefined>('😀'),
  });

  it('lists every icon under "All" and sets the clicked one, clearing any emoji', () => {
    const m = models();
    renderPane(<ImageIconTab {...m} />);

    expect(screen.getByText(`All (${PICKER_ICON_NAMES.length} icons)`)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'coffee' }));

    expect(m.emojiModel.setValue).toHaveBeenCalledWith(undefined);
    expect(m.iconModel.setValue).toHaveBeenCalledWith('coffee');
  });

  it('highlights the icon the topic already has', () => {
    renderPane(
      <ImageIconTab
        iconModel={property<string | undefined>('coffee')}
        emojiModel={property<string | undefined>(undefined)}
      />,
    );

    expect(screen.getByRole('button', { name: 'coffee' }).classList.contains('selected')).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: 'cake' }).classList.contains('selected')).toBe(false);
  });

  it.each([
    ['NavigationIcon', 'HomeIcon', 'Navigation'],
    ['GeneralIcon', 'StarIcon', 'General'],
    ['PeopleIcon', 'PersonIcon', 'People'],
    ['CommunicationIcon', 'EmailIcon', 'Communication'],
    ['TechnologyIcon', 'ComputerIcon', 'Technology'],
    ['BusinessIcon', 'AttachMoneyIcon', 'Business'],
    ['LifestyleIcon', 'RestaurantIcon', 'Lifestyle'],
  ])('filters by category (%s)', (_name, iconTestId, category) => {
    renderPane(<ImageIconTab {...models()} />);

    fireEvent.click(categoryButton(iconTestId));

    expect(screen.getByText(new RegExp(`^${category} \\(\\d+ icons\\)$`))).toBeTruthy();
    expect(screen.queryByText(/^All \(/)).toBeNull();
  });

  it('shows the nine health icons in the Health category and returns to All', () => {
    renderPane(<ImageIconTab {...models()} />);

    fireEvent.click(categoryButton('MedicalServicesIcon'));
    expect(screen.getByText('Health (9 icons)')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'vaccines' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'coffee' })).toBeNull();

    fireEvent.click(categoryButton('AppsIcon'));
    expect(screen.getByText(`All (${PICKER_ICON_NAMES.length} icons)`)).toBeTruthy();
  });

  it('searches icon names and category names', () => {
    renderPane(<ImageIconTab {...models()} />);

    search('Coffee');
    expect(screen.getByText('1 icon found')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'coffee' })).toBeTruthy();

    search('health');
    expect(screen.getByText('9 icons found')).toBeTruthy();
  });

  it('searches within the selected category only', () => {
    renderPane(<ImageIconTab {...models()} />);

    fireEvent.click(categoryButton('MedicalServicesIcon'));
    search('coffee');

    expect(screen.getByText('No icons found matching your search')).toBeTruthy();
  });

  it('clears the search from its clear button', () => {
    renderPane(<ImageIconTab {...models()} />);

    const inSearchField = (): boolean =>
      screen.getAllByTestId('ClearIcon')[0].closest('.MuiInputAdornment-root') !== null;
    // No clear button until there is something to clear.
    expect(inSearchField()).toBe(false);
    search('zzzz');
    expect(screen.getByText('No icons found matching your search')).toBeTruthy();
    expect(inSearchField()).toBe(true);

    fireEvent.click(categoryButton('ClearIcon'));

    expect((screen.getByPlaceholderText('Search icons...') as HTMLInputElement).value).toBe('');
    expect(screen.getByText(`All (${PICKER_ICON_NAMES.length} icons)`)).toBeTruthy();
  });

  it('ignores clicks when neither model can be changed', () => {
    renderPane(
      <ImageIconTab
        iconModel={readOnlyProperty<string | undefined>(undefined)}
        emojiModel={readOnlyProperty<string | undefined>(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'coffee' }));
    expect(screen.getByRole('button', { name: 'coffee' })).toBeTruthy();
  });
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

  it('opens on the gallery and sets the picked icon', () => {
    const m = models();
    renderPane(<TopicImagePicker triggerClose={jest.fn()} {...m} />);

    expect(screen.getByRole('tab', { name: 'Icons Gallery' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'cake' }));

    expect(m.iconsGalleryModel.setValue).toHaveBeenCalledWith('cake');
    expect(m.emojiModel.setValue).toHaveBeenCalledWith(undefined);
  });

  it('sets an emoji from the emoji tab and clears the gallery icon, staying open', () => {
    const m = models();
    const triggerClose = jest.fn();
    renderPane(<TopicImagePicker triggerClose={triggerClose} {...m} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Emojis' }));
    expect(screen.queryByPlaceholderText('Search icons...')).toBeNull();
    const picker = screen.getByTestId('emoji-picker');
    expect(picker.getAttribute('data-theme')).toBe('light');
    expect(picker.getAttribute('data-placeholder')).toBe('Search emojis...');

    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(m.emojiModel.setValue).toHaveBeenCalledWith('🎉');
    expect(m.iconsGalleryModel.setValue).toHaveBeenCalledWith(undefined);
    expect(triggerClose).not.toHaveBeenCalled();
  });

  it('uses the dark emoji theme in dark mode', () => {
    renderPane(<TopicImagePicker triggerClose={jest.fn()} {...models()} />, 'dark');

    fireEvent.click(screen.getByRole('tab', { name: 'Emojis' }));

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

    fireEvent.click(screen.getByRole('tab', { name: 'Emojis' }));
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

describe('icon search typing', () => {
  it('takes 200 characters typed in one burst, as Cypress types them', async () => {
    renderPane(
      <ImageIconTab
        iconModel={property<string | undefined>(undefined)}
        emojiModel={property<string | undefined>(undefined)}
      />,
    );
    const field = screen.getByPlaceholderText('Search icons...') as HTMLInputElement;

    const errors = await typeInBurst(field);

    expect(errors).toEqual([]);
    expect(field.value).toBe(BURST_TEXT);
    // The search ran on the typed text: nothing matches it.
    expect(screen.getByText('No icons found matching your search')).toBeTruthy();
  });
});
