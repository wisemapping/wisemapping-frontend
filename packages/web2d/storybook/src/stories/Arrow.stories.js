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
import { createArrow } from './Arrow';

export default {
  title: 'Shapes/Arrow',
  argTypes: {
    strokeColor: { control: 'color' },
    strokeWidth: { control: { type: 'number', min: 1, max: 10, step: 1 } },
    dashed: { control: 'boolean' },
  },
};

const Template = ({ label, ...args }) => createArrow({ label, ...args });

export const Default = Template.bind({});
Default.args = {
  strokeColor: 'black',
  strokeWidth: 1,
  dashed: false,
};

export const Thick = Template.bind({});
Thick.args = {
  strokeColor: '#3366cc',
  strokeWidth: 5,
  dashed: false,
};

// W-ARROWDASH (fixed): setDashed(true, 3, 3) writes stroke-dasharray "3,3".
export const Dashed = Template.bind({});
Dashed.args = {
  strokeColor: 'red',
  strokeWidth: 2,
  dashed: true,
};
