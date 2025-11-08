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

import React, { useContext, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { ErrorInfo } from '../../../../classes/client';
import BaseDialog from '../base-dialog';
import { handleOnMutationSuccess, SimpleDialogProps } from '..';
import { useStyles } from './style';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import Typography from '@mui/material/Typography';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import AppConfig from '../../../../classes/app-config';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { useFetchMapById } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';

const PublishDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const { data: map } = useFetchMapById(mapId);

  const client = useContext(ClientContext);
  const [model, setModel] = React.useState<boolean>(map?.public ?? false);
  const [error, setError] = React.useState<ErrorInfo>();
  const [activeTab, setActiveTab] = React.useState('1');
  const [copied, setCopied] = React.useState<boolean>(false);
  const queryClient = useQueryClient();
  const intl = useIntl();
  const classes = useStyles();

  // Sync model state when map data changes (e.g., after refetch or initial load)
  useEffect(() => {
    if (map) {
      setModel(map.public ?? false);
    }
  }, [map?.id, map?.public]);

  const mutation = useMutation<void, ErrorInfo, boolean>(
    (model: boolean) => {
      return client.updateMapToPublic(mapId, model);
    },
    {
      onSuccess: (_, updatedModel) => {
        setModel(updatedModel);
        handleOnMutationSuccess(onClose, queryClient);
        queryClient.invalidateQueries(`maps-metadata-${mapId}`);
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const handleOnClose = (): void => {
    onClose();
    setError(undefined);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(undefined);
    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    event.preventDefault();
    setModel(checked);
  };

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
      },
      () => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
      },
    );
  };

  const handleCloseTooltip = () => {
    setCopied(false);
  };

  const baseUrl = AppConfig.getUiBaseUrl();
  const embedCode = `<iframe 
  style="width:600px;height:400px;border:1px solid #ccc" 
  src="${baseUrl}/c/maps/${mapId}/embed?zoom=1.0">
</iframe>`;
  const publicUrl = `${baseUrl}/c/maps/${mapId}/public`;
  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        onSubmit={handleOnSubmit}
        error={error}
        title={intl.formatMessage({ id: 'publish.title', defaultMessage: 'Publish' })}
        description={intl.formatMessage({
          id: 'publish.description',
          defaultMessage: 'By publishing the map you make it visible to everyone on the Internet.',
        })}
        submitButton={intl.formatMessage({
          id: 'publish.button',
          defaultMessage: 'Accept',
        })}
        maxWidth="md"
        papercss={classes.paper}
      >
        <Box css={classes.checkboxContainer}>
          <FormControl fullWidth={true}>
            <FormControlLabel
              control={
                <Switch
                  checked={model}
                  onChange={handleOnChange}
                  name="public"
                  color="primary"
                  disabled={mutation.isLoading}
                />
              }
              label={
                <Typography variant="body1" fontWeight={500}>
                  {intl.formatMessage({
                    id: 'publish.checkbox',
                    defaultMessage: 'Enable public sharing',
                  })}
                </Typography>
              }
            />
          </FormControl>
        </Box>

        <div style={!model ? { display: 'none' } : {}}>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange}>
                <Tab
                  label={intl.formatMessage({
                    id: 'publish.public-url',
                    defaultMessage: 'Public URL',
                  })}
                  value="1"
                  css={classes.tab}
                />
                <Tab
                  label={intl.formatMessage({
                    id: 'publish.embedded',
                    defaultMessage: 'Embedded',
                  })}
                  value="2"
                  css={classes.tab}
                />
              </TabList>
            </Box>
            <TabPanel value="2" css={classes.tabPanel}>
              <Typography variant="subtitle2" css={classes.label}>
                <FormattedMessage
                  id="publish.embedded-msg"
                  defaultMessage="Copy this snippet of code to embed in your blog or page:"
                />
              </Typography>
              <Tooltip
                title={intl.formatMessage({
                  id: 'publish.copied',
                  defaultMessage: 'Copied to clipboard!',
                })}
                open={copied && activeTab === '2'}
                onClose={handleCloseTooltip}
                leaveDelay={1500}
                arrow
              >
                <TextareaAutosize
                  css={classes.textarea}
                  readOnly={true}
                  spellCheck={false}
                  minRows={4}
                  maxRows={6}
                  value={embedCode}
                  onClick={() => handleCopyToClipboard(embedCode)}
                />
              </Tooltip>
            </TabPanel>
            <TabPanel value="1" css={classes.tabPanel}>
              <Typography variant="subtitle2" css={classes.label}>
                <FormattedMessage
                  id="publish.public-url-msg"
                  defaultMessage="Copy and paste the link below to share your map with colleagues:"
                />
              </Typography>
              <Tooltip
                title={intl.formatMessage({
                  id: 'publish.copied',
                  defaultMessage: 'Copied to clipboard!',
                })}
                open={copied && activeTab === '1'}
                onClose={handleCloseTooltip}
                leaveDelay={1500}
                arrow
              >
                <TextField
                  fullWidth
                  value={publicUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                  onClick={() => handleCopyToClipboard(publicUrl)}
                  css={classes.urlInput}
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
            </TabPanel>
          </TabContext>
        </div>
      </BaseDialog>
    </div>
  );
};

export default PublishDialog;
