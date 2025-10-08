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
import ColorPicker from './index';
import NodeProperty from '../../../../classes/model/node-property';
import React from 'react';

// Wrapper component to expose setValue as an action-trackable callback
const ColorPickerWithActions = (props: {
  closeModal: () => void;
  initialColor?: string;
  onColorChange?: (color: string | undefined) => void;
}): React.ReactElement => {
  const [color, setColor] = React.useState<string | undefined>(props.initialColor);

  const colorModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => color,
      setValue: (v: string | undefined) => {
        setColor(v);
        props.onColorChange?.(v);
      },
    }),
    [color, props.onColorChange],
  );

  return <ColorPicker closeModal={props.closeModal} colorModel={colorModel} />;
};

const meta: Meta<typeof ColorPickerWithActions> = {
  title: 'Editor/ColorPicker',
  component: ColorPickerWithActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onColorChange: { action: 'onColorChange' },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPickerWithActions>;

export const Default: Story = {
  args: {
    initialColor: undefined,
  },
};

export const WithSelectedColor: Story = {
  args: {
    initialColor: '#ff0000',
  },
};
