import { Story, Meta } from '@storybook/html';
import createTopic, { TopicArgs } from './Topic';

export default {
  title: 'Mindplot/Topic',
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

export const BorderStyle = Template.bind({});
BorderStyle.args = {
  text: 'Border Style',
  borderColor: '#52E661',
};

export const FontStyle = Template.bind({});
FontStyle.args = {
  text: 'Font Style',
  fontColor: 'red',
  fontSize: 10,
  fontFamily: 'Fantasy',
};

export const BackgroundColor = Template.bind({});
BackgroundColor.args = {
  text: 'Back Color Style',
  backgroundColor: '#52E661',
};

export const NoteFeature = Template.bind({});
NoteFeature.args = {
  text: 'Note Feature',
  noteText: 'This is great note\nwith two lines',
};

export const LinkFeature = Template.bind({});
LinkFeature.args = {
  text: 'Link Feature',
  linkText: 'https://www.google.com/',
};

export const IconFeature = Template.bind({});
IconFeature.args = {
  text: 'EIcon Feature\n with multi-line',
  eicon: ['❤️', '🌈', '🖇️'],
};

export const ShapeLine = Template.bind({});
ShapeLine.args = {
  text: 'Shape Line',
  shapeType: 'line',
  eicon: ['🖇️'],
};

export const ShapeEllipse = Template.bind({});
ShapeEllipse.args = {
  text: 'Shape Ellipse',
  eicon: ['🌈'],
  shapeType: 'elipse',
};
