import { createElement } from './Element';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Element',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    visibility: { control: 'boolean' },
    visibilityDelay: { control: { type: 'number', min: 1, max: 1000, step: 100 } },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createElement({ label, ...args });

export const Visibility = Template.bind({});
Visibility.args = {
  visibility: true,
  visibilityDelay: 5000,
};
