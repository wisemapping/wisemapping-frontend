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

import TextField from '@mui/material/TextField';
import React, { ChangeEvent } from 'react';
import { ErrorInfo } from '../../../classes/client';

type InputProps = {
  name: string;
  error?: ErrorInfo;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  type: string;
  value?: string;
  autoComplete?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
};

const Input = ({
  name,
  error,
  onChange,
  required = true,
  type,
  value,
  label,
  autoComplete,
  fullWidth = true,
  disabled = false,
  minLength,
  maxLength = 254,
}: InputProps): React.ReactElement => {
  const fieldError = error?.fields?.[name];
  return (
    <TextField
      name={name}
      type={type}
      label={label}
      value={value}
      onChange={onChange}
      error={Boolean(fieldError)}
      helperText={fieldError}
      variant="outlined"
      required={required}
      fullWidth={fullWidth}
      margin="dense"
      disabled={disabled}
      autoComplete={autoComplete}
      inputProps={{ minLength: minLength, maxLength: maxLength }}
    />
  );
};
export default Input;
