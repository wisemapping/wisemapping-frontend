import { Story, Meta } from '@storybook/html';
import createTopic, { TopicArgs } from './Topic';

export default {
  title: 'Mindplot/TextEditor',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    borderColor: { control: 'color' },
    fontFamily: {
      options: ['Arial', 'Verdana'],
      control: { type: 'select' },
    },
    fontSize: { control: { type: 'number', min: 0, max: 20, step: 2 } },
    fontColor: { control: 'color' },
    shapeType: {
      options: ['rectangle', 'rounded rectangle', 'elipse', 'line'],
      control: { type: 'select' },
    },
    text: { control: 'text' },
    noteText: { control: 'text' },
    linkText: { control: 'text' },
    eicon: { control: 'multi-select', options: ['❤️', '🌈', '🖇️'] },
  },
} as Meta;

const Template: Story<TopicArgs> = (args: TopicArgs) => createTopic(args);

export const MultilineEditor = Template.bind({});
MultilineEditor.args = {
  text: 'Border Style',
  borderColor: '#52E661',
  readOnly: false,
};
