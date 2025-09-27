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
import GoogleIcon from '../google-icon';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const StyledGoogleButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: '300',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    border: `1px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.action.hover,
  },
}));

type GoogleButtonProps = {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const GoogleButton: React.FunctionComponent<GoogleButtonProps> = ({
  text,
  onClick,
}: GoogleButtonProps) => {
  return (
    <StyledGoogleButton variant="outlined" startIcon={GoogleIcon} onClick={onClick}>
      {text}
    </StyledGoogleButton>
  );
};

export default GoogleButton;
