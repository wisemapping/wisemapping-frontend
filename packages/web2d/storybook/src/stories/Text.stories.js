import { createText } from './Text';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Text',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    color: { control: 'color' },
    fontFamily: {
      control: { type: 'select' },
      options: ['Arial', 'Tahoma', 'Verdana', 'Times', 'Brush Script MT'],
    },
    weight: {
      control: { type: 'select' },
      options: ['normal', 'bold'],
    },
    style: {
      control: { type: 'select' },
      options: ['normal', 'italic', 'oblique', 'oblique 40deg;'],
    },
    text: {
      control: 'text',
    },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createText({ label, ...args });

export const Multiline = Template.bind({});
Multiline.args = {
  fontFamily: 'blue',
  text: 'This multine text.\nLine 1 :)\nLine2',
  weight: 'normal',
  color: 'red',
  style: 'normal',
};
