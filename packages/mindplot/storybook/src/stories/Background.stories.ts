import { StoryFn, Meta } from '@storybook/html';
import createBackground, { BackgroundArgs } from './Background';

export default {
  title: 'Mindplot/Background',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: {
      control: 'color',
      description: 'Background color of the canvas',
    },
    backgroundPattern: {
      options: ['solid', 'grid', 'dots', 'none'],
      control: { type: 'select' },
      description: 'Background pattern type',
    },
    gridSize: {
      control: { type: 'range', min: 10, max: 100, step: 5 },
      description: 'Grid size in pixels (for grid and dots patterns)',
    },
    gridColor: {
      control: 'color',
      description: 'Grid line color (for grid and dots patterns)',
    },
    theme: {
      control: 'select',
      options: ['classic', 'prism', 'dark-prism', 'robot'],
      description: 'Overall theme',
    },
  },
} as Meta;

const Template: StoryFn<BackgroundArgs> = (args: BackgroundArgs) => createBackground(args);

// Default story - solid background
export const SolidBackground = Template.bind({});
SolidBackground.args = {
  backgroundColor: '#f2f2f2',
  backgroundPattern: 'solid',
  gridSize: 50,
  gridColor: '#ebe9e7',
  theme: 'classic',
};

// Grid pattern background
export const GridBackground = Template.bind({});
GridBackground.args = {
  backgroundColor: '#ffffff',
  backgroundPattern: 'grid',
  gridSize: 25,
  gridColor: '#cccccc',
  theme: 'classic',
};

// Dots pattern background
export const DotsBackground = Template.bind({});
DotsBackground.args = {
  backgroundColor: '#f8f9fa',
  backgroundPattern: 'dots',
  gridSize: 15,
  gridColor: '#dee2e6',
  theme: 'prism',
};

// Large grid pattern
export const LargeGridBackground = Template.bind({});
LargeGridBackground.args = {
  backgroundColor: '#ffffff',
  backgroundPattern: 'grid',
  gridSize: 75,
  gridColor: '#e0e0e0',
  theme: 'dark-prism',
};

// Custom colored background with dots
export const CustomColoredDots = Template.bind({});
CustomColoredDots.args = {
  backgroundColor: '#fff5f5',
  backgroundPattern: 'dots',
  gridSize: 30,
  gridColor: '#ff6b6b',
  theme: 'robot',
};

// Dark theme with grid
export const DarkThemeGrid = Template.bind({});
DarkThemeGrid.args = {
  backgroundColor: '#2d3748',
  backgroundPattern: 'grid',
  gridSize: 40,
  gridColor: '#4a5568',
  theme: 'dark-prism',
};

// Minimal background (none pattern)
export const MinimalBackground = Template.bind({});
MinimalBackground.args = {
  backgroundColor: '#ffffff',
  backgroundPattern: 'none',
  gridSize: 50,
  gridColor: '#ebe9e7',
  theme: 'classic',
};
