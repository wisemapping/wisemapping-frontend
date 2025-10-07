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

import type { Meta, StoryObj } from '@storybook/react';
import RichTextNoteEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import React from 'react';

// Wrapper component to expose setValue as an action-trackable callback
const RichTextNoteEditorWithActions = (props: {
  closeModal: () => void;
  initialNote?: string;
  onNoteChange?: (note: string | undefined) => void;
}) => {
  const [note, setNote] = React.useState<string | undefined>(props.initialNote);

  const noteModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => note,
      setValue: (v: string | undefined) => {
        setNote(v);
        props.onNoteChange?.(v);
      },
    }),
    [note, props.onNoteChange],
  );

  return <RichTextNoteEditor closeModal={props.closeModal} noteModel={noteModel} />;
};

const meta: Meta<typeof RichTextNoteEditorWithActions> = {
  title: 'Editor/RichTextNoteEditor',
  component: RichTextNoteEditorWithActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onNoteChange: { action: 'onNoteChange' },
  },
};

export default meta;
type Story = StoryObj<typeof RichTextNoteEditorWithActions>;

export const Default: Story = {
  args: {
    initialNote: '',
  },
};

export const WithExistingNote: Story = {
  args: {
    initialNote: '<b>Important note:</b> This is a sample note with <i>rich text</i> formatting.',
  },
};
