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
import { createNeuronLine } from './NeuronLine';

export default {
  title: 'Shapes/NeuronLine',
  argTypes: {
    strokeColor: { control: 'color' },
    strokeStyle: {
      control: { type: 'select' },
      options: ['dash', 'dot', 'solid', 'longdash', 'dashdot'],
    },
    strokeWidth: { control: { type: 'number', min: 1, max: 10, step: 1 } },
  },
};

const Template = ({ label, ...args }) => createNeuronLine({ label, ...args });

export const Default = Template.bind({});
Default.args = {
  strokeWidth: 3,
  strokeStyle: 'solid',
  strokeColor: '#335577',
};

export const Thin = Template.bind({});
Thin.args = {
  strokeWidth: 1,
  strokeStyle: 'solid',
  strokeColor: '#335577',
};

export const Thick = Template.bind({});
Thick.args = {
  strokeWidth: 6,
  strokeStyle: 'solid',
  strokeColor: '#335577',
};

export const Dashed = Template.bind({});
Dashed.args = {
  strokeWidth: 3,
  strokeStyle: 'dash',
  strokeColor: '#cc3333',
};
