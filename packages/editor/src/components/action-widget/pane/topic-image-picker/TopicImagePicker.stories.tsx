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
import TopicImagePicker from './index';
import NodeProperty from '../../../../classes/model/node-property';

// Wrapper component to expose setValue as an action-trackable callback
const TopicImagePickerWithActions = (props: {
  triggerClose: () => void;
  initialEmoji?: string;
  initialIconsGallery?: string;
  onEmojiChange?: (emoji: string | undefined) => void;
  onIconsGalleryChange?: (icon: string | undefined) => void;
}): React.ReactElement => {
  const [emoji, setEmoji] = React.useState<string | undefined>(props.initialEmoji);
  const [iconsGallery, setIconsGallery] = React.useState<string | undefined>(
    props.initialIconsGallery,
  );

  const emojiModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => emoji,
      setValue: (v: string | undefined) => {
        setEmoji(v);
        props.onEmojiChange?.(v);
      },
    }),
    [emoji, props.onEmojiChange],
  );

  const iconsGalleryModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => iconsGallery,
      setValue: (v: string | undefined) => {
        setIconsGallery(v);
        props.onIconsGalleryChange?.(v);
      },
    }),
    [iconsGallery, props.onIconsGalleryChange],
  );

  return (
    <TopicImagePicker
      triggerClose={props.triggerClose}
      emojiModel={emojiModel}
      iconsGalleryModel={iconsGalleryModel}
    />
  );
};

const meta: Meta<typeof TopicImagePickerWithActions> = {
  title: 'Editor/TopicImagePicker',
  component: TopicImagePickerWithActions,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true },
  },
  argTypes: {
    triggerClose: { action: 'triggerClose' },
    onEmojiChange: { action: 'onEmojiChange' },
    onIconsGalleryChange: { action: 'onIconsGalleryChange' },
  },
};

export default meta;
type Story = StoryObj<typeof TopicImagePickerWithActions>;

export const Default: Story = {
  args: {
    initialEmoji: undefined,
    initialIconsGallery: undefined,
  },
};

export const WithEmoji: Story = {
  args: {
    initialEmoji: 'emoji:😀',
    initialIconsGallery: undefined,
  },
};

export const WithImage: Story = {
  args: {
    initialEmoji: undefined,
    initialIconsGallery: 'image:tag_blue',
  },
};
