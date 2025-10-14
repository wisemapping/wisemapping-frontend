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
import { ErrorInfo } from '../../../classes/client';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

type GlobalErrorProps = {
  error?: ErrorInfo;
  title?: string;
};

const GlobalError = (props: GlobalErrorProps): React.ReactElement | null => {
  const error = props.error;
  const hasError = Boolean(error?.msg);
  const errorMsg = error?.msg;
  const title = props.title;

  return hasError ? (
    <Alert severity="error" variant="filled" style={{ marginBottom: '1rem' }}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {errorMsg}
    </Alert>
  ) : null;
};

export default GlobalError;
