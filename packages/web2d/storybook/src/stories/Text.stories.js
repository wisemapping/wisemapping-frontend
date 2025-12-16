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
import { createText } from './Text';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Text',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    color: { control: 'color' },
    fontFamily: {
      control: { type: 'select' },
      options: ['Arial', 'Tahoma', 'Verdana', 'Times', 'Brush Script MT'],
    },
    weight: {
      control: { type: 'select' },
      options: ['normal', 'bold'],
    },
    style: {
      control: { type: 'select' },
      options: ['normal', 'italic', 'oblique', 'oblique 40deg;'],
    },
    text: {
      control: 'text',
    },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createText({ label, ...args });

export const Multiline = Template.bind({});
Multiline.args = {
  fontFamily: 'blue',
  text: 'This multine text.\nLine 1 :)\nLine2',
  weight: 'normal',
  color: 'red',
  style: 'normal',
};
