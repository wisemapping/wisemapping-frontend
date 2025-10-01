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
import FacebookIcon from '../facebook-icon';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const StyledFacebookButton = styled(Button)(() => ({
  color: '#ffffff',
  fontWeight: '300',
  backgroundColor: '#1877f2',
  border: `1px solid #1877f2`,
  flex: '1 1 auto',
  minWidth: '200px',
  '&:hover': {
    backgroundColor: '#166fe5',
    border: `1px solid #166fe5`,
  },
}));

type FacebookButtonProps = {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const FacebookButton: React.FunctionComponent<FacebookButtonProps> = ({
  text,
  onClick,
}: FacebookButtonProps) => {
  return (
    <StyledFacebookButton variant="contained" startIcon={FacebookIcon} onClick={onClick}>
      {text}
    </StyledFacebookButton>
  );
};

export default FacebookButton;
