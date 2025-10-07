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
import { fn } from '@storybook/test';
import TopicStyleEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';

// Mock NodeProperty implementation with actions
class MockNodeProperty<T> implements NodeProperty<T> {
  private value: T;
  public setValue: (v: T) => void;
  public switchValue: () => void;

  constructor(value: T, name: string) {
    this.value = value;
    this.setValue = fn((v: T) => {
      this.value = v;
    }).mockName(`${name}.setValue`);
    this.switchValue = fn(() => {
      // Switch value logic
    }).mockName(`${name}.switchValue`);
  }

  getValue(): T {
    return this.value;
  }
}

// Create shared mock instances outside render to ensure actions are tracked
const shapeModel = new MockNodeProperty<TopicShapeType>('rounded rectangle', 'shapeModel');
const fillColorModel = new MockNodeProperty<string | undefined>('#00ff00', 'fillColorModel');
const borderColorModel = new MockNodeProperty<string | undefined>('#0000ff', 'borderColorModel');
const borderStyleModel = new MockNodeProperty<StrokeStyle>(StrokeStyle.SOLID, 'borderStyleModel');
const connectionStyleModel = new MockNodeProperty<LineType>(
  LineType.THICK_CURVED,
  'connectionStyleModel',
);
const connectionColorModel = new MockNodeProperty<string | undefined>(
  '#ff0000',
  'connectionColorModel',
);
const closeModalAction = fn().mockName('closeModal');

const meta: Meta<typeof TopicStyleEditor> = {
  title: 'Editor/TopicStyleEditor',
  component: TopicStyleEditor,
  parameters: {
    layout: 'centered',
    actions: { disable: false }, // Ensure actions are enabled
  },
  args: {
    closeModal: closeModalAction,
    shapeModel,
    fillColorModel,
    borderColorModel,
    borderStyleModel,
    connectionStyleModel,
    connectionColorModel,
  },
};

export default meta;
type Story = StoryObj<typeof TopicStyleEditor>;

export const Default: Story = {};
