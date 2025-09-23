// Preload Raphael library globally
import Raphael from 'raphael';
import { drawGrid } from '../storybook/src/stories/layout/lib/raphael-plugins';

// Make Raphael available globally
if (typeof window !== 'undefined') {
  window.Raphael = Raphael;
  window.Raphael.fn.drawGrid = drawGrid;
}

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}