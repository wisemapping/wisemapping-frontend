import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import Client, { ErrorInfo } from '../../../../classes/client';
import { activeInstance, useFetchMapById } from '../../../../redux/clientSlice';
import BaseDialog from '../base-dialog';
import { handleOnMutationSuccess, SimpleDialogProps } from '..';
import { useStyles } from './style';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import Typography from '@mui/material/Typography';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import AppConfig from '../../../../classes/app-config';
import Box from '@mui/material/Box';

const PublishDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const { map } = useFetchMapById(mapId);

  const client: Client = useSelector(activeInstance);
  const [model, setModel] = React.useState<boolean>(map ? map.isPublic : false);
  const [error, setError] = React.useState<ErrorInfo>();
  const [activeTab, setActiveTab] = React.useState('1');
  const queryClient = useQueryClient();
  const intl = useIntl();
  const classes = useStyles();
  const mutation = useMutation<void, ErrorInfo, boolean>(
    (model: boolean) => {
      return client.updateMapToPublic(mapId, model);
    },
    {
      onSuccess: () => {
        setModel(model);
        handleOnMutationSuccess(onClose, queryClient);
        queryClient.invalidateQueries(`maps-${mapId}`);
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
    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    event.preventDefault();
    setModel(checked);
  };

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
    setActiveTab(newValue);
  };

  const baseUrl = AppConfig.getBaseUrl();
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
      >
        <FormControl fullWidth={true}>
          <FormControlLabel
            control={
              <Checkbox checked={model} onChange={handleOnChange} name="public" color="primary" />
            }
            label={intl.formatMessage({
              id: 'publish.checkbox',
              defaultMessage: 'Enable public sharing',
            })}
          />
        </FormControl>

        <div style={!model ? { visibility: 'hidden' } : {}}>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange}>
                <Tab
                  label={intl.formatMessage({
                    id: 'publish.public-url',
                    defaultMessage: 'Public URL',
                  })}
                  value="1"
                />
                <Tab
                  label={intl.formatMessage({
                    id: 'publish.embedded',
                    defaultMessage: 'Embedded',
                  })}
                  value="2"
                />
              </TabList>
            </Box>
            <TabPanel value="2">
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="publish.embedded-msg"
                  defaultMessage="Copy this snippet of code to embed in your blog or page:"
                />
              </Typography>
              <TextareaAutosize
                className={classes.textarea}
                readOnly={true}
                spellCheck={false}
                maxRows={6}
                defaultValue={`<iframe style="width:600px;height:400px;border:1px solid black" src="${baseUrl}/c/maps/${mapId}/embed?zoom=1.0"></iframe>`}
              />
            </TabPanel>
            <TabPanel value="1">
              <Typography variant="subtitle2">
                <FormattedMessage
                  id="publish.public-url-msg"
                  defaultMessage="Copy and paste the link below to share your map with colleagues:"
                />
              </Typography>
              <TextareaAutosize
                className={classes.textarea}
                readOnly={true}
                spellCheck={false}
                maxRows={1}
                defaultValue={`${baseUrl}/c/maps/${mapId}/public`}
              />
            </TabPanel>
          </TabContext>
        </div>
      </BaseDialog>
    </div>
  );
};

export default PublishDialog;
