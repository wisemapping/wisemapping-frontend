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
import TopicStyleEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import React from 'react';

// Wrapper component to expose all setValue calls as action-trackable callbacks
const TopicStyleEditorWithActions = (props: {
  closeModal: () => void;
  onShapeChange?: (shape: TopicShapeType | undefined) => void;
  onFillColorChange?: (color: string | undefined) => void;
  onBorderColorChange?: (color: string | undefined) => void;
  onBorderStyleChange?: (style: StrokeStyle | undefined) => void;
  onConnectionStyleChange?: (style: LineType | undefined) => void;
  onConnectionColorChange?: (color: string | undefined) => void;
}): React.ReactElement => {
  const [shape, setShape] = React.useState<TopicShapeType | undefined>('rounded rectangle');
  const [fillColor, setFillColor] = React.useState<string | undefined>('#00ff00');
  const [borderColor, setBorderColor] = React.useState<string | undefined>('#0000ff');
  const [borderStyle, setBorderStyle] = React.useState<StrokeStyle | undefined>(StrokeStyle.SOLID);
  const [connectionStyle, setConnectionStyle] = React.useState<LineType | undefined>(
    LineType.THICK_CURVED,
  );
  const [connectionColor, setConnectionColor] = React.useState<string | undefined>('#ff0000');

  const shapeModel: NodeProperty<TopicShapeType | undefined> = React.useMemo(
    () => ({
      getValue: () => shape,
      setValue: (v: TopicShapeType | undefined) => {
        setShape(v);
        props.onShapeChange?.(v);
      },
      switchValue: () => {},
    }),
    [shape, props.onShapeChange],
  );

  const fillColorModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => fillColor,
      setValue: (v: string | undefined) => {
        setFillColor(v);
        props.onFillColorChange?.(v);
      },
      switchValue: () => {},
    }),
    [fillColor, props.onFillColorChange],
  );

  const borderColorModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => borderColor,
      setValue: (v: string | undefined) => {
        setBorderColor(v);
        props.onBorderColorChange?.(v);
      },
      switchValue: () => {},
    }),
    [borderColor, props.onBorderColorChange],
  );

  const borderStyleModel: NodeProperty<StrokeStyle | undefined> = React.useMemo(
    () => ({
      getValue: () => borderStyle,
      setValue: (v: StrokeStyle | undefined) => {
        setBorderStyle(v);
        props.onBorderStyleChange?.(v);
      },
      switchValue: () => {},
    }),
    [borderStyle, props.onBorderStyleChange],
  );

  const connectionStyleModel: NodeProperty<LineType | undefined> = React.useMemo(
    () => ({
      getValue: () => connectionStyle,
      setValue: (v: LineType | undefined) => {
        setConnectionStyle(v);
        props.onConnectionStyleChange?.(v);
      },
      switchValue: () => {},
    }),
    [connectionStyle, props.onConnectionStyleChange],
  );

  const connectionColorModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => connectionColor,
      setValue: (v: string | undefined) => {
        setConnectionColor(v);
        props.onConnectionColorChange?.(v);
      },
      switchValue: () => {},
    }),
    [connectionColor, props.onConnectionColorChange],
  );

  return (
    <TopicStyleEditor
      closeModal={props.closeModal}
      shapeModel={shapeModel}
      fillColorModel={fillColorModel}
      borderColorModel={borderColorModel}
      borderStyleModel={borderStyleModel}
      connectionStyleModel={connectionStyleModel}
      connectionColorModel={connectionColorModel}
    />
  );
};

const meta: Meta<typeof TopicStyleEditorWithActions> = {
  title: 'Editor/TopicStyleEditor',
  component: TopicStyleEditorWithActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onShapeChange: { action: 'onShapeChange' },
    onFillColorChange: { action: 'onFillColorChange' },
    onBorderColorChange: { action: 'onBorderColorChange' },
    onBorderStyleChange: { action: 'onBorderStyleChange' },
    onConnectionStyleChange: { action: 'onConnectionStyleChange' },
    onConnectionColorChange: { action: 'onConnectionColorChange' },
  },
};

export default meta;
type Story = StoryObj<typeof TopicStyleEditorWithActions>;

export const Default: Story = {};
