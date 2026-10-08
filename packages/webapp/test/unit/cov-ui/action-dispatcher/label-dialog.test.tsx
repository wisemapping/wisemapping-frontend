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
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import LabelDialog from '../../../../src/components/maps-page/action-dispatcher/label-dialog';
import AddLabelDialog from '../../../../src/components/maps-page/action-dispatcher/add-label-dialog';
import Client, { Label, LABEL_TITLE_MAX_LENGTH, MapInfo } from '../../../../src/classes/client';
import { renderWithProviders } from '../../helpers/render';
import { BURST_TEXT, typeInBurst } from '../../burst-typing';

const work: Label = { id: 1, title: 'Work', color: '#0565ff' };
const home: Label = { id: 2, title: 'Home', color: '#ff6600' };

const mapWith = (id: number, title: string, labels: Label[]): MapInfo => ({
  id,
  title,
  description: '',
  starred: false,
  labels,
  createdBy: '',
  creationTime: '',
  lastModificationBy: '',
  lastModificationTime: '',
  public: false,
  role: 'owner',
});

const maps = [
  mapWith(1, 'Alpha', [work]),
  mapWith(2, 'Beta', [work, home]),
  mapWith(3, 'Gamma', []),
];

const setup = (mapsId: number[]) => {
  const client = {
    fetchAllMaps: jest.fn(() => Promise.resolve(maps)),
    fetchLabels: jest.fn(() => Promise.resolve([work, home])),
    createLabel: jest.fn<Promise<number>, [string, string]>(() => Promise.resolve(50)),
    addLabelToMap: jest.fn<Promise<void>, [number, number]>(() => Promise.resolve()),
    deleteLabelFromMap: jest.fn<Promise<void>, [number, number]>(() => Promise.resolve()),
  };
  const onClose = jest.fn();
  renderWithProviders(<LabelDialog mapsId={mapsId} onClose={onClose} />, {
    client: client as unknown as Client,
  });
  return { client, onClose };
};

const labelCheckbox = (title: string): HTMLInputElement =>
  screen.getByRole('checkbox', { name: title }) as HTMLInputElement;

describe('LabelDialog', () => {
  test('names the single map being labelled and ticks the labels it has', async () => {
    setup([2]);

    expect(await screen.findByText(/Editing labels for/)).toBeTruthy();
    expect(screen.getByText(/Beta/)).toBeTruthy();
    await screen.findByRole('checkbox', { name: 'Work' });
    expect(labelCheckbox('Work').checked).toBe(true);
    expect(labelCheckbox('Home').checked).toBe(true);
  });

  test('with several maps, counts them and ticks only labels they all share', async () => {
    setup([1, 2]);

    expect(await screen.findByText(/2 maps/)).toBeTruthy();
    await screen.findByRole('checkbox', { name: 'Work' });
    expect(labelCheckbox('Work').checked).toBe(true);
    expect(labelCheckbox('Home').checked).toBe(false);
  });

  test('ticking a label adds it to the maps that do not have it yet', async () => {
    const { client } = setup([1, 2, 3]);
    await screen.findByRole('checkbox', { name: 'Home' });

    fireEvent.click(labelCheckbox('Home'));

    await waitFor(() => expect(client.addLabelToMap).toHaveBeenCalledTimes(2));
    expect(client.addLabelToMap).toHaveBeenCalledWith(2, 1);
    expect(client.addLabelToMap).toHaveBeenCalledWith(2, 3);
  });

  test('unticking a label removes it from the maps that have it', async () => {
    const { client } = setup([1, 2]);
    await screen.findByRole('checkbox', { name: 'Work' });

    fireEvent.click(labelCheckbox('Work'));

    await waitFor(() => expect(client.deleteLabelFromMap).toHaveBeenCalledTimes(2));
    expect(client.deleteLabelFromMap).toHaveBeenCalledWith(1, 1);
    expect(client.deleteLabelFromMap).toHaveBeenCalledWith(1, 2);
  });

  test('a new label is created and then added to the map', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { client } = setup([3]);
    await screen.findByText(/Gamma/);

    fireEvent.change(screen.getByRole('textbox', { name: 'Label title' }), {
      target: { value: 'Urgent' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add label' }));

    await waitFor(() => expect(client.createLabel).toHaveBeenCalledWith('Urgent', '#00b327'));
    await waitFor(() => expect(client.addLabelToMap).toHaveBeenCalledWith(50, 3));
  });

  test('takes 200 characters typed in one burst, as Cypress types them', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { client } = setup([3]);
    await screen.findByText(/Gamma/);
    const title = screen.getByRole('textbox', { name: 'Label title' }) as HTMLInputElement;

    expect(await typeInBurst(title)).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Add label' }));

    // The field stops at the 30 characters the backend accepts, as Cypress's typing does.
    await waitFor(() =>
      expect(client.createLabel).toHaveBeenCalledWith(BURST_TEXT.slice(0, 30), '#00b327'),
    );
  });

  test('shows the error when a label can not be changed', async () => {
    const { client } = setup([3]);
    client.addLabelToMap.mockRejectedValue({ msg: 'Label could not be added' });
    await screen.findByRole('checkbox', { name: 'Work' });

    fireEvent.click(labelCheckbox('Work'));

    expect(await screen.findByText('Label could not be added')).toBeTruthy();
  });

  test('close button closes the dialog', async () => {
    const { onClose } = setup([1]);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AddLabelDialog', () => {
  const COLORS = [
    '#00b327',
    '#0565ff',
    '#2d2dd6',
    '#6a00ba',
    '#ad1599',
    '#ff1e35',
    '#ff6600',
    '#ffff47',
  ];

  const setup = (random = 0) => {
    jest.spyOn(Math, 'random').mockReturnValue(random);
    const onAdd = jest.fn<void, [Label]>();
    const view = renderWithProviders(<AddLabelDialog onAdd={onAdd} />);
    const titleInput = screen.getByRole('textbox', { name: 'Label title' }) as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'Add label' }) as HTMLButtonElement;
    return { onAdd, titleInput, addButton, container: view.container };
  };

  test('the title takes no more characters than the backend accepts', () => {
    // LabelValidator refuses more than 30: a longer title failed after the field was cleared.
    const { titleInput } = setup();
    expect(titleInput.maxLength).toBe(LABEL_TITLE_MAX_LENGTH);
    expect(LABEL_TITLE_MAX_LENGTH).toBe(30);
  });

  test('a blank title can not be added, and the title is trimmed', () => {
    const { onAdd, titleInput, addButton } = setup(0);

    fireEvent.change(titleInput, { target: { value: '   ' } });
    expect(addButton.disabled).toBe(true);
    fireEvent.keyPress(titleInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.change(titleInput, { target: { value: '  Ideas ' } });
    fireEvent.click(addButton);
    expect(onAdd).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Ideas' }));
  });

  test('Add stays disabled until a title is typed', () => {
    const { titleInput, addButton } = setup();
    expect(addButton.disabled).toBe(true);

    fireEvent.change(titleInput, { target: { value: 'Ideas' } });

    expect(addButton.disabled).toBe(false);
  });

  test('adds the label with the current colour, then clears the title and moves to the next colour', () => {
    const { onAdd, titleInput, addButton } = setup(0);

    fireEvent.change(titleInput, { target: { value: 'Ideas' } });
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenLastCalledWith({ title: 'Ideas', color: COLORS[0], id: 0 });
    expect(titleInput.value).toBe('');

    fireEvent.change(titleInput, { target: { value: 'Later' } });
    fireEvent.click(addButton);
    expect(onAdd).toHaveBeenLastCalledWith({ title: 'Later', color: COLORS[1], id: 0 });
  });

  test('Enter in the title adds the label, but not while it is empty', () => {
    const { onAdd, titleInput } = setup(0);

    fireEvent.keyPress(titleInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.change(titleInput, { target: { value: 'Ideas' } });
    fireEvent.keyPress(titleInput, { key: 'a', code: 'KeyA', charCode: 97 });
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.keyPress(titleInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(onAdd).toHaveBeenCalledWith({ title: 'Ideas', color: COLORS[0], id: 0 });
  });

  test('clicking the colour swatch cycles through the colours, wrapping round', () => {
    // The last colour is picked first.
    const { onAdd, titleInput, addButton } = setup(0.99);

    fireEvent.click(screen.getByLabelText('Change label color'));
    fireEvent.change(titleInput, { target: { value: 'Ideas' } });
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledWith({ title: 'Ideas', color: COLORS[0], id: 0 });
  });

  test('picking a colour from the palette uses it for the next label', () => {
    const { onAdd, titleInput, addButton, container } = setup(0);
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips).toHaveLength(COLORS.length);

    fireEvent.click(chips[5]);
    fireEvent.change(titleInput, { target: { value: 'Ideas' } });
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledWith({ title: 'Ideas', color: COLORS[5], id: 0 });
    expect(within(container).getByRole('textbox', { name: 'Label title' })).toBeTruthy();
  });
});
