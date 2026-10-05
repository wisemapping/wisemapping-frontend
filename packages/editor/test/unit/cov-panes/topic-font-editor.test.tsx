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
import { act, fireEvent, screen, within } from '@testing-library/react';
import TopicFontEditor from '../../../src/components/action-widget/pane/topic-font-editor';
import { SwitchValueDirection } from '../../../src/classes/model/value-stepper';
import type Editor from '../../../src/classes/model/editor';
import { FakeProperty, property, readOnlyProperty, renderPane } from './helpers';

type Models = {
  fontFamilyModel: FakeProperty<string | undefined>;
  fontSizeModel: FakeProperty<number>;
  fontWeightModel: FakeProperty<string | undefined>;
  fontStyleModel: FakeProperty<string>;
  fontColorModel: FakeProperty<string | undefined>;
};

const models = (overrides: Partial<Models> = {}): Models => ({
  fontFamilyModel: property<string | undefined>(undefined),
  fontSizeModel: property<number>(10),
  fontWeightModel: property<string | undefined>('normal'),
  fontStyleModel: property<string>('normal'),
  fontColorModel: property<string | undefined>(undefined),
  ...overrides,
});

/** A designer that records its listeners so a test can fire them. */
const fakeEditor = (loaded = true) => {
  const listeners = new Map<string, () => void>();
  const designer = {
    addEvent: jest.fn((name: string, handler: () => void) => listeners.set(name, handler)),
    removeEvent: jest.fn((name: string) => listeners.delete(name)),
  };
  const editor = {
    isMapLoadded: () => loaded,
    getDesigner: () => designer,
  } as unknown as Editor;
  return { editor, designer, listeners };
};

const pickFont = (label: string): void => {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(within(screen.getByRole('listbox')).getByText(label));
};

describe('TopicFontEditor', () => {
  it('sets the font family picked from the list', () => {
    const m = models();
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />);

    expect(screen.getByRole('combobox').textContent).toContain('Default');
    pickFont('Georgia');

    expect(m.fontFamilyModel.setValue).toHaveBeenCalledWith('Georgia');
  });

  it('goes back to the theme font when the default entry is picked', () => {
    const m = models({ fontFamilyModel: property<string | undefined>('Verdana') });
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    // With a font set, the empty entry reads "Mixed".
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Mixed'));

    expect(m.fontFamilyModel.setValue).toHaveBeenCalledWith(undefined);
  });

  it('steps the font size up and down', () => {
    const m = models();
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bigger' }));
    fireEvent.click(screen.getByRole('button', { name: 'Smaller' }));

    expect(m.fontSizeModel.switchValue.mock.calls).toEqual([
      [SwitchValueDirection.up],
      [SwitchValueDirection.down],
    ]);
  });

  it('toggles bold and italic', () => {
    const m = models();
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    fireEvent.click(screen.getByRole('button', { name: 'Italic' }));

    expect(m.fontWeightModel.switchValue).toHaveBeenCalledTimes(1);
    expect(m.fontStyleModel.switchValue).toHaveBeenCalledTimes(1);
  });

  it('marks bold and italic as active when the topic has them', () => {
    const m = models({
      fontWeightModel: property<string | undefined>('bold'),
      fontStyleModel: property<string>('italic'),
    });
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />);

    expect(screen.getByRole('button', { name: 'Bold (active)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Italic (active)' })).toBeTruthy();
  });

  it('sets the font colour from the embedded palette', () => {
    const m = models();
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />, 'dark');

    // The font palette has no "default" swatch: resetting is done with its own button.
    expect(screen.queryByRole('button', { name: 'Default color' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '#ff0000' }));

    expect(m.fontColorModel.setValue).toHaveBeenCalledWith('#ff0000');
  });

  it('offers a reset only when the font or its colour was customised', () => {
    const { unmount } = renderPane(<TopicFontEditor closeModal={jest.fn()} {...models()} />);
    expect(screen.queryByRole('button', { name: 'Reset to Default' })).toBeNull();
    unmount();

    const m = models({ fontColorModel: property<string | undefined>('#ff0000') });
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...m} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset to Default' }));

    expect(m.fontFamilyModel.setValue).toHaveBeenCalledWith(undefined);
    expect(m.fontColorModel.setValue).toHaveBeenCalledWith(undefined);
  });

  it('closes from the close button', () => {
    const closeModal = jest.fn();
    renderPane(<TopicFontEditor closeModal={closeModal} {...models()} />);

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('does nothing on models that cannot be changed', () => {
    renderPane(
      <TopicFontEditor
        closeModal={jest.fn()}
        fontFamilyModel={readOnlyProperty<string | undefined>('Arial')}
        fontSizeModel={readOnlyProperty(10)}
        fontWeightModel={readOnlyProperty<string | undefined>(undefined)}
        fontStyleModel={readOnlyProperty('normal')}
        fontColorModel={readOnlyProperty<string | undefined>(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bigger' }));
    fireEvent.click(screen.getByRole('button', { name: 'Smaller' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset to Default' }));
    pickFont('Georgia');

    expect(screen.getByRole('combobox').textContent).toContain('Arial');
  });

  it('follows selection and model changes reported by the designer', () => {
    let weight: string | undefined = 'normal';
    let style = 'normal';
    let family: string | undefined = undefined;
    const m = models();
    m.fontWeightModel.getValue.mockImplementation(() => weight);
    m.fontStyleModel.getValue.mockImplementation(() => style);
    m.fontFamilyModel.getValue.mockImplementation(() => family);
    const { editor, designer, listeners } = fakeEditor();

    const { unmount } = renderPane(
      <TopicFontEditor closeModal={jest.fn()} {...m} model={editor} />,
    );
    expect([...listeners.keys()].sort()).toEqual(['modelUpdate', 'onblur', 'onfocus']);

    weight = 'bold';
    style = 'italic';
    family = 'Tahoma';
    act(() => listeners.get('modelUpdate')?.());

    expect(screen.getByRole('button', { name: 'Bold (active)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Italic (active)' })).toBeTruthy();
    expect(screen.getByRole('combobox').textContent).toContain('Tahoma');

    unmount();
    expect(designer.removeEvent).toHaveBeenCalledTimes(3);
    expect(listeners.size).toBe(0);
  });

  it('does not listen to the designer before the map has loaded', () => {
    const { editor, designer } = fakeEditor(false);
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...models()} model={editor} />);

    expect(designer.addEvent).not.toHaveBeenCalled();
  });

  it('copes with an editor that has no designer yet', () => {
    const editor = { isMapLoadded: () => true, getDesigner: () => undefined } as unknown as Editor;
    renderPane(<TopicFontEditor closeModal={jest.fn()} {...models()} model={editor} />);

    expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
  });
});
