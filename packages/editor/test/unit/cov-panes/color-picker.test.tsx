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
import ColorPicker from '../../../src/components/action-widget/pane/color-picker';
import colors from '../../../src/components/action-widget/pane/color-picker/colors.json';
import { property, readOnlyProperty, renderPane } from './helpers';

const colorButtons = (): HTMLElement[] =>
  screen.getAllByRole('button').filter((button) => button.tagName === 'BUTTON');

describe('ColorPicker', () => {
  it('sets the clicked colour and closes', () => {
    const colorModel = property<string | undefined>(undefined);
    const closeModal = jest.fn();
    renderPane(<ColorPicker closeModal={closeModal} colorModel={colorModel} />);

    fireEvent.click(screen.getByRole('button', { name: '#f1c232' }));

    expect(colorModel.setValue).toHaveBeenCalledWith('#f1c232');
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('offers a "Default color" choice that clears the colour', () => {
    const colorModel = property<string | undefined>('#f1c232');
    const closeModal = jest.fn();
    renderPane(<ColorPicker closeModal={closeModal} colorModel={colorModel} />);

    expect(screen.getByLabelText('Color')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Default color' }));

    expect(colorModel.setValue).toHaveBeenCalledWith(undefined);
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('gives the default choice the first palette slot', () => {
    renderPane(
      <ColorPicker closeModal={jest.fn()} colorModel={property<string | undefined>('')} />,
    );

    // The grid keeps its size: the default circle takes the place of the first swatch.
    expect(colorButtons()).toHaveLength(colors.length - 1);
    expect(screen.queryByRole('button', { name: colors[0] })).toBeNull();
  });

  it('shows the whole palette and no default choice when hideNoneOption is set', () => {
    renderPane(
      <ColorPicker
        closeModal={jest.fn()}
        colorModel={property<string | undefined>('#000000')}
        hideNoneOption
      />,
    );

    expect(screen.queryByRole('button', { name: 'Default color' })).toBeNull();
    expect(colorButtons()).toHaveLength(colors.length);
    expect(screen.getByRole('button', { name: colors[0] })).toBeTruthy();
  });

  it('still closes when the colour cannot be changed', () => {
    const closeModal = jest.fn();
    renderPane(
      <ColorPicker closeModal={closeModal} colorModel={readOnlyProperty<string | undefined>('')} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Default color' }));
    fireEvent.click(screen.getByRole('button', { name: '#f1c232' }));

    expect(closeModal).toHaveBeenCalledTimes(2);
  });
});
