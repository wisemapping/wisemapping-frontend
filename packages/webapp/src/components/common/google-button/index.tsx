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
import { css } from '@emotion/react';
import { Button } from '@mui/material';
import GoogleIcon from '../google-icon';

const googleButtonStyle = css({
  color: '#000000',
  fontWeight: '300',
  border: '1px solid black',
  '&:hover': {
    border: '1px solid black',
  },
});

type GoogleButtonProps = {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const GoogleButton: React.FunctionComponent<GoogleButtonProps> = ({
  text,
  onClick,
}: GoogleButtonProps) => {
  return (
    <Button variant="outlined" css={googleButtonStyle} startIcon={GoogleIcon} onClick={onClick}>
      {text}
    </Button>
  );
};

export default GoogleButton;
