import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Header from '../layout/header';
import Typography from '@mui/material/Typography';
import ReactGA from 'react-ga4';
import { ErrorBody } from './styled';
import { useRouteError } from 'react-router-dom';
import { ErrorInfo } from '../../classes/client';

export type ErrorPageType = {
  isSecurity: boolean;
};

const ErrorPage = (): React.ReactElement => {
  const intl = useIntl();
  const error = useRouteError();

  // Error page handler ...
  window.newrelic?.noticeError(error);
  console.error(`Error Page: ${JSON.stringify(error)}`);

  // Is a server error info ?
  const errorInfo = error as ErrorInfo;

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'error.page-title',
      defaultMessage: 'Unexpected Error | WiseMapping',
    });
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname, title: 'ErrorPage' });
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
