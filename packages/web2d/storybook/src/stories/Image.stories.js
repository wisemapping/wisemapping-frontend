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
import { createImage } from './Image';

export default {
  title: 'Shapes/Image',
  argTypes: {
    coordSize: { control: { type: 'number', min: 100, max: 800, step: 50 } },
  },
};

const Template = ({ label, ...args }) => createImage({ label, ...args });

export const Size = Template.bind({});
Size.args = {
  images: [
    [20, 20, 16, 16],
    [60, 20, 32, 32],
    [120, 20, 64, 64],
    [220, 20, 128, 128],
    [20, 200, 128, 64],
    [200, 200, 64, 128],
  ],
};

export const Position = Template.bind({});
Position.args = {
  images: [
    [0, 0, 50, 50],
    [175, 175, 50, 50],
    [350, 350, 50, 50],
    [350, 0, 50, 50],
    [0, 350, 50, 50],
  ],
};

// The same images in a workspace zoomed out by 2 (coordSize 800 on 400 px).
export const Zoomed = Template.bind({});
Zoomed.args = {
  coordSize: 800,
  images: [
    [0, 0, 100, 100],
    [350, 350, 100, 100],
    [700, 700, 100, 100],
  ],
};
