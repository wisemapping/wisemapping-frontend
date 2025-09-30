import ReactGA from 'react-ga4';

const trackEditorAction = (action: string, category: string, label?: string): void => {
  try {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
      nonInteraction: false,
    });
  } catch (error) {
    console.error(`Failed to track editor action ${action}:`, error);
  }
};

/**
 * Tracks app bar actions in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackAppBarAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'app_bar', label);
};

/**
 * Tracks topic style actions in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackTopicStyleAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'topic_style', label);
};

/**
 * Tracks connection style actions in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackConnectionStyleAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'connection_style', label);
};

/**
 * Tracks font formatting actions in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackFontFormatAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'font_format', label);
};

/**
 * Tracks relationship actions in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackRelationshipAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'relationship', label);
};

/**
 * Tracks canvas/style actions in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackCanvasAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'canvas_style', label);
};

/**
 * Tracks editor panel actions (formatting, styling, etc.) in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackEditorPanelAction = (action: string, label?: string): void => {
  trackEditorAction(action, 'editor_panel', label);
};

/**
 * Tracks general editor interactions (double click, topic selection, etc.) in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackEditorInteraction = (action: string, label?: string): void => {
  trackEditorAction(action, 'editor_interaction', label);
};
