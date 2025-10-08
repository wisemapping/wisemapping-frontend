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

import React, { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ErrorInfo, Permission } from '../../../../classes/client';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useStyles } from './style';
import RoleIcon from '../../role-icon';
import Tooltip from '@mui/material/Tooltip';
import { Interpolation, Theme } from '@emotion/react';
import { ClientContext } from '../../../../classes/provider/client-context';

type ShareModel = {
  emails: string;
  canEdit: boolean;
  message: string;
};

const defaultModel: ShareModel = { emails: '', canEdit: true, message: '' };
const ShareDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const classes = useStyles();
  const [showMessage, setShowMessage] = React.useState<boolean>(false);
  const [model, setModel] = React.useState<ShareModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();

  const deleteMutation = useMutation(
    (email: string) => {
      return client.deleteMapPermission(mapId, email);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`perm-${mapId}`);
        setModel(defaultModel);
      },
      onError: (error: ErrorInfo) => {
        setError(error);
      },
    },
  );

  const splitEmail = (emails: string): string[] => {
    return emails
      .split(/,|;/)
      .map((e) => e.trim().replace(/\s/g, ''))
      .filter((e) => e.trim().length > 0);
  };

  const addMutation = useMutation(
    (model: ShareModel) => {
      const emails = splitEmail(model.emails);
      const permissions = emails.map((email: string) => {
        return { email: email, role: model.canEdit ? ('editor' as const) : ('viewer' as const) };
      });
      return client.addMapPermissions(mapId, model.message, permissions);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`perm-${mapId}`);
        setModel(defaultModel);
      },
      onError: (error: ErrorInfo) => {
        setError(error);
      },
    },
  );

  const handleOnClose = (): void => {
    // Invalidate cache ...
    queryClient.invalidateQueries(`perm-${mapId}`);
    onClose();
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value =
      event.target.type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
    setModel({ ...model, [name as keyof ShareModel]: value });
    event.stopPropagation();
  };

  const handleOnAddClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.stopPropagation();
    addMutation.mutate(model);
    event.stopPropagation();
  };

  const handleOnDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    email: string,
  ): void => {
    event.stopPropagation();
    deleteMutation.mutate(email);
  };

  const { isLoading, data: permissions = [] } = useQuery<unknown, ErrorInfo, Permission[]>(
    `perm-${mapId}`,
    () => {
      return client.fetchMapPermissions(mapId);
    },
  );

  const formatName = (perm: Permission): string => {
    return perm.name ? `${perm.name}<${perm.email}>` : perm.email;
  };

  // very basic email validation, just make sure the basic syntax is fine
  const isValid = splitEmail(model.emails).every((str) => /\S+@\S+\.\S+/.test((str || '').trim()));

  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        title={intl.formatMessage({
          id: 'share.delete-title',
          defaultMessage: 'Share with people',
        })}
        description={intl.formatMessage({
          id: 'share.delete-description',
          defaultMessage:
            'Invite people to collaborate with you in the creation of your mindmap. They will be notified by email. ',
        })}
        maxWidth="md"
        papercss={classes.paper}
        error={error}
      >
        <div css={classes.actionContainer as Interpolation<Theme>}>
          <TextField
            id="emails"
            name="emails"
            required={true}
            size="small"
            type="email"
            variant="outlined"
            placeholder="Add collaborator email"
            label={intl.formatMessage({ id: 'common.emails', defaultMessage: 'Emails' })}
            onChange={handleOnChange}
            value={model.emails}
            disabled={addMutation.isLoading}
            css={[classes.fullWidthInMobile, classes.email]}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={model.canEdit}
                onChange={handleOnChange}
                name="canEdit"
                color="primary"
                disabled={addMutation.isLoading}
              />
            }
            label={
              <Typography variant="subtitle2">
                <FormattedMessage id="share.can-edit" defaultMessage="Can edit" />
              </Typography>
            }
            css={classes.role}
          />

          <FormControlLabel
            value="start"
            onChange={(event, value) => {
              setShowMessage(value);
            }}
            style={{ fontSize: '5px' }}
            control={<Checkbox color="primary" disabled={addMutation.isLoading} />}
            label={
              <Typography variant="subtitle2">
                <FormattedMessage id="share.add-message" defaultMessage="Customize share message" />
              </Typography>
            }
            labelPlacement="end"
            css={classes.checkbox}
          />

          <Button
            color="primary"
            type="button"
            variant="contained"
            disableElevation={true}
            onClick={handleOnAddClick}
            disabled={!isValid || addMutation.isLoading}
            css={classes.shareButton}
            startIcon={
              addMutation.isLoading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {addMutation.isLoading ? (
              <FormattedMessage id="share.adding-button" defaultMessage="Sharing..." />
            ) : (
              <FormattedMessage id="share.add-button" defaultMessage="Share" />
            )}
          </Button>

          {showMessage && (
            <TextField
              multiline
              rows={3}
              maxRows={3}
              css={classes.textArea}
              variant="filled"
              name="message"
              onChange={handleOnChange}
              value={model.message}
              disabled={addMutation.isLoading}
              label={intl.formatMessage({
                id: 'share.message',
                defaultMessage: 'Message',
              })}
            />
          )}
        </div>

        {!isLoading && (
          <Paper elevation={1} css={classes.listPaper as Interpolation<Theme>} variant="outlined">
            <List>
              {permissions &&
                permissions.map((permission) => {
                  return (
                    <ListItem key={permission.email} role={undefined} dense component="button">
                      <ListItemText
                        css={classes.listItemText as Interpolation<Theme>}
                        id={permission.email}
                        primary={formatName(permission)}
                      />

                      <RoleIcon role={permission.role} />
                      <ListItemSecondaryAction>
                        <Tooltip
                          title={
                            <FormattedMessage
                              id="share.delete"
                              defaultMessage="Delete collaborator"
                            />
                          }
                        >
                          <IconButton
                            edge="end"
                            disabled={permission.role == 'owner'}
                            onClick={(e) => handleOnDeleteClick(e, permission.email)}
                            size="large"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
            </List>
          </Paper>
        )}
      </BaseDialog>
    </div>
  );
};

export default ShareDialog;
