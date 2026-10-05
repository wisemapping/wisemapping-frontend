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
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { DesignerKeyboard } from '@wisemapping/mindplot';
import React, { ReactElement, useEffect, useRef } from 'react';

/**
 *
 * @param props text field props.
 * @returns wrapped mui TextField, that disable mindplot keyboard events on focus and enable it on blur
 */
const Input = (props: TextFieldProps): ReactElement => {
  // DesignerKeyboard pauses nest: resume only the pause this field took, once, so a pane
  // around it keeps the shortcuts paused after the field blurs or unmounts.
  const pausedRef = useRef(false);

  const pause = () => {
    if (!pausedRef.current) {
      pausedRef.current = true;
      DesignerKeyboard.pause();
    }
  };

  const resume = () => {
    if (pausedRef.current) {
      pausedRef.current = false;
      DesignerKeyboard.resume();
    }
  };

  useEffect(() => {
    return () => resume();
  }, []);
  return (
    <TextField
      {...props}
      onFocus={(e) => {
        pause();
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        resume();
        props.onBlur?.(e);
      }}
    ></TextField>
  );
};
export default Input;
