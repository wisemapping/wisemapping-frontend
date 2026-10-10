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

import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import { styled } from '@mui/material/styles';

export const PickerRoot = styled(Box)({
  padding: '5px',
  maxWidth: '100%',
});

export const PickerEmojiFrame = styled(Box)({
  width: 'clamp(240px, 85vw, 320px)',
  height: 'clamp(280px, 50vh, 350px)',
  overflow: 'hidden',
});

export const PickerShowImages = styled(FormGroup)({
  float: 'right',
});
