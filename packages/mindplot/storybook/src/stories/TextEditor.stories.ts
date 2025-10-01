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

import { StoryFn, Meta } from '@storybook/html';
import createTopic, { TopicArgs } from './Topic';

export default {
  title: 'Mindplot/TextEditor',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    fontFamily: {
      options: ['Arial', 'Verdana'],
      control: { type: 'select' },
    },
    fontSize: { control: { type: 'number', min: 0, max: 20, step: 2 } },
    fontColor: { control: 'color' },
    shapeType: {
      options: ['rectangle', 'rounded rectangle', 'elipse', 'line'],
      control: { type: 'select' },
    },
    text: { control: 'text' },
    noteText: { control: 'text' },
    linkText: { control: 'text' },
    eicon: { control: 'multi-select', options: ['❤️', '🌈', '🖇️'] },
  },
} as Meta;

const Template: StoryFn<TopicArgs> = (args: TopicArgs) => createTopic(args);

export const MultilineEditor = Template.bind({});
MultilineEditor.args = {
  text: 'Border Style',
  borderColor: '#52E661',
  readOnly: false,
};
