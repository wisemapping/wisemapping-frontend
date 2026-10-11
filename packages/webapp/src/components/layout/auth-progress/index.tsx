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
import CircularProgress from '@mui/material/CircularProgress';
import AccountAccessLayout from '../AccountAccessLayout';
import { ProgressMessage, ProgressStack } from './styled';

type AuthProgressProps = {
  /** What is happening; without one, only the spinner shows (while a page loads). */
  message?: React.ReactNode;
};

/**
 * The waiting screen of signing in. The OAuth callback, the login page checking the session and
 * the loading of those pages all show it, in the layout of the login page, so that signing in
 * reads as one screen whose message changes instead of a run of different pages.
 */
const AuthProgress = ({ message }: AuthProgressProps): React.ReactElement => (
  <AccountAccessLayout headerType="none">
    <ProgressStack role="status" aria-live="polite">
      <CircularProgress size={48} />
      {message && <ProgressMessage variant="h6">{message}</ProgressMessage>}
    </ProgressStack>
  </AccountAccessLayout>
);

export default AuthProgress;
