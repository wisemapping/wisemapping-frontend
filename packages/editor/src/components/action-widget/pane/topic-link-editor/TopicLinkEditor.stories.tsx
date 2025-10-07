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
import TopicLinkEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import React from 'react';

// Wrapper component to expose setValue as an action-trackable callback
const TopicLinkEditorWithActions = (props: {
  closeModal: () => void;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
}) => {
  const [url, setUrl] = React.useState<string>(props.initialUrl || '');

  const urlModel: NodeProperty<string> = React.useMemo(
    () => ({
      getValue: () => url,
      setValue: (v: string) => {
        setUrl(v);
        props.onUrlChange?.(v);
      },
    }),
    [url, props.onUrlChange],
  );

  return <TopicLinkEditor closeModal={props.closeModal} urlModel={urlModel} />;
};

const meta: Meta<typeof TopicLinkEditorWithActions> = {
  title: 'Editor/TopicLinkEditor',
  component: TopicLinkEditorWithActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onUrlChange: { action: 'onUrlChange' },
  },
};

export default meta;
type Story = StoryObj<typeof TopicLinkEditorWithActions>;

export const Default: Story = {
  args: {
    initialUrl: '',
  },
};

export const WithExistingURL: Story = {
  args: {
    initialUrl: 'https://www.wisemapping.com',
  },
};
