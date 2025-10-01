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

import { css, SerializedStyles } from '@emotion/react';

export const containerStyle = (
  responsive: boolean,
  maxWidth: number | undefined,
  breakPointDownMd: string,
): SerializedStyles => {
  return css([
    {
      position: 'relative',
      width: '100%',
      height: '90%',
      top: '5%',
      display: 'inline-block',
    },
    responsive && {
      [breakPointDownMd]: {
        paddingTop: '25px',
        paddingBottom: '25px',
      },
    },
    !responsive && {
      paddingTop: '25px',
      paddingBottom: '25px',
    },
    maxWidth && {
      maxWidth: maxWidth,
    },
  ]);
};

export const lineStyle = (responsive: boolean, breakPointUpMd: string): SerializedStyles => {
  return css([
    {
      backgroundColor: '#dce2e6',
      position: 'absolute',
      left: '50%',
      height: '1px',
      width: '100%',
      transform: 'translateX(-50%)',
    },
    responsive && {
      [breakPointUpMd]: {
        height: '100%',
        width: '1px',
        transform: 'translateX(0%) translateY(0%)',
      },
    },
  ]);
};

export const textStyle = (responsive: boolean, breakPointUpMd: string): SerializedStyles => {
  return css([
    {
      backgroundColor: '#DCE2E6',
      padding: '5px 10px',
      minWidth: '36px',
      borderRadius: '18px',
      fontSize: '18px',
      color: 'white',
      textAlign: 'center',
      display: 'inline-block',
      position: 'absolute',
      transform: 'translateX(-50%) translateY(-50%)',
      left: '50%',
    },
    responsive && {
      [breakPointUpMd]: {
        top: '15%',
      },
    },
  ]);
};
