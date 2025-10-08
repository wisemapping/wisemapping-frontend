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
import TopicFontEditor from './index';
import NodeProperty from '../../../../classes/model/node-property';
import { SwitchValueDirection } from '../../../toolbar/ToolbarValueModelBuilder';
import React from 'react';

// Wrapper component to expose all setValue and switchValue calls as action-trackable callbacks
const TopicFontEditorWithActions = (props: {
  closeModal: () => void;
  onFontFamilyChange?: (family: string | undefined) => void;
  onFontSizeSwitch?: (direction?: SwitchValueDirection) => void;
  onFontWeightSwitch?: () => void;
  onFontStyleSwitch?: () => void;
  onFontColorChange?: (color: string | undefined) => void;
}): React.ReactElement => {
  const [fontFamily, setFontFamily] = React.useState<string | undefined>('Arial');
  const [fontSize, setFontSize] = React.useState<number>(12);
  const [fontWeight, setFontWeight] = React.useState<string | undefined>('normal');
  const [fontStyle, setFontStyle] = React.useState<string>('normal');
  const [fontColor, setFontColor] = React.useState<string | undefined>('#000000');

  const fontFamilyModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => fontFamily,
      setValue: (v: string | undefined) => {
        setFontFamily(v);
        props.onFontFamilyChange?.(v);
      },
      switchValue: () => {},
    }),
    [fontFamily, props.onFontFamilyChange],
  );

  const fontSizeModel: NodeProperty<number> = React.useMemo(
    () => ({
      getValue: () => fontSize,
      setValue: (v: number) => {
        setFontSize(v);
      },
      switchValue: (direction?: SwitchValueDirection) => {
        const newSize = direction === SwitchValueDirection.up ? fontSize + 1 : fontSize - 1;
        setFontSize(newSize);
        props.onFontSizeSwitch?.(direction);
      },
    }),
    [fontSize, props.onFontSizeSwitch],
  );

  const fontWeightModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => fontWeight,
      setValue: (v: string | undefined) => {
        setFontWeight(v);
      },
      switchValue: () => {
        const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
        setFontWeight(newWeight);
        props.onFontWeightSwitch?.();
      },
    }),
    [fontWeight, props.onFontWeightSwitch],
  );

  const fontStyleModel: NodeProperty<string> = React.useMemo(
    () => ({
      getValue: () => fontStyle,
      setValue: (v: string) => {
        setFontStyle(v);
      },
      switchValue: () => {
        const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
        setFontStyle(newStyle);
        props.onFontStyleSwitch?.();
      },
    }),
    [fontStyle, props.onFontStyleSwitch],
  );

  const fontColorModel: NodeProperty<string | undefined> = React.useMemo(
    () => ({
      getValue: () => fontColor,
      setValue: (v: string | undefined) => {
        setFontColor(v);
        props.onFontColorChange?.(v);
      },
      switchValue: () => {},
    }),
    [fontColor, props.onFontColorChange],
  );

  return (
    <TopicFontEditor
      closeModal={props.closeModal}
      fontFamilyModel={fontFamilyModel}
      fontSizeModel={fontSizeModel}
      fontWeightModel={fontWeightModel}
      fontStyleModel={fontStyleModel}
      fontColorModel={fontColorModel}
    />
  );
};

const meta: Meta<typeof TopicFontEditorWithActions> = {
  title: 'Editor/TopicFontEditor',
  component: TopicFontEditorWithActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onFontFamilyChange: { action: 'onFontFamilyChange' },
    onFontSizeSwitch: { action: 'onFontSizeSwitch' },
    onFontWeightSwitch: { action: 'onFontWeightSwitch' },
    onFontStyleSwitch: { action: 'onFontStyleSwitch' },
    onFontColorChange: { action: 'onFontColorChange' },
  },
};

export default meta;
type Story = StoryObj<typeof TopicFontEditorWithActions>;

export const Default: Story = {};
