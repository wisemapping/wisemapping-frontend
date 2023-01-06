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
import React, { ReactElement, useState } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import Input from '../../input';
import SaveAndDelete from '../save-and-delete';
/**
 * Note form for toolbar and node contextual editor
 */
const TopicNote = (props: {
  closeModal: () => void;
  noteModel: NodeProperty<string> | null;
}): ReactElement => {
  const [note, setNote] = useState(props.noteModel.getValue());
  const submitHandler = () => {
    props.closeModal();
    props.noteModel.setValue(note);
  };

  return (
    <Box sx={{ px: 2, pb: 2, width: '300px' }}>
      <Input
        autoFocus
        multiline
        variant="outlined"
        fullWidth
        rows={12}
        margin="dense"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <br />
      <SaveAndDelete
        model={props.noteModel}
        closeModal={props.closeModal}
        submitHandler={submitHandler}
      />
    </Box>
  );
};

export default TopicNote;
