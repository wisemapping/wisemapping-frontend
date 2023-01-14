import React from 'react';
import { getCsrfToken, getCsrfTokenParameter } from '../../../utils';

const CSRFInput = (): React.ReactElement => {
  const token = getCsrfToken();
  const tokenParam = getCsrfTokenParameter();
  return <>{token && tokenParam && <input type="hidden" value={token} name={tokenParam} />}</>;
};

export default CSRFInput;
