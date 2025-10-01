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

import Button from '@mui/material/Button';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

type SubmitButton = {
  value: string;
  disabled?: boolean;
};
const SubmitButton = (props: SubmitButton): React.ReactElement => {
  const [disabled] = useState(props.disabled ? true : false);
  const intl = useIntl();

  let valueTxt = props.value;
  if (disabled) {
    valueTxt = intl.formatMessage({ id: 'common.wait', defaultMessage: 'Please wait ...' });
  }
  const [value] = useState(valueTxt);
  return (
    <Button
      color="primary"
      size="medium"
      variant="contained"
      type="submit"
      disableElevation={true}
      disabled={disabled}
      style={{
        width: '300px',
        height: '53px',
        padding: '0px 20px',
        margin: '7px 0px',
        fontSize: '18px',
      }}
    >
      {value}
    </Button>
  );
};

export default SubmitButton;
