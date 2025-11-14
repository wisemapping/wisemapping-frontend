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
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { trackPageView } from '../../utils/analytics';
import { ErrorBody } from './styled';
import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { ErrorInfo } from '../../classes/client';
import { logCriticalError } from '../../utils';

export type ErrorPageType = {
  isSecurity: boolean;
};

const isErrorInfo = (error: unknown): error is ErrorInfo =>
  typeof error === 'object' &&
  error !== null &&
  ('msg' in error || 'isAuth' in error || 'fields' in error);

const hasMessage = (error: unknown): error is { message: string } =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string';

const safeSerialize = (error: unknown): string => {
  if (error instanceof Error) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const ErrorPage = (): React.ReactElement => {
  const intl = useIntl();
  const navigate = useNavigate();
  const error = useRouteError();
  const routeError = isRouteErrorResponse(error) ? error : undefined;
  const errorInfo = isErrorInfo(error) ? error : undefined;

  // If no error is thrown (catch-all route), treat as 404
  const isNotFound = error === undefined || routeError?.status === 404;
  const isAccessError =
    (routeError && (routeError.status === 401 || routeError.status === 403)) ||
    Boolean(errorInfo?.isAuth);

  if (isNotFound && error === undefined) {
    logCriticalError('Page not found error (catch-all route).', '404');
  } else if (routeError?.status === 404) {
    logCriticalError('Page not found error.', '404');
  } else if (error !== undefined) {
    logCriticalError('Handling ErrorPage redirect error', safeSerialize(error));
  }

  const headline = (() => {
    if (isNotFound) {
      return (
        <FormattedMessage id="error.not-found-title" defaultMessage="We can't find that page." />
      );
    }
    if (routeError?.status === 410) {
      return (
        <FormattedMessage
          id="error.map-unavailable-title"
          defaultMessage="This mindmap is not available for public display."
        />
      );
    }
    if (isAccessError) {
      return (
        <FormattedMessage
          id="error.permission-denied-title"
          defaultMessage="You don't have access to this page."
        />
      );
    }
    return <FormattedMessage id="error.generic-title" defaultMessage="Hmm, that didn't work." />;
  })();

  const fallbackDetail = (() => {
    if (isNotFound) {
      return (
        <FormattedMessage
          id="error.not-found-message"
          defaultMessage="The page you're looking for might have been removed, had its name changed, or is temporarily unavailable."
        />
      );
    }
    if (routeError?.status === 410) {
      return (
        <FormattedMessage
          id="error.map-unavailable-message"
          defaultMessage="This mindmap is not available for public display because it violates our site policies. If you need further assistance, contact support@wisemapping.com."
        />
      );
    }
    if (isAccessError) {
      return (
        <FormattedMessage
          id="error.permission-denied-message"
          defaultMessage="If you believe you should have access, please contact your administrator."
        />
      );
    }
    return (
      <FormattedMessage
        id="error.generic-message"
        defaultMessage="Please try again later or contact support if the problem continues."
      />
    );
  })();

  const detailMessage =
    (errorInfo?.msg && errorInfo.msg.trim().length > 0 && errorInfo.msg) ||
    (routeError &&
      !isNotFound &&
      routeError.status !== 410 &&
      typeof routeError.statusText === 'string' &&
      routeError.statusText.trim().length > 0 &&
      routeError.statusText) ||
    (routeError &&
      !isNotFound &&
      routeError.status !== 410 &&
      typeof routeError.data === 'string' &&
      routeError.data.trim().length > 0 &&
      routeError.data) ||
    (hasMessage(error) && error.message.trim().length > 0 && error.message) ||
    fallbackDetail;

  const handleGoHome = () => {
    navigate('/c/maps/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'error.page-title',
      defaultMessage: 'Unexpected Error | WiseMapping',
    });
    trackPageView(window.location.pathname, 'ErrorPage');
  }, [intl]);

  return (
    <div>
      <Header type="only-signup" />

      <ErrorBody>
        <Box
          sx={{
            maxWidth: 600,
            margin: '0 auto',
            padding: { xs: 2, md: 4 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            {headline}
          </Typography>

          <Typography variant="body1" component="p" sx={{ mb: 4, color: 'text.secondary' }}>
            {detailMessage}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            {isNotFound && (
              <>
                <Button variant="contained" color="primary" onClick={handleGoHome}>
                  <FormattedMessage id="error.go-home" defaultMessage="Go to Home" />
                </Button>
                <Button variant="outlined" color="primary" onClick={handleGoBack}>
                  <FormattedMessage id="error.go-back" defaultMessage="Go Back" />
                </Button>
              </>
            )}
            {isAccessError && (
              <Button variant="contained" color="primary" component={RouterLink} to="/c/login">
                <FormattedMessage id="error.go-to-login" defaultMessage="Sign In" />
              </Button>
            )}
            {!isNotFound && !isAccessError && (
              <Button variant="contained" color="primary" onClick={handleGoHome}>
                <FormattedMessage id="error.go-home" defaultMessage="Go to Home" />
              </Button>
            )}
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" component="p" sx={{ color: 'text.secondary' }}>
              <FormattedMessage
                id="error.contact-support"
                defaultMessage="Need help? Contact us at {support}"
                values={{
                  support: (
                    <Link href="mailto:support@wisemapping.com">support@wisemapping.com</Link>
                  ),
                }}
              />
            </Typography>
          </Box>
        </Box>
      </ErrorBody>
    </div>
  );
};

export default ErrorPage;
