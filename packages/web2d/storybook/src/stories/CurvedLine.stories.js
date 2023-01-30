import { createCurvedLine } from './CurvedLine';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/CurvedLine',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    fillColor: { control: 'color' },
    width: { control: { type: 'number', min: 0, max: 100, step: 5 } },
    strokeColor: { control: 'color' },
    strokeStyle: {
      control: { type: 'select' },
      options: ['dash', 'dot', 'solid', 'longdash', 'dashdot'],
    },
    strokeWidth: { control: { type: 'number', min: 0, max: 30, step: 1 } },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createCurvedLine({ label, ...args });

export const Width = Template.bind({});
Width.args = {
  width: 10,
  strokeWidth: 1,
  strokeStyle: 'solid',
  strokeColor: 'blue',
  fillColor: 'red',
};

export const Stroke = Template.bind({});
Stroke.args = {
  width: 10,
  strokeWidth: 1,
  strokeStyle: 'longdash',
  strokeColor: 'red',
  fillColor: '#1212eb',
};

export const Fill = Template.bind({});
Fill.args = {
  width: 10,
  strokeWidth: 0,
  fillColor: 'red',
};
