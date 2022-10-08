import Box from '@mui/material/Box';
import { $msg } from '@wisemapping/mindplot';
import React, { useState } from 'react';
import { NodePropertyValueModel } from '../../../toolbar/ToolbarValueModelBuilder';
import Input from '../../input';
import SaveAndDelete from '../save-and-delete';

/**
 * Note form for toolbar and node contextual editor
 */
const TopicNote = (props: { closeModal: () => void; noteModel: NodePropertyValueModel | null }) => {
  const [note, setNote] = useState(props.noteModel.getValue());

  const submitHandler = () => {
    props.closeModal();
    props.noteModel.setValue(note);
  };

  return (
    <Box sx={{ p: 2, width: '300px' }}>
      <Input
        autoFocus
        multiline
        label={$msg('NOTE')}
        variant="outlined"
        fullWidth
        rows={12}
        margin="dense"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      ></Input>
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
