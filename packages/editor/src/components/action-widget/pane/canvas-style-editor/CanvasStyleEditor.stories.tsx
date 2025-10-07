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
import CanvasStyleEditor, { CanvasStyle } from './index';

const meta: Meta = {
  title: 'Editor/CanvasStyleEditor',
  component: CanvasStyleEditor as React.ComponentType,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CanvasStyleEditor>;

export const Default: Story = {
  render: () => {
    const initialStyle: Partial<CanvasStyle> = {
      backgroundColor: '#f2f2f2',
      backgroundPattern: 'grid',
      gridSize: 50,
      gridColor: '#ebe9e7',
    };

    return (
      <CanvasStyleEditor
        closeModal={() => console.log('Close modal')}
        initialStyle={initialStyle}
        onStyleChange={(style) => console.log('Style changed:', style)}
      />
    );
  },
};

export const WithSolidBackground: Story = {
  render: () => {
    const initialStyle: Partial<CanvasStyle> = {
      backgroundColor: '#ffffff',
      backgroundPattern: 'solid',
      gridSize: 50,
      gridColor: '#cccccc',
    };

    return (
      <CanvasStyleEditor
        closeModal={() => console.log('Close modal')}
        initialStyle={initialStyle}
        onStyleChange={(style) => console.log('Style changed:', style)}
      />
    );
  },
};

export const WithDots: Story = {
  render: () => {
    const initialStyle: Partial<CanvasStyle> = {
      backgroundColor: '#f8f8f8',
      backgroundPattern: 'dots',
      gridSize: 25,
      gridColor: '#aaaaaa',
    };

    return (
      <CanvasStyleEditor
        closeModal={() => console.log('Close modal')}
        initialStyle={initialStyle}
        onStyleChange={(style) => console.log('Style changed:', style)}
      />
    );
  },
};
