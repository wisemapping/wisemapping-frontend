/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import ReactGA from 'react-ga4';

/**
 * Tracks mindmap list toolbar actions in Google Analytics
 * @param action - The action being performed
 * @param category - The category of the action (default: 'mindmap_list')
 * @param label - Optional label for additional context
 */
export const trackMindmapListAction = (
  action: string,
  category: string = 'mindmap_list',
  label?: string,
): void => {
  try {
    ReactGA.event({
      category,
      action,
      label,
      nonInteraction: false,
    });
  } catch (error) {
    console.warn('Failed to track mindmap list action:', error);
  }
};

/**
 * Tracks toolbar button clicks in Google Analytics
 * @param action - The action being performed
 * @param label - Optional label for additional context
 */
export const trackToolbarAction = (action: string, label?: string): void => {
  trackMindmapListAction(action, 'toolbar', label);
};

/**
 * Tracks mindmap export events in Google Analytics
 * @param format - The export format (svg, png, pdf, wxml, etc.)
 * @param group - The export group type (image, document, mindmap-tool)
 */
export const trackExport = (format: string, group: string): void => {
  try {
    ReactGA.event({
      category: 'export',
      action: format,
      label: group,
      nonInteraction: false,
    });
  } catch (error) {
    console.warn('Failed to track export action:', error);
  }
};

/**
 * Tracks page views in Google Analytics
 * @param page - The page path (e.g., window.location.pathname)
 * @param title - The page title for analytics
 */
export const trackPageView = (page: string, title: string): void => {
  try {
    ReactGA.send({
      hitType: 'pageview',
      page,
      title,
    });
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

/**
 * Sets the user ID in Google Analytics
 * @param email - The user's email address to set as user ID, or null to clear it
 */
export const setAnalyticsUserId = (email: string | null): void => {
  try {
    ReactGA.set({ userId: email || undefined });
  } catch (error) {
    console.warn('Failed to set analytics user ID:', error);
  }
};

/**
 * Clears the user ID in Google Analytics
 */
export const clearAnalyticsUserId = (): void => {
  setAnalyticsUserId(null);
};
