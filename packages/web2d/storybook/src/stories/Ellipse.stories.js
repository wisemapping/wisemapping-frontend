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
import { createEllipse } from './Ellipse';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Ellipse',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    strokeColor: { control: 'color' },
    strokeStyle: {
      control: { type: 'select' },
      options: ['dash', 'dot', 'solid', 'longdash', 'dashdot'],
    },
    strokeWidth: {
      control: { type: 'select' },
      options: [0, 1, 2, 4, 5],
    },
    arc: {
      control: { type: 'select' },
      options: [0, 0.2, 0.5, 0.8, 1],
    },
    onClick: { action: 'onClick' },
    size: {
      control: { type: 'select' },
      options: [
        '{ "width": 50, "height": 50 }',
        '{ "width": 100, "height": 100 }',
        '{ "width": 50, "height": 100 }',
        '{ "width": 100, "height": 50 }',
      ],
    },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createEllipse({ label, ...args });

export const Fill = Template.bind({});
Fill.args = {
  backgroundColor: 'yellow',
  size: '{ "width": 100, "height": 100 }',
  strokeWidth: 1,
  strokeStyle: 'solid',
  strokeColor: 'blue',
};

export const Stroke = Template.bind({});
Stroke.args = {
  backgroundColor: 'blue',
  size: '{ "width": 100, "height": 100 }',
  strokeWidth: 5,
  strokeStyle: 'dash',
  strokeColor: 'red',
};

export const Size = Template.bind({});
Size.args = {
  backgroundColor: 'red',
  size: '{ "width": 150, "height": 50 }',
  strokeWidth: 5,
  strokeStyle: 'solid',
  strokeColor: 'blue',
};
