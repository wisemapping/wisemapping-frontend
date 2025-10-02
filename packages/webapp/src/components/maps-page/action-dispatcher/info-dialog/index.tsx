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

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { ErrorInfo } from '../../../../classes/client';
import BaseDialog from '../base-dialog';
import { SimpleDialogProps } from '..';
import { useStyles } from './style';
import dayjs from 'dayjs';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { useFetchMapById } from '../../../../classes/middleware';

// Load fromNow pluggin
dayjs.extend(LocalizedFormat);

const InfoDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const { data: map } = useFetchMapById(mapId);
  const [error, setError] = React.useState<ErrorInfo>();

  const intl = useIntl();
  const classes = useStyles();

  const handleOnClose = (): void => {
    onClose();
    setError(undefined);
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      error={error}
      title={intl.formatMessage({ id: 'info.title', defaultMessage: 'Info' })}
      description={intl.formatMessage({
        id: 'info.description-msg',
        defaultMessage: 'By publishing the map you make it visible to everyone on the Internet.',
      })}
      submitButton={intl.formatMessage({ id: 'info.button', defaultMessage: 'Accept' })}
    >
      <Paper style={{ maxHeight: 200, overflowY: 'scroll' }} variant="outlined" elevation={0}>
        <Card variant="outlined">
          <List dense={true} css={classes.list}>
            <ListItem>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="info.basic-info" defaultMessage="Basic Info" />
              </Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.name" defaultMessage="Name" />:
              </Typography>
              <Typography variant="body2">{map?.title}</Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.description" defaultMessage="Description" />:
              </Typography>
              <Typography variant="body2">{map?.description}</Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.creator" defaultMessage="Creator" />:
              </Typography>
              <Typography variant="body2">{map?.createdBy}</Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.creation-time" defaultMessage="Creation Date" />:
              </Typography>
              <Typography variant="body2">{dayjs(map?.creationTime).format('LLL')}</Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.modified-tny" defaultMessage="Last Modified By" />:
              </Typography>
              <Typography variant="body2">{map?.lastModificationBy}</Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.modified-time" defaultMessage="Last Modified Date" />:
              </Typography>
              <Typography variant="body2">
                {dayjs(map?.lastModificationTime).format('LLL')}
              </Typography>
            </ListItem>

            <ListItem>
              <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
                <FormattedMessage id="info.starred" defaultMessage="Starred" />:
              </Typography>
              <Typography variant="body2">{Boolean(map?.starred).toString()}</Typography>
            </ListItem>
          </List>
        </Card>

        <Card variant="outlined" style={{ marginTop: '10px' }}>
          <List dense={true}>
            <ListItem>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="info.sharing" defaultMessage="Sharing" />
              </Typography>
            </ListItem>
          </List>
          <ListItem>
            <Typography variant="caption" color="textPrimary" css={classes.textDesc}>
              <FormattedMessage id="info.public-visibility" defaultMessage="Publicly Visible" />:
            </Typography>
            <Typography variant="body2">{Boolean(map?.public).toString()}</Typography>
          </ListItem>
        </Card>
      </Paper>
    </BaseDialog>
  );
};

export default InfoDialog;
