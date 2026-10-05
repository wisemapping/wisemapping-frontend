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
import TopicLinkEditor from '../../../src/components/action-widget/pane/topic-link-editor';
import SaveAndDelete from '../../../src/components/action-widget/pane/save-and-delete';
import { property, readOnlyProperty, renderPane } from './helpers';

const pause = jest.fn();
const resume = jest.fn();
jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: {
    pause: () => pause(),
    resume: () => resume(),
  },
}));

beforeEach(() => {
  pause.mockClear();
  resume.mockClear();
});

const urlField = (): HTMLInputElement => screen.getByLabelText('URL') as HTMLInputElement;

const type = (value: string): void => {
  fireEvent.change(urlField(), { target: { value } });
};

describe('TopicLinkEditor', () => {
  it('saves a valid URL on Accept and closes', () => {
    const urlModel = property<string>('');
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={urlModel} />);

    type('https://www.wisemapping.com/c/maps');
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(urlModel.setValue).toHaveBeenCalledWith('https://www.wisemapping.com/c/maps');
  });

  it('saves on Enter', () => {
    const urlModel = property<string>('');
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={urlModel} />);

    type('example.org');
    fireEvent.keyDown(urlField(), { key: 'a' });
    expect(urlModel.setValue).not.toHaveBeenCalled();
    fireEvent.keyDown(urlField(), { key: 'Enter' });

    expect(urlModel.setValue).toHaveBeenCalledWith('example.org');
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('rejects an address that is not a URL and says so', () => {
    const urlModel = property<string>('');
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={urlModel} />);

    expect(screen.queryByText('Address is not valid')).toBeNull();
    type('not a url');

    expect(screen.getByText('Address is not valid')).toBeTruthy();
    expect(urlField().getAttribute('aria-invalid')).toBe('true');
    // The "open" shortcut is disabled and points nowhere.
    const open = screen.getByTestId('OpenInNewOutlinedIcon').closest('button') as HTMLButtonElement;
    expect(open.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    fireEvent.keyDown(urlField(), { key: 'Enter' });

    expect(urlModel.setValue).not.toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('accepts an empty field without complaint but does not save it', () => {
    const urlModel = property<string>('');
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={urlModel} />);

    expect(urlField().getAttribute('aria-invalid')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(urlModel.setValue).not.toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('shows the existing link with an open-in-new-tab shortcut', () => {
    renderPane(
      <TopicLinkEditor closeModal={jest.fn()} urlModel={property<string>('https://a.com')} />,
    );

    expect(urlField().value).toBe('https://a.com');
    const link = screen.getByTestId('OpenInNewOutlinedIcon').closest('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://a.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('removes the existing link with Delete', () => {
    const urlModel = property<string>('https://a.com');
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={urlModel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(urlModel.setValue).toHaveBeenCalledWith(undefined);
  });

  it('closes without saving from the close button', () => {
    const urlModel = property<string>('https://a.com');
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={urlModel} />);

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(urlModel.setValue).not.toHaveBeenCalled();
  });

  it('pauses the map shortcuts while the field has focus', () => {
    const { unmount } = renderPane(
      <TopicLinkEditor closeModal={jest.fn()} urlModel={property<string>('')} />,
    );

    // The field is auto-focused.
    expect(pause).toHaveBeenCalledTimes(1);
    fireEvent.blur(urlField());
    expect(resume).toHaveBeenCalledTimes(1);

    fireEvent.focus(urlField());
    expect(pause).toHaveBeenCalledTimes(2);
    unmount();
    expect(resume).toHaveBeenCalledTimes(2);
  });

  it('closes on a valid URL even when the link cannot be changed', () => {
    const closeModal = jest.fn();
    renderPane(<TopicLinkEditor closeModal={closeModal} urlModel={readOnlyProperty('a.com')} />);

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});

describe('SaveAndDelete', () => {
  it('offers Delete only for a non-blank value', () => {
    const { rerender } = renderPane(
      <SaveAndDelete
        model={property<string | undefined>('   ')}
        closeModal={jest.fn()}
        submitHandler={jest.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();

    rerender(
      <SaveAndDelete
        model={property<string | undefined>('x')}
        closeModal={jest.fn()}
        submitHandler={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
  });

  it('runs the submit handler on Accept', () => {
    const submitHandler = jest.fn();
    renderPane(
      <SaveAndDelete
        model={property<string | undefined>(undefined)}
        closeModal={jest.fn()}
        submitHandler={submitHandler}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(submitHandler).toHaveBeenCalledTimes(1);
  });

  it('closes on Delete even when the value cannot be changed', () => {
    const closeModal = jest.fn();
    renderPane(
      <SaveAndDelete
        model={readOnlyProperty<string | undefined>('x')}
        closeModal={closeModal}
        submitHandler={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
