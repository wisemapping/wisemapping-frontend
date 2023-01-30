import { createElement } from './Element';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Element',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    onClick: { action: 'onClick' },
    onMouseOver: { action: 'onMouseOver' },
    onMouseMove: { action: 'onMouseMove' },
    onMouseOut: { action: 'onMouseOut' },
    onDblClick: { action: 'onDblClick' },
  },
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
export const Events = (({ label, ...args }) => createElement({ label, ...args })).bind({});
Events.args = {
};

