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
import styled from 'styled-components';

export const HeaderContainer = styled.div`
  width: 100%;
  height: 0px;
  background: #202020;
  z-index: 1000;
  position: absolute;
  top: 0;
  display: flex;
`;

export const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ToolbarButton = styled.div`
  width: 28px;
  height: 28px;
  text-align: center;
  z-index: 4;
  margin-top: 3px;
  padding-top: 2px;
  padding-left: 2px;
  margin-left: 3px;
  display: inline-block;
`;

export const ToolbarButtonExt = styled(ToolbarButton)`
  width: 40px;
  text-align: left;
  padding-left: 5px;
`;

export const AccountButton = styled.div`
  display: inline-block;
  margin-top: 3px;
`;

export const ToolbarRightContainer = styled.div`
  flex-shrink: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  overflow: hidden;
`;
