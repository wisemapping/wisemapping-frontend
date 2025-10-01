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
import { SvgIcon, SvgIconProps } from '@mui/material';

const RelationshipStyleIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Base relationship/ethernet icon */}
      <path d="M7.77,6.76L6.23,5.48L8.5,2H15.5L17.77,5.48L16.23,6.76L14.3,4H9.7L7.77,6.76M7,9V7H17V9L20,12L17,15V13H7V15L4,12L7,9M8,10V12H16V10H8Z" />

      {/* Paint brush overlay in bottom right */}
      <g transform="translate(14, 14) scale(0.4)">
        <path
          d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"
          fill="currentColor"
          opacity="0.7"
        />
      </g>
    </SvgIcon>
  );
};

export default RelationshipStyleIcon;
