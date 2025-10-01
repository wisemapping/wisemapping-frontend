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
import IconButton from '@mui/material/IconButton';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';

export const StyledButton = styled(IconButton)`
  margin: 4px;
`;

export const NewLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const NewLabelColor = styled(LabelTwoTone)`
  margin-right: 12px;
  cursor: pointer;
`;

export const CreateLabel = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
