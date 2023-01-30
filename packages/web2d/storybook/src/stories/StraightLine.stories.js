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
