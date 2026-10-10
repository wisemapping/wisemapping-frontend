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
import TopicIconEditor from '../../../src/components/action-widget/pane/topic-icon-editor';
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

describe('TopicIconEditor', () => {
  it('sets the emoji picked as the topic icon', () => {
    const iconModel = property<string | undefined>(undefined);
    renderPane(<TopicIconEditor closeModal={jest.fn()} iconModel={iconModel} />);

    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(iconModel.setValue).toHaveBeenCalledWith('emoji:🎉');
  });

  it('offers emojis only: the old icon gallery is no longer a choice', () => {
    renderPane(
      <TopicIconEditor
        closeModal={jest.fn()}
        iconModel={property<string | undefined>(undefined)}
      />,
    );

    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByText('Icons Gallery')).toBeNull();
    expect(screen.queryByPlaceholderText('Search icons...')).toBeNull();
  });

  it('uses the dark emoji theme in dark mode', () => {
    renderPane(
      <TopicIconEditor closeModal={jest.fn()} iconModel={property<string | undefined>('x')} />,
      'dark',
    );

    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('dark');
  });

  it('ignores an emoji when the icon can not be changed', () => {
    renderPane(
      <TopicIconEditor
        closeModal={jest.fn()}
        iconModel={readOnlyProperty<string | undefined>(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(screen.getByTestId('emoji-picker')).toBeTruthy();
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
    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);
    expect(closeModal).toHaveBeenCalledTimes(1);

    unmount();
    expect(resume).toHaveBeenCalledTimes(1);
  });
});
