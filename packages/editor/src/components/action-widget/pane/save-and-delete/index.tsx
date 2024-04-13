/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React, { ReactElement } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import { FormattedMessage } from 'react-intl';

type SaveAndDeleteProps = {
  model: NodeProperty<string | undefined>;
  closeModal: () => void;
  submitHandler: () => void;
};

const SaveAndDelete = ({ model, closeModal, submitHandler }: SaveAndDeleteProps): ReactElement => {
  const value = model.getValue();
  return (
    <Box component="span" justifyContent="flex-end" display="flex" sx={{ pt: 1 }}>
      <Button
        color="primary"
        variant="outlined"
        onClick={submitHandler}
        sx={{ mr: 1 }}
        size="small"
      >
        <FormattedMessage id="action.accept" defaultMessage="Accept" />
      </Button>

      {value && value.trim() !== '' && (
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => {
            closeModal();
            if (model.setValue) {
              model.setValue(undefined);
            }
          }}
          size="small"
        >
          <FormattedMessage id="action.delete" defaultMessage="Delete" />
        </Button>
      )}
    </Box>
  );
};

export default SaveAndDelete;
