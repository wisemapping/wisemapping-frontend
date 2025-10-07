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
import TopicStyleEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';

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
  switchValue = () => {
    console.log('switchValue called');
  };
}

const meta: Meta = {
  title: 'Editor/TopicStyleEditor',
  component: TopicStyleEditor as React.ComponentType,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof TopicStyleEditor>;

export const Default: Story = {
  render: () => {
    const shapeModel = new MockNodeProperty<TopicShapeType>('rounded rectangle');
    const fillColorModel = new MockNodeProperty<string | undefined>('#00ff00');
    const borderColorModel = new MockNodeProperty<string | undefined>('#0000ff');
    const borderStyleModel = new MockNodeProperty<StrokeStyle>(StrokeStyle.SOLID);
    const connectionStyleModel = new MockNodeProperty<LineType>(LineType.THICK_CURVED);
    const connectionColorModel = new MockNodeProperty<string | undefined>('#ff0000');

    return (
      <TopicStyleEditor
        closeModal={() => console.log('Close modal')}
        shapeModel={shapeModel}
        fillColorModel={fillColorModel}
        borderColorModel={borderColorModel}
        borderStyleModel={borderStyleModel}
        connectionStyleModel={connectionStyleModel}
        connectionColorModel={connectionColorModel}
      />
    );
  },
};
