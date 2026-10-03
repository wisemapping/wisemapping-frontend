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
import { render, screen, fireEvent } from '@testing-library/react';
import type { Designer, Topic } from '@wisemapping/mindplot';

const pause = jest.fn();
const resume = jest.fn();
jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: {
    pause: () => pause(),
    resume: () => resume(),
  },
}));

// react-intl ships ESM only and this package's jest config does not transform
// node_modules, so the panel's transitive imports need a stand-in.
jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage ?? '',
  }),
  FormattedMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage ?? null,
}));

import FindInMapPanel from '../../../src/components/action-widget/pane/find-in-map';

const topic = (id: number, text: string, children: Topic[] = []): Topic =>
  ({
    getId: () => id,
    getText: () => text,
    getModel: () => ({ getPlainText: () => text }),
    getChildren: () => children,
  }) as unknown as Topic;

type Harness = {
  designer: Designer;
  closeModal: jest.Mock;
  revealNode: jest.Mock;
};

const harness = (): Harness => {
  const revealNode = jest.fn();
  const central = topic(1, 'Central', [topic(2, 'Alpha node'), topic(3, 'Beta node')]);

  return {
    closeModal: jest.fn(),
    revealNode,
    designer: {
      getModel: () => ({
        getCentralTopic: () => central,
        findTopicById: (id: number) => topic(id, `topic ${id}`),
      }),
      revealNode,
    } as unknown as Designer,
  };
};

const search = (term: string): void => {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: term } });
};

describe('FindInMapPanel results', () => {
  beforeEach(() => {
    pause.mockClear();
    resume.mockClear();
  });

  it('closes the panel when a result is clicked', () => {
    const { designer, closeModal, revealNode } = harness();
    render(<FindInMapPanel designer={designer} closeModal={closeModal} />);

    search('node');
    expect(closeModal).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Beta', { exact: false }));

    expect(revealNode).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('reveals the clicked node, not merely the first match', () => {
    const { designer, closeModal, revealNode } = harness();
    render(<FindInMapPanel designer={designer} closeModal={closeModal} />);

    search('node');
    revealNode.mockClear();

    fireEvent.click(screen.getByText('Beta', { exact: false }));

    expect(revealNode).toHaveBeenCalledTimes(1);
    expect(revealNode.mock.calls[0][0].getId()).toBe(3);
  });

  it('keeps the panel open while navigating with the next/previous buttons', () => {
    const { designer, closeModal } = harness();
    render(<FindInMapPanel designer={designer} closeModal={closeModal} />);

    search('node');
    fireEvent.click(screen.getByLabelText('Next match'));
    fireEvent.click(screen.getByLabelText('Previous match'));

    expect(closeModal).not.toHaveBeenCalled();
  });

  it('hands the map keyboard back when it unmounts', () => {
    const { designer, closeModal } = harness();
    const { unmount } = render(<FindInMapPanel designer={designer} closeModal={closeModal} />);

    expect(pause).toHaveBeenCalledTimes(1);
    unmount();
    expect(resume).toHaveBeenCalledTimes(1);
  });
});
