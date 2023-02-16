import { createArcLine } from './ArcLine';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/ArcLine',
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
const Template = ({ label, ...args }) => createArcLine({ label, ...args });

export const Width = Template.bind({});
Width.args = {
  strokeWidth: 3,
  strokeStyle: 'solid',
  strokeColor: 'blue',
};

export const Stroke = Template.bind({});
Stroke.args = {
  strokeWidth: 10,
  strokeStyle: 'longdash',
  strokeColor: 'red',
};
