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
 * Relationship Style Icon - A dashed curved arrow (how relationships are drawn
 * on the map) plus the same brush used by the topic style action.
 */
const RelationshipStyleIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Curved, dashed relationship line */}
      <path
        d="M3,19 C3,10.5 7,6 14,6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 2.5"
        strokeLinecap="round"
      />

      {/* V-shaped arrow at the end of the line - matches ArrowPeer implementation */}
      <path
        d="M11,2.5 L14.5,6 L11,9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Brush in the bottom right */}
      <g transform="translate(8.5, 8.5) scale(0.65)">
        <path
          d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"
          fill="currentColor"
        />
      </g>
    </SvgIcon>
  );
};

export default RelationshipStyleIcon;
