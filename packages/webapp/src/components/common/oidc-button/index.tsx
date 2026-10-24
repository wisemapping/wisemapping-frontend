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
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Generic OpenID Connect provider (Keycloak, Authentik, Okta...): same look as the Google button,
// with a neutral icon since the provider is the instance's own.
const StyledOidcButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: '300',
  border: `1px solid ${theme.palette.divider}`,
  flex: '1 1 auto',
  minWidth: '200px',
  '&:hover': {
    border: `1px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.action.hover,
  },
}));

type OidcButtonProps = {
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const OidcButton: React.FunctionComponent<OidcButtonProps> = ({ text, onClick }: OidcButtonProps) => {
  return (
    <StyledOidcButton variant="outlined" startIcon={<VpnKeyOutlinedIcon />} onClick={onClick}>
      {text}
    </StyledOidcButton>
  );
};

export default OidcButton;
