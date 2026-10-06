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
import type { Meta, StoryFn } from '@storybook/html-vite';
import { createElement, type ElementArgs } from './Element';

// `opacity` is not read by createElement.
type OpacityArgs = ElementArgs & { opacity?: number };

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Element',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    fillOpacity: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
    strokeOpacity: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
  },
} satisfies Meta<OpacityArgs>;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template: StoryFn<OpacityArgs> = (args) => createElement(args);

export const Opacity = Template.bind({});
Opacity.args = {
  fillOpacity: 0.5,
  strokeOpacity: 0.5,
  opacity: 1,
};
