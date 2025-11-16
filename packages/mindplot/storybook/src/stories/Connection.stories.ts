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
import createConnection, { TopicArgs } from './Connection';

export default {
  title: 'Mindplot/Connection',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    shapeType: {
      options: ['none', 'rectangle', 'rounded rectangle', 'elipse', 'line'],
      control: { type: 'select' },
    },
  },
} as Meta;

const Template: StoryFn<TopicArgs> = (args: TopicArgs) => createConnection(args);

export const Classic = Template.bind({});
Classic.args = {
  theme: 'classic',
};

export const Prism = Template.bind({});
Prism.args = {
  theme: 'prism',
};

export const DarkPrism = Template.bind({});
DarkPrism.args = {
  theme: 'prism',
};

export const robot = Template.bind({});
robot.args = {
  theme: 'robot',
};

export const sunrise = Template.bind({});
sunrise.args = {
  theme: 'sunrise',
};

export const ocean = Template.bind({});
ocean.args = {
  theme: 'ocean',
};

export const aurora = Template.bind({});
aurora.args = {
  theme: 'aurora',
};

export const retro = Template.bind({});
retro.args = {
  theme: 'retro',
};
