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

export const LabelContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  margin: 2px;
  padding: 4px;
  align-items: center;
  font-size: 0.96rem;
  font-family: 'Figtree', 'Noto Sans JP', 'Helvetica', 'system-ui', 'Arial', 'sans-serif';

  .delete-button {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .delete-button {
    opacity: 1;
  }
`;

export const LabelText = styled.span`
  margin-left: 4px;
  margin-right: 0px;
  font-family: 'Figtree', 'Noto Sans JP', 'Helvetica', 'system-ui', 'Arial', 'sans-serif';
`;
