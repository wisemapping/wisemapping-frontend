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

/**
 * Design tokens for the "Organic" reskin (SPEC.md — Design Mockup Option B).
 * Source: .project/design/WiseMapping UI Mockups.html
 */
export const organicTokens = {
  color: {
    ground: '#f5ead8',
    groundDark: '#2a231a',
    sand: '#eee7db',
    sandDark: '#332c21',
    terracotta: '#c67139',
    terracottaDark: '#cc8a5c',
    sage: '#ccdbb2',
    sageDark: '#7f9463',
  },
  font: {
    display: ['Caprasimo', 'Figtree', 'sans-serif'].join(','),
    body: ['Figtree', 'Noto Sans JP', 'Helvetica', 'system-ui', 'Arial', 'sans-serif'].join(','),
  },
  radius: {
    pill: 999,
    card: 24,
  },
} as const;
