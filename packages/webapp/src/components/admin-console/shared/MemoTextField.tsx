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
import TextField from '@mui/material/TextField';

/**
 * A memoised MUI TextField, for the admin console's dialogs: a dialog that re-renders on every
 * key re-renders only the field typed in, as long as it passes stable props (a stable
 * `onChange`, and no inline `sx` or `slotProps` objects). In development MUI's FormControl
 * (inside each TextField) gives its input a new context on every render, and the field then
 * updates the FormControl again from an effect: with every field of a form re-rendered on each
 * key, characters typed in one burst (as Cypress types them) add up to React's nested-update
 * limit ("Maximum update depth exceeded").
 */
const MemoTextField = React.memo(TextField) as typeof TextField;

export default MemoTextField;
