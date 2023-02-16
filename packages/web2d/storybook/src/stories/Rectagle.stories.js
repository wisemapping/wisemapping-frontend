import { createRectangle } from './Rectangle';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Rectangle',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    strokeColor: { control: 'color' },
    strokeStyle: {
      control: { type: 'select' },
      options: ['dash', 'dot', 'solid', 'longdash', 'dashdot'],
    },
    strokeWidth: {
      control: { type: 'select' },
      options: [0, 1, 2, 4, 5],
    },
    arc: {
      control: { type: 'select' },
      options: [0, 0.2, 0.5, 0.8, 1],
    },
    onClick: { action: 'onClick' },
    size: {
      control: { type: 'select' },
      options: ['{ "width": 50, "height": 50 }', '{ "width": 100, "height": 100 }', '{ "width": 50, "height": 100 }', '{ "width": 100, "height": 50 }'],
    },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createRectangle({ label, ...args });

export const Fill = Template.bind({});
Fill.args = {
  backgroundColor: 'yellow',
  size: '{ "width": 100, "height": 100 }',
  strokeWidth: 1,
  strokeStyle: 'solid',
  strokeColor: 'blue',
  arc: 0,
};

export const Stroke = Template.bind({});
Stroke.args = {
  backgroundColor: 'blue',
  size: '{ "width": 100, "height": 100 }',
  strokeWidth: 5,
  strokeStyle: 'dash',
  strokeColor: 'red',
  arc: 0,
};

export const Size = Template.bind({});
Size.args = {
  backgroundColor: 'red',
  size: '{ "width": 150, "height": 50 }',
  strokeWidth: 5,
  strokeStyle: 'solid',
  strokeColor: 'blue',
  arc: 0,
};

export const Arc = Template.bind({});
Arc.args = {
  backgroundColor: 'red',
  size: '{ "width": 100, "height": 100 }',
  strokeWidth: 5,
  strokeStyle: 'solid',
  strokeColor: 'blue',
  arc: 0.5,
};
