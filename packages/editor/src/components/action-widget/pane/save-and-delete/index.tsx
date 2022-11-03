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
import IconButton from '@mui/material/IconButton';
import React, { ReactElement } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { FormattedMessage } from 'react-intl';

const SaveAndDelete = (props: {
  model: NodeProperty;
  closeModal: () => void;
  submitHandler: () => void;
}): ReactElement => {
  return (
    <Box component="span">
      <Button color="primary" variant="contained" onClick={props.submitHandler} sx={{ mr: 1 }}>
        <FormattedMessage id="action.accept" defaultMessage="Accept" />
      </Button>

      <Button color="primary" variant="outlined" onClick={props.closeModal}>
        <FormattedMessage id="action.cancel" defaultMessage="Cancel" />
      </Button>

      {props.model.getValue() && props.model.getValue().trim() !== '' && (
        <IconButton
          onClick={() => {
            props.closeModal();
            props.model.setValue(undefined);
          }}
        >
          <DeleteOutlineOutlinedIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default SaveAndDelete;
