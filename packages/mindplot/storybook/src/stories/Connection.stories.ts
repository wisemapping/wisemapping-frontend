import { StoryFn, Meta } from '@storybook/html';
import createConnection, { TopicArgs } from './Connection';

export default {
  title: 'Mindplot/Connection',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    shapeType: {
      options: ['none', 'rectangle', 'rounded rectangle', 'elipse', 'line'],
      control: { type: 'select' },
    },
  },
} as Meta;

const Template: StoryFn<TopicArgs> = (args: TopicArgs) => createConnection(args);

export const Classic = Template.bind({});
Classic.args = {
  theme: 'classic',
};

export const Prism = Template.bind({});
Prism.args = {
  theme: 'prism',
};

export const DarkPrism = Template.bind({});
DarkPrism.args = {
  theme: 'prism',
};

export const robot = Template.bind({});
robot.args = {
  theme: 'robot',
};

export const sunrise = Template.bind({});
sunrise.args = {
  theme: 'sunrise',
};

export const ocean = Template.bind({});
ocean.args = {
  theme: 'ocean',
};
