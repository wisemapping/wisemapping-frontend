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
import { ReactElement, useState } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import Box from '@mui/material/Box';
import React from 'react';
import Input from '../../input';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import SaveAndDelete from '../save-and-delete';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { useIntl } from 'react-intl';

/**
 * Url form for toolbar and node contextual editor
 */
const TopicLink = (props: {
  closeModal: () => void;
  urlModel: NodeProperty<string>;
}): ReactElement => {
  const [url, setUrl] = useState<string>(props.urlModel.getValue());
  const intl = useIntl();

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

export default TopicLink;
