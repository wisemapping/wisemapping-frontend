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

import React, { ReactElement, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import ErrorPage from '../error-page';
import type { ErrorInfo } from '../../classes/client';
import { trackPageView } from '../../utils/analytics';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.85)',
        padding: 3,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'background.paper',
          borderRadius: 2,
          padding: 4,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.35) 0px 10px 30px'
              : 'rgba(145, 158, 171, 0.2) 0px 10px 30px',
        }}
      >
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
      </Stack>
    </Box>
  );
};

export default MapsPageErrorFallback;
