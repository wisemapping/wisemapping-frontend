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
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export type AsyncButtonProps = ButtonProps & {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
};

/**
 * Reusable button component that displays a loading state with spinner and text change.
 * When isLoading is true:
 * - Button becomes disabled
 * - Shows CircularProgress spinner
 * - Displays loadingText instead of children
 */
const AsyncButton = ({
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...buttonProps
}: AsyncButtonProps): React.ReactElement => {
  return (
    <Button
      {...buttonProps}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : buttonProps.startIcon}
    >
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
};

export default AsyncButton;
