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
import { ReactElement, useState } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import Box from '@mui/material/Box';
import React from 'react';
import Input from '../../input';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import SaveAndDelete from '../save-and-delete';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useIntl } from 'react-intl';

/**
 * Url form for toolbar and node contextual editor
 */
const TopicLinkEditor = (props: {
  closeModal: () => void;
  urlModel: NodeProperty<string>;
}): ReactElement => {
  const [url, setUrl] = useState<string>(props.urlModel.getValue());
  const intl = useIntl();

  const submitHandler = () => {
    if (checkURL(url)) {
      props.closeModal();
      const setValue = props.urlModel.setValue;
      if (setValue) {
        setValue(url);
      }
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
      // eslint-disable-next-line no-useless-escape
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    return regex.test(url);
  };

  const isValidUrl = !url || checkURL(url);

  return (
    <Box
      sx={{
        pt: 1.5,
        px: 1.5,
        pb: 1,
        minWidth: '320px',
        maxWidth: '380px',
        backgroundColor: 'background.paper',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={props.closeModal}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 1,
          width: 24,
          height: 24,
          '& .MuiSvgIcon-root': {
            fontSize: '16px',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <Input
        autoFocus
        error={!isValidUrl}
        fullWidth
        margin="dense"
        helperText={
          isValidUrl
            ? ''
            : intl.formatMessage({ id: 'link.help_text', defaultMessage: 'Address is not valid' })
        }
        placeholder={intl.formatMessage({
          id: 'link.placeholder',
          defaultMessage: 'https://www.example.com',
        })}
        label="URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        variant="outlined"
        size="small"
        type="url"
        onKeyDown={keyDownHandler}
        InputProps={{
          endAdornment: (
            <Link href={isValidUrl ? url : ''} target="_blank">
              <IconButton disabled={!isValidUrl}>
                <OpenInNewOutlinedIcon />
              </IconButton>
            </Link>
          ),
        }}
      />
      <SaveAndDelete
        model={props.urlModel as NodeProperty<string | undefined>}
        closeModal={props.closeModal}
        submitHandler={submitHandler}
      />
    </Box>
  );
};

export default TopicLinkEditor;
