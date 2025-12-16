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
import { createStraightLine } from './StraightLine';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/StraightLine',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    strokeColor: { control: 'color' },
    strokeStyle: {
      control: { type: 'select' },
      options: ['dash', 'dot', 'solid', 'longdash', 'dashdot'],
    },
    strokeWidth: { control: { type: 'number', min: 0, max: 30, step: 1 } },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createStraightLine({ label, ...args });

export const StrokeColor = Template.bind({});
StrokeColor.args = {
  strokeWidth: 1,
  strokeStyle: 'solid',
  strokeColor: 'blue',
};

export const StrokeWidth = Template.bind({});
StrokeWidth.args = {
  strokeWidth: 4,
  strokeStyle: 'solid',
  strokeColor: 'red',
};
