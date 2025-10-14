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
import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Header from '../layout/header';
import Typography from '@mui/material/Typography';
import { trackPageView } from '../../utils/analytics';
import { ErrorBody } from './styled';
import { useRouteError } from 'react-router';
import { ErrorInfo } from '../../classes/client';
import { logCriticalError } from '../../utils';

export type ErrorPageType = {
  isSecurity: boolean;
};

const ErrorPage = (): React.ReactElement => {
  const intl = useIntl();
  const error = useRouteError();

  //@ts-expect-error 404 error have a status with the error code.
  if (error!.status == 404) {
    logCriticalError('Page not found error.', '404');
  } else {
    // Error page handler ...
    logCriticalError(`Handling ErrorPage redirect error`, JSON.stringify(error));
  }

  // Is a server error info ?
  const errorInfo = error as ErrorInfo;
  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'error.page-title',
      defaultMessage: 'Unexpected Error | WiseMapping',
    });
    trackPageView(window.location.pathname, 'ErrorPage');
  }, []);

  return (
    <div>
      <Header type="only-signup" />

      <ErrorBody>
        <Typography variant="h3" component="h3">
          <FormattedMessage id="error.security-error" defaultMessage="Mindmap cannot be opened." />
        </Typography>

        <Typography variant="h5" component="h6">
          {errorInfo.msg ? (
            errorInfo.msg
          ) : (
            <FormattedMessage
              id="error.undexpected-error-msg"
              defaultMessage="Unexpected error opening mindmap. Please, try latter."
            />
          )}
        </Typography>
      </ErrorBody>
    </div>
  );
};

export default ErrorPage;
