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

import React, { use, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorInfo } from '../../../../classes/client';
import BaseDialog from '../base-dialog';
import { SimpleDialogProps } from '..';
import {
  EmbedCode,
  paperSx,
  PublicUrlField,
  SharingLabel,
  SharingPanel,
  SharingTab,
  SharingTabPanel,
  SwitchBox,
  SwitchProgress,
} from './styled';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Typography from '@mui/material/Typography';
import AppConfig from '../../../../classes/app-config';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { useFetchMapById } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';
import { copyText } from '../../../../utils/clipboard';

const PublishDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const { data: map } = useFetchMapById(mapId);

  const client = use(ClientContext);
  const [model, setModel] = React.useState<boolean>(map?.public ?? false);
  const [error, setError] = React.useState<ErrorInfo>();
  const [activeTab, setActiveTab] = React.useState('1');
  const [copied, setCopied] = React.useState<boolean>(false);
  const queryClient = useQueryClient();
  const intl = useIntl();
  const previousModelRef = useRef<boolean>(map?.public ?? false);

  // Sync model state when map data changes (e.g., after refetch or initial load). Adjusted while
  // rendering, not in an effect, so the switch never shows a frame of the stale value. The revert
  // value (previousModelRef) needs no sync: every toggle records it before mutating.
  const loadedMapId = map?.id;
  const loadedPublic = map ? (map.public ?? false) : undefined;
  const [seenMap, setSeenMap] = React.useState({ id: loadedMapId, isPublic: loadedPublic });
  if (seenMap.id !== loadedMapId || seenMap.isPublic !== loadedPublic) {
    setSeenMap({ id: loadedMapId, isPublic: loadedPublic });
    if (loadedPublic !== undefined) {
      setModel(loadedPublic);
    }
  }

  const mutation = useMutation<void, ErrorInfo, boolean>({
    mutationFn: (model: boolean) => {
      return client.updateMapToPublic(mapId, model);
    },
    onSuccess: (_, updatedModel) => {
      setModel(updatedModel);
      previousModelRef.current = updatedModel;
      // Invalidate queries to refresh data, but keep dialog open
      // Also refreshes the map's metadata, which is cached under ['maps'].
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
    onError: (error) => {
      setError(error);
      // Revert the switch state on error to the previous value
      setModel(previousModelRef.current);
    },
  });

  const handleOnClose = (): void => {
    onClose();
    setError(undefined);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    event.preventDefault();
    setError(undefined);
    // Store the previous value for error handling
    previousModelRef.current = model;
    // Update local state optimistically
    setModel(checked);
    // Trigger the mutation immediately
    mutation.mutate(checked);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleCopyToClipboard = (text: string) => {
    copyText(text).then((copied) => setCopied(copied));
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
        error={error}
        title={intl.formatMessage({ id: 'publish.title', defaultMessage: 'Publish' })}
        description={intl.formatMessage({
          id: 'publish.description',
          defaultMessage: 'Make your map public. Anyone with the link can view it.',
        })}
        maxWidth="md"
        paperSx={paperSx}
      >
        <SwitchBox>
          <FormControl fullWidth={true}>
            <FormControlLabel
              control={
                <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <Switch
                    checked={model}
                    onChange={handleOnChange}
                    name="public"
                    color="primary"
                    disabled={mutation.isPending}
                  />
                  {mutation.isPending && <SwitchProgress size={24} />}
                </Box>
              }
              label={
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {intl.formatMessage({
                    id: 'publish.checkbox',
                    defaultMessage: 'Enable public sharing',
                  })}
                </Typography>
              }
            />
          </FormControl>
        </SwitchBox>

        <SharingPanel shown={model}>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange}>
                <SharingTab
                  label={intl.formatMessage({
                    id: 'publish.public-url',
                    defaultMessage: 'Public URL',
                  })}
                  value="1"
                />
                <SharingTab
                  label={intl.formatMessage({
                    id: 'publish.embedded',
                    defaultMessage: 'Embedded',
                  })}
                  value="2"
                />
              </TabList>
            </Box>
            <SharingTabPanel value="2">
              <SharingLabel variant="subtitle2">
                <FormattedMessage
                  id="publish.embedded-msg"
                  defaultMessage="Click the code below to copy it to your clipboard:"
                />
              </SharingLabel>
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
                <EmbedCode
                  readOnly={true}
                  spellCheck={false}
                  minRows={4}
                  maxRows={6}
                  value={embedCode}
                  onClick={() => handleCopyToClipboard(embedCode)}
                />
              </Tooltip>
            </SharingTabPanel>
            <SharingTabPanel value="1">
              <SharingLabel variant="subtitle2">
                <FormattedMessage
                  id="publish.public-url-msg"
                  defaultMessage="Click the link below to copy it to your clipboard:"
                />
              </SharingLabel>
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
                <PublicUrlField
                  fullWidth
                  value={publicUrl}
                  onClick={() => handleCopyToClipboard(publicUrl)}
                  variant="outlined"
                  size="small"
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
              </Tooltip>
            </SharingTabPanel>
          </TabContext>
        </SharingPanel>
      </BaseDialog>
    </div>
  );
};

export default PublishDialog;
