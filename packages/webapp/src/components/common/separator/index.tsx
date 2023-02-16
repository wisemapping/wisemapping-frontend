/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { containerStyle, lineStyle, textStyle } from './style';

type SeparatorProps = {
  responsive: boolean;
  text: string;
  maxWidth?: number;
};

const Separator: React.FunctionComponent<SeparatorProps> = ({
  responsive,
  text,
  maxWidth = undefined,
}: SeparatorProps) => {
  const theme = useTheme();

  return (
    // eslint-disable-next-line react/no-unknown-property
    <div css={containerStyle(responsive, maxWidth, theme.breakpoints.down('md'))}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div css={lineStyle(responsive, theme.breakpoints.up('md'))}></div>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <div css={textStyle(responsive, theme.breakpoints.up('md'))}>{text}</div>
    </div>
  );
};

export default Separator;
