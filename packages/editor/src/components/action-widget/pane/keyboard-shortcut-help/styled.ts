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

export const ShortcutsContainer = styled.div`
  font-size: 13px;
  width: 100%;

  & table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  & td {
    padding: 10px 12px;
    white-space: normal;
    word-wrap: break-word;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.875rem;
  }

  & th {
    padding: 12px;
    white-space: nowrap;
    background-color: #f5f5f5;
    color: #333;
    font-weight: 600;
    text-align: left;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #ccc;
  }

  & tbody tr {
    transition: background-color 0.2s ease;
  }

  & tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  & tbody tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  & tbody tr:last-child td {
    border-bottom: none;
  }

  & td:nth-child(2),
  & td:nth-child(3) {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: #1976d2;
    font-weight: 500;
  }
`;
