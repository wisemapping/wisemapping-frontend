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
import CanvasStyleEditor, { CanvasStyle } from './index';

const meta: Meta<typeof CanvasStyleEditor> = {
  title: 'Editor/CanvasStyleEditor',
  component: CanvasStyleEditor,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    closeModal: { action: 'closeModal' },
    onStyleChange: { action: 'onStyleChange' },
  },
};

export default meta;
type Story = StoryObj<typeof CanvasStyleEditor>;

export const Default: Story = {
  args: {
    initialStyle: {
      backgroundColor: '#f2f2f2',
      backgroundPattern: 'grid',
      gridSize: 50,
      gridColor: '#ebe9e7',
    } as Partial<CanvasStyle>,
  },
};

export const WithSolidBackground: Story = {
  args: {
    initialStyle: {
      backgroundColor: '#ffffff',
      backgroundPattern: 'solid',
      gridSize: 50,
      gridColor: '#cccccc',
    } as Partial<CanvasStyle>,
  },
};

export const WithDots: Story = {
  args: {
    initialStyle: {
      backgroundColor: '#f8f8f8',
      backgroundPattern: 'dots',
      gridSize: 25,
      gridColor: '#aaaaaa',
    } as Partial<CanvasStyle>,
  },
};
