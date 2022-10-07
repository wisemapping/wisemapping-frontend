import { useState } from 'react';
import { $msg } from '@wisemapping/mindplot';
import { NodePropertyValueModel } from '../../ToolbarValueModelBuilder';
import Box from '@mui/material/Box';
import React from 'react';
import Input from '../input';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import SaveAndDelete from '../save-and-delete';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

/**
 * Url form for toolbar and node contextual editor
 */
const UrlForm = (props: { closeModal: () => void; urlModel: NodePropertyValueModel }) => {
  const [url, setUrl] = useState(props.urlModel.getValue());

  /**
   * if url is valid set model value and calls closeModal
   */
  const submitHandler = () => {
    if (checkURL(url)) {
      props.closeModal();
      props.urlModel.setValue(url);
    }
  };

  const keyDownHandler = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitHandler();
    }
  };

  const checkURL = (url: string): boolean => {
    const regex =
      /^((http|https):\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    return regex.test(url);
  };

  const isValidUrl = !url || checkURL(url);

  return (
    <Box display="flex" sx={{ p: 1 }}>
      <Input
        autoFocus
        error={!isValidUrl}
        helperText={isValidUrl ? '' : $msg('URL_ERROR')}
        placeholder={$msg('PASTE_URL_HERE')}
        label="URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        variant="outlined"
        size="small"
        onKeyDown={keyDownHandler}
        InputProps={{
          endAdornment: (
            <Link href={isValidUrl ? url : ''} target="_blank">
              <IconButton disabled={!isValidUrl}>
                <OpenInNewOutlinedIcon></OpenInNewOutlinedIcon>
              </IconButton>
            </Link>
          ),
        }}
        sx={{ pr: 1 }}
      ></Input>
      <SaveAndDelete
        model={props.urlModel}
        closeModal={props.closeModal}
        submitHandler={submitHandler}
      />
    </Box>
  );
};

export default UrlForm;
