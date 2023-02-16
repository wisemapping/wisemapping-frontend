import { createElement } from './Element';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Element',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    fillOpacity: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
    strokeOpacity: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ label, ...args }) => createElement({ label, ...args });

export const Opacity = Template.bind({});
Opacity.args = {
  fillOpacity: 0.5,
  strokeOpacity: 0.5,
  opacity: 1,
};
