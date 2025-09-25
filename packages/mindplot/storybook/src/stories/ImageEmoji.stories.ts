import { StoryFn, Meta } from '@storybook/html';
import createImageEmoji, { ImageEmojiArgs } from './ImageEmoji';

export default {
  title: 'Mindplot/ImageEmoji',
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
      options: ['none', 'rectangle', 'rounded rectangle', 'elipse', 'line'],
      control: { type: 'select' },
    },
    text: { control: 'text' },
    emojiChar: {
      control: 'text',
      description: 'Emoji character to display (e.g., 😀, 🎉, ❤️)',
    },
    theme: { control: 'select', options: ['classic', 'prism', 'dark-prism'] },
  },
} as Meta;

const Template: StoryFn<ImageEmojiArgs> = (args: ImageEmojiArgs) => createImageEmoji(args);

// Default story
export const Default = Template.bind({});
Default.args = {
  text: 'Happy Topic',
  emojiChar: '😀',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  fontColor: '#000000',
  fontSize: 14,
  fontFamily: 'Arial',
  shapeType: 'rounded rectangle',
  theme: 'classic',
};

// Story with different emoji
export const WithHeartEmoji = Template.bind({});
WithHeartEmoji.args = {
  text: 'Love Topic',
  emojiChar: '❤️',
  backgroundColor: '#ffe6e6',
  borderColor: '#ff0000',
  fontColor: '#ff0000',
  fontSize: 16,
  fontFamily: 'Arial',
  shapeType: 'rounded rectangle',
  theme: 'classic',
};

// Story with celebration emoji
export const WithCelebrationEmoji = Template.bind({});
WithCelebrationEmoji.args = {
  text: 'Success!',
  emojiChar: '🎉',
  backgroundColor: '#fff2cc',
  borderColor: '#ffcc00',
  fontColor: '#cc6600',
  fontSize: 18,
  fontFamily: 'Arial',
  shapeType: 'rounded rectangle',
  theme: 'prism',
};

// Story with multiple emojis
export const WithMultipleEmojis = Template.bind({});
WithMultipleEmojis.args = {
  text: 'Party Time',
  emojiChar: '🎊',
  backgroundColor: '#f0f8ff',
  borderColor: '#4169e1',
  fontColor: '#4169e1',
  fontSize: 16,
  fontFamily: 'Arial',
  shapeType: 'elipse',
  theme: 'dark-prism',
};

// Story with no text, just emoji
export const EmojiOnly = Template.bind({});
EmojiOnly.args = {
  text: '',
  emojiChar: '🚀',
  backgroundColor: '#e6f3ff',
  borderColor: '#0066cc',
  fontColor: '#0066cc',
  fontSize: 14,
  fontFamily: 'Arial',
  shapeType: 'rectangle',
  theme: 'classic',
};
