import React from 'react';
import { ErrorInfo } from '../../../classes/client';
import StyledAlert from './styled';

type GlobalErrorProps = {
  error?: ErrorInfo;
};

const GlobalError = (props: GlobalErrorProps): React.ReactElement | null => {
  const error = props.error;
  const hasError = Boolean(error?.msg);
  const errorMsg = error?.msg;

  return hasError ? (
    <StyledAlert severity="error" variant="filled" hidden={!hasError}>
      {errorMsg}
    </StyledAlert>
  ) : null;
};

export default GlobalError;
