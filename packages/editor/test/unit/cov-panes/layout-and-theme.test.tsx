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
import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { LayoutType, ThemeType } from '@wisemapping/mindplot';
import LayoutSelector from '../../../src/components/action-widget/pane/layout-selector';
import ThemeEditor from '../../../src/components/action-widget/pane/theme-editor';
import type Model from '../../../src/classes/model/editor';
import { property, readOnlyProperty, renderPane } from './helpers';

const fakeModel = () => {
  const save = jest.fn(() => Promise.resolve());
  return { model: { save } as unknown as Model, save };
};

describe('LayoutSelector', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    // Picking and applying a layout leaves no debug output behind.
    expect(console.log).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('saves the map and reloads the page when a different layout is accepted', async () => {
    // jsdom cannot navigate: it reports the reload attempt as a "not implemented" error.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const layoutModel = property<LayoutType>('mindmap');
    const closeModal = jest.fn();
    const { model, save } = fakeModel();
    renderPane(<LayoutSelector closeModal={closeModal} layoutModel={layoutModel} model={model} />);

    fireEvent.click(screen.getByText('Tree'));
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(layoutModel.setValue).toHaveBeenCalledWith('tree');
    await waitFor(() => expect(closeModal).toHaveBeenCalledTimes(1));
    // Saved (with history, to force it) before the page reloads.
    expect(save).toHaveBeenCalledWith(true);
    const reloadAttempt = consoleError.mock.calls.some((call) =>
      String((call[0] as Error)?.message ?? call[0]).includes('navigation'),
    );
    expect(reloadAttempt).toBe(true);
  });

  it('neither saves nor reloads when the layout did not change', async () => {
    const layoutModel = property<LayoutType>('tree');
    const closeModal = jest.fn();
    const { model, save } = fakeModel();
    renderPane(<LayoutSelector closeModal={closeModal} layoutModel={layoutModel} model={model} />);

    fireEvent.click(screen.getByText('Tree'));
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => expect(closeModal).toHaveBeenCalledTimes(1));
    expect(layoutModel.setValue).toHaveBeenCalledWith('tree');
    expect(save).not.toHaveBeenCalled();
  });

  it('defaults to the mindmap layout when none is set', async () => {
    const layoutModel = property<LayoutType>(undefined as unknown as LayoutType);
    const { model } = fakeModel();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPane(<LayoutSelector closeModal={jest.fn()} layoutModel={layoutModel} model={model} />);

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(layoutModel.setValue).toHaveBeenCalledWith('mindmap');
  });

  it('discards the choice on Cancel', () => {
    const layoutModel = property<LayoutType>('mindmap');
    const closeModal = jest.fn();
    const { model, save } = fakeModel();
    renderPane(<LayoutSelector closeModal={closeModal} layoutModel={layoutModel} model={model} />);

    fireEvent.click(screen.getByText('Tree'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(layoutModel.setValue).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('just closes when the layout cannot be changed', async () => {
    const closeModal = jest.fn();
    const { model, save } = fakeModel();
    renderPane(
      <LayoutSelector
        closeModal={closeModal}
        layoutModel={readOnlyProperty<LayoutType>('mindmap')}
        model={model}
      />,
    );

    fireEvent.click(screen.getByText('Tree'));
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => expect(closeModal).toHaveBeenCalledTimes(1));
    expect(save).not.toHaveBeenCalled();
  });

  it('closes like Cancel on Escape', () => {
    const layoutModel = property<LayoutType>('mindmap');
    const closeModal = jest.fn();
    renderPane(
      <LayoutSelector
        closeModal={closeModal}
        layoutModel={layoutModel}
        model={fakeModel().model}
      />,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(layoutModel.setValue).not.toHaveBeenCalled();
  });
});

describe('ThemeEditor', () => {
  const themes = ['Summer', 'Aurora', '80s Retro Night', 'Sunrise', 'Ocean', 'Classic', 'Robot'];

  it('lists every theme', () => {
    renderPane(<ThemeEditor closeModal={jest.fn()} themeModel={property<ThemeType>('classic')} />);

    for (const name of themes) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it.each([
    ['Summer', 'prism'],
    ['Aurora', 'aurora'],
    ['80s Retro Night', 'retro'],
    ['Sunrise', 'sunrise'],
    ['Ocean', 'ocean'],
    ['Robot', 'robot'],
  ])('applies the %s theme', (name, id) => {
    const themeModel = property<ThemeType>('classic');
    const closeModal = jest.fn();
    renderPane(<ThemeEditor closeModal={closeModal} themeModel={themeModel} />);

    fireEvent.click(screen.getByText(name));
    fireEvent.click(screen.getByRole('button', { name: 'Apply Theme' }));

    expect(themeModel.setValue).toHaveBeenCalledWith(id);
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('keeps the current theme when applied without picking another', () => {
    const themeModel = property<ThemeType>('ocean');
    renderPane(<ThemeEditor closeModal={jest.fn()} themeModel={themeModel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apply Theme' }));

    expect(themeModel.setValue).toHaveBeenCalledWith('ocean');
  });

  it('discards the choice on Cancel and on Escape', () => {
    const themeModel = property<ThemeType>('classic');
    const closeModal = jest.fn();
    renderPane(<ThemeEditor closeModal={closeModal} themeModel={themeModel} />);

    fireEvent.click(screen.getByText('Robot'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(closeModal).toHaveBeenCalledTimes(2);
    expect(themeModel.setValue).not.toHaveBeenCalled();
  });

  it('just closes when the theme cannot be changed', () => {
    const closeModal = jest.fn();
    renderPane(
      <ThemeEditor closeModal={closeModal} themeModel={readOnlyProperty<ThemeType>('classic')} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Apply Theme' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
