/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { CSSObject, styled } from '@mui/material/styles';

const formatField: CSSObject = {
  height: '40px',
  borderRadius: '9px',
  width: '300px',
  fontSize: '14px',
  margin: '0px 40px',
};

/** An export group: image, document or mindmap tool. */
export const GroupLabel = styled(FormControlLabel)({
  margin: '5px 0px',
});

/** The formats of the chosen group. Cast back to `Select`, whose value type styled() loses. */
export const FormatSelect = styled(Select)(formatField) as unknown as typeof Select;

/** A document or mindmap-tool format, as wide as its select. */
export const FormatOption = styled(MenuItem)(formatField);

/** An image format. */
export const ImageFormatOption = styled(MenuItem)({
  fontSize: '14px',
});

/** "Center and zoom to fit", under the image formats. */
export const ZoomToFitLabel = styled(FormControlLabel)(formatField);
