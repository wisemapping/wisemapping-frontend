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
import RelationshipStyleEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';

// Mock NodeProperty implementation
class MockNodeProperty<T> implements NodeProperty<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  getValue(): T {
    return this.value;
  }
  setValue = (v: T) => {
    this.value = v;
    console.log('setValue called with:', v);
  };
}

const meta: Meta = {
  title: 'Editor/RelationshipStyleEditor',
  component: RelationshipStyleEditor as React.ComponentType,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RelationshipStyleEditor>;

export const Default: Story = {
  render: () => {
    const strokeStyleModel = new MockNodeProperty<StrokeStyle>(StrokeStyle.SOLID);
    const startArrowModel = new MockNodeProperty<boolean>(false);
    const endArrowModel = new MockNodeProperty<boolean>(true);
    const colorModel = new MockNodeProperty<string | undefined>('#ff0000');

    return (
      <RelationshipStyleEditor
        closeModal={() => console.log('Close modal')}
        strokeStyleModel={strokeStyleModel}
        startArrowModel={startArrowModel}
        endArrowModel={endArrowModel}
        colorModel={colorModel}
      />
    );
  },
};
