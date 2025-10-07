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
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import RichTextNoteEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';

// Mock NodeProperty implementation with actions
class MockNodeProperty<T> implements NodeProperty<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }

  setValue = fn((v: T) => {
    this.value = v;
  });
}

const meta: Meta = {
  title: 'Editor/RichTextNoteEditor',
  component: RichTextNoteEditor as React.ComponentType,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RichTextNoteEditor>;

export const Default: Story = {
  render: () => {
    const noteModel = new MockNodeProperty<string | undefined>('');

    return <RichTextNoteEditor closeModal={fn()} noteModel={noteModel} />;
  },
};

export const WithExistingNote: Story = {
  render: () => {
    const noteModel = new MockNodeProperty<string | undefined>(
      '<b>Important note:</b> This is a sample note with <i>rich text</i> formatting.',
    );

    return <RichTextNoteEditor closeModal={fn()} noteModel={noteModel} />;
  },
};
