import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Header from '../layout/header';
import Typography from '@mui/material/Typography';
import ReactGA from 'react-ga4';
import { ErrorBody } from './styled';

export type ErrorPageType = {
  isSecurity: boolean;
};

const ErrorPage = ({ isSecurity }: ErrorPageType): React.ReactElement => {
  const intl = useIntl();

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
          {isSecurity ? (
            <FormattedMessage
              id="error.security-error"
              defaultMessage="Mindmap cannot be opened."
            />
          ) : (
            <FormattedMessage
              id="error.undexpected-error"
              defaultMessage="An unexpected error has occurred."
            />
          )}
        </Typography>

        <Typography variant="h5" component="h6">
          {isSecurity ? (
            <FormattedMessage
              id="error.security-error-msg"
              defaultMessage="You do not have enough right access to see this map. This map has been changed to private or deleted."
            />
          ) : (
            <FormattedMessage
              id="error.undexpected-error-msg"
              defaultMessage="Unexpected error processing request"
            />
          )}
        </Typography>
      </ErrorBody>
    </div>
  );
};

export default ErrorPage;
