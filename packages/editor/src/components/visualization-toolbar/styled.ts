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
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const IconWithBadgeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  padding: theme.spacing(0.5),
}));

export const LevelBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '8px',
  minWidth: 16,
  height: 16,
  padding: '0 4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.55rem',
  fontWeight: 'bold',
  lineHeight: 1,
}));
