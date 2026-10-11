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

import { ReactElement, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import ErrorPage from '../error-page';
import type { ErrorInfo } from '../../classes/client';
import { trackPageView } from '../../utils/analytics';
import { FallbackBackdrop, FallbackCard } from './error-fallback.styled';

const isErrorInfo = (error: unknown): error is ErrorInfo =>
  typeof error === 'object' &&
  error !== null &&
  ('msg' in error || 'status' in error || 'isAuth' in error || 'fields' in error);

const AUTH_STATUS_CODES = new Set([401, 403]);

const MapsPageErrorFallback = (): ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const error = useRouteError();
  const routeError = isRouteErrorResponse(error) ? error : undefined;
  const errorInfo = isErrorInfo(error) ? error : undefined;
  const errorInfoStatus =
    errorInfo && typeof errorInfo.status === 'number' ? errorInfo.status : undefined;

  const isAuthError =
    (routeError && AUTH_STATUS_CODES.has(routeError.status)) ||
    (errorInfo &&
      ((errorInfoStatus !== undefined && AUTH_STATUS_CODES.has(errorInfoStatus)) ||
        errorInfo.isAuth === true));

  useEffect(() => {
    if (isAuthError) {
      document.title = intl.formatMessage({
        id: 'maps.auth-required-title',
        defaultMessage: 'Sign In Required | WiseMapping',
      });
      trackPageView(window.location.pathname, 'MapsPageAuthRequired');
    }
  }, [intl, isAuthError]);

  if (!isAuthError) {
    return <ErrorPage />;
  }

  const detailMessage =
    (errorInfo?.msg && errorInfo.msg.trim().length > 0 && errorInfo.msg) ||
    (routeError?.statusText && routeError.statusText.trim().length > 0 && routeError.statusText) ||
    intl.formatMessage({
      id: 'maps.auth-required-default-message',
      defaultMessage: 'You need to sign in to view your maps.',
    });

  const handleLoginClick = () => {
    navigate('/c/login');
  };

  return (
    <FallbackBackdrop>
      <FallbackCard spacing={2}>
        <Typography variant="h4" component="h1">
          <FormattedMessage
            id="maps.auth-required-heading"
            defaultMessage="Sign in to access your maps"
          />
        </Typography>
        <Typography variant="body1" component="p" sx={{ color: 'text.secondary' }}>
          {detailMessage}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoginClick}
          sx={{ alignSelf: 'flex-start' }}
        >
          <FormattedMessage id="maps.auth-required-login" defaultMessage="Go to login" />
        </Button>
      </FallbackCard>
    </FallbackBackdrop>
  );
};

export default MapsPageErrorFallback;
