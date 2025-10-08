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
import TopicIconEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import React from 'react';

// Wrapper component to expose setValue as an action-trackable callback
const TopicIconEditorWithActions = (props: {
  closeModal: () => void;
  initialIcon?: string;
  onIconChange?: (icon: string | undefined) => void;
}): React.ReactElement => {
  const [icon, setIcon] = React.useState<string | undefined>(props.initialIcon);

  const iconModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => icon,
      setValue: (v: string | undefined) => {
        setIcon(v);
        props.onIconChange?.(v);
      },
    }),
    [icon, props.onIconChange],
  );

  return <TopicIconEditor closeModal={props.closeModal} iconModel={iconModel} />;
};

const meta: Meta<typeof TopicIconEditorWithActions> = {
  title: 'Editor/TopicIconEditor',
  component: TopicIconEditorWithActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onIconChange: { action: 'onIconChange' },
  },
};

export default meta;
type Story = StoryObj<typeof TopicIconEditorWithActions>;

export const Default: Story = {
  args: {
    initialIcon: undefined,
  },
};

export const WithEmoji: Story = {
  args: {
    initialIcon: 'emoji:😀',
  },
};

export const WithImage: Story = {
  args: {
    initialIcon: 'image:tag_blue',
  },
};
