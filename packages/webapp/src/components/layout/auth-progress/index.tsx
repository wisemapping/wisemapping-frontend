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
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import AccountAccessLayout from '../AccountAccessLayout';
import { ProgressMessage, ProgressStack } from './styled';

/**
 * The waiting screen of signing in. The OAuth callback, the login page checking the session and
 * the loading of those pages all show it, in the layout of the login page and with one message,
 * so that signing in reads as one screen instead of a run of different pages and texts.
 */
const AuthProgress = (): React.ReactElement => (
  <AccountAccessLayout headerType="none">
    <ProgressStack role="status" aria-live="polite">
      <CircularProgress size={48} />
      <ProgressMessage variant="h6">
        <FormattedMessage
          id="registration.callback.waiting.description"
          defaultMessage="Please wait while we validate your identity"
        />
      </ProgressMessage>
    </ProgressStack>
  </AccountAccessLayout>
);

export default AuthProgress;
