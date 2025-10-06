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

// Minimal NodeProperty stub for Storybook
class SimpleNodeProperty<T> implements NodeProperty<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  getValue(): T {
    return this.value;
  }
  setValue = (v: T) => {
    this.value = v;
  };
}

const meta: Meta = {
  title: 'Editor/TopicImagePicker',
  component: TopicImagePicker as React.ComponentType,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TopicImagePicker>;

export const Default: Story = {
  render: () => {
    const emojiModel = new SimpleNodeProperty<string | undefined>(undefined);
    const iconsGalleryModel = new SimpleNodeProperty<string | undefined>(undefined);
    return (
      <TopicImagePicker
        triggerClose={() => {}}
        emojiModel={emojiModel}
        iconsGalleryModel={iconsGalleryModel}
      />
    );
  },
};
