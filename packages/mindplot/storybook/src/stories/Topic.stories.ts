import createTopic from './Topic';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
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
};

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template = ({ ...args }) => createTopic({ ...args });

export const BoderderStyle = Template.bind({});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BoderderStyle.args = {
  text: 'Border Style',
  borderColor: 'red',
};

export const FontStyle = Template.bind({});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
FontStyle.args = {
  text: 'Font Style',
  fontColor: 'red',
  fontSize: 10,
  fontFamily: 'Fantasy',
};

export const BackgroundColor = Template.bind({});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BackgroundColor.args = {
  text: 'Background Color Style',
  backgroundColor: 'red',
};

export const NoteFeature = Template.bind({});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
NoteFeature.args = {
  text: 'Note Feature',
  noteText: 'This is great note\nwith two lines',
};

export const LinkFeature = Template.bind({});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
LinkFeature.args = {
  text: 'Link Feature',
  linkText: 'https://www.google.com/',
};

export const IconFeature = Template.bind({});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
IconFeature.args = {
  text: 'EIcon Feature\n with multi-line',
  eicon: ['❤️', '🌈', '🖇️'],
};
