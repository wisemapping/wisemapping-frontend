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

import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import type { SvgIconProps } from '@mui/material/SvgIcon';

/**
 * Start Arrow Icon - Arrow pointing left (at the start of the relationship line)
 * Matches the actual V-shaped chevron arrow used in relationships
 */
export const RelationshipStartArrowIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <title>Start Arrow</title>
      <desc>Arrow at the start (origin) of the relationship line, pointing left</desc>
      {/* Horizontal line (relationship line) */}
      <line x1="2" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" />

      {/* V-shaped arrow at start (left side) - matches ArrowPeer implementation */}
      <path
        d="M 7,7 L 2,12 L 7,17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};

/**
 * End Arrow Icon - Arrow pointing right (at the end of the relationship line)
 * Matches the actual V-shaped chevron arrow used in relationships
 */
export const RelationshipEndArrowIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <title>End Arrow</title>
      <desc>Arrow at the end (destination) of the relationship line, pointing right</desc>
      {/* Horizontal line (relationship line) */}
      <line x1="4" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />

      {/* V-shaped arrow at end (right side) - matches ArrowPeer implementation */}
      <path
        d="M 17,7 L 22,12 L 17,17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
