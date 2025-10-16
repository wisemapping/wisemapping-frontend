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
import styled from 'styled-components';
import { styled as muiStyled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const CreatorInfoContainer = styled.div`
  display: flex;
  align-items: end;
  position: absolute;
  float: left;
  top: calc(100% - 47px);
  left: 7px;
  height: 40px;
`;

export const CreatorInfoText = muiStyled(Box)(({ theme }) => ({
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  fontSize: '14px',
  color: theme.palette.text.secondary,
}));
