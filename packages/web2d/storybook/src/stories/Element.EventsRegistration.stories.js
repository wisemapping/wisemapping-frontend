import { createEventRegistration } from './Element';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Element',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    enableForWorkspace: { control: 'boolean' },
    enableForInnerCircle: { control: 'boolean' },
    enableForOuterCircle: { control: 'boolean' },
    stopEventPropagation: { control: 'boolean' },
    onClick: { action: 'onClick' },
    onMouseOver: { action: 'onMouseOver' },
    onMouseOut: { action: 'onMouseOut' },
    onDblClick: { action: 'onDblClick' },
  },
};

export const EventsRegistration = (({ label, ...args }) => createEventRegistration({ label, ...args })).bind({});
EventsRegistration.args = {
  enableForWorkspace: false,
  enableForInnerCircle: false,
  enableForOuterCircle: false,
  stopEventPropagation: true,
};
