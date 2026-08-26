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

import React, { useContext, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { ErrorInfo, Permission } from '../../../../classes/client';
import { SimpleDialogProps } from '..';
import { ClientContext } from '../../../../classes/provider/client-context';
import { useFetchMapById } from '../../../../classes/middleware';
import AppConfig from '../../../../classes/app-config';
import AsyncButton from '../../../form/async-button';
import GlobalError from '../../../form/global-error';
import RoleIcon from '../../role-icon';

type InviteModel = { emails: string; canEdit: boolean };
const defaultInvite: InviteModel = { emails: '', canEdit: true };

const splitEmails = (emails: string): string[] =>
  emails
    .split(/,|;/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

const isValidEmailList = (emails: string): boolean => {
  const list = splitEmails(emails);
  return list.length > 0 && list.every((e) => /\S+@\S+\.\S+/.test(e));
};

/**
 * Merged Share + Publish side sheet (3b — link-first, per SPEC.md/plan.md T5).
 * Reuses the 4 existing API calls verbatim: fetchMapPermissions,
 * addMapPermissions, deleteMapPermission, updateMapToPublic.
 */
const ShareSheet = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const { data: map } = useFetchMapById(mapId);

  const [invite, setInvite] = React.useState<InviteModel>(defaultInvite);
  const [error, setError] = React.useState<ErrorInfo>();
  const [publicModel, setPublicModel] = React.useState<boolean>(map?.public ?? false);
  const previousPublicRef = useRef<boolean>(map?.public ?? false);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (map) {
      const value = map.public ?? false;
      setPublicModel(value);
      previousPublicRef.current = value;
    }
  }, [map?.id, map?.public]);

  const { isPending: isLoadingPermissions, data: permissions = [] } = useQuery<
    unknown,
    ErrorInfo,
    Permission[]
  >({
    queryKey: [`perm-${mapId}`],
    queryFn: () => client.fetchMapPermissions(mapId),
  });

  const addMutation = useMutation({
    mutationFn: (model: InviteModel) => {
      const permissions = splitEmails(model.emails).map((email) => ({
        email,
        role: model.canEdit ? ('editor' as const) : ('viewer' as const),
      }));
      return client.addMapPermissions(mapId, '', permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`perm-${mapId}`] });
      setInvite(defaultInvite);
    },
    onError: (err: ErrorInfo) => setError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (email: string) => client.deleteMapPermission(mapId, email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`perm-${mapId}`] }),
    onError: (err: ErrorInfo) => setError(err),
  });

  const publishMutation = useMutation<void, ErrorInfo, boolean>({
    mutationFn: (isPublic: boolean) => client.updateMapToPublic(mapId, isPublic),
    onSuccess: (_result, isPublic) => {
      setPublicModel(isPublic);
      previousPublicRef.current = isPublic;
      queryClient.invalidateQueries({ queryKey: ['maps'] });
      queryClient.invalidateQueries({ queryKey: [`maps-metadata-${mapId}`] });
    },
    onError: (err) => {
      setError(err);
      setPublicModel(previousPublicRef.current);
    },
  });

  const handleClose = (): void => {
    queryClient.invalidateQueries({ queryKey: [`perm-${mapId}`] });
    onClose();
  };

  const handlePublicToggle = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ): void => {
    setError(undefined);
    previousPublicRef.current = publicModel;
    setPublicModel(checked);
    publishMutation.mutate(checked);
  };

  const handleInviteChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;
    setInvite({ ...invite, [name]: type === 'checkbox' ? checked : value });
  };

  const baseUrl = AppConfig.getUiBaseUrl();
  const publicUrl = `${baseUrl}/c/maps/${mapId}/public`;

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText(publicUrl).then(() => setCopied(true));
  };

  return (
    <Drawer
      anchor="right"
      open
      onClose={handleClose}
      data-testid="share-sheet"
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: '420px' }, padding: '24px' } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            <FormattedMessage id="share.sheet-title" defaultMessage="Bring people in" />
          </Typography>
          <IconButton
            onClick={handleClose}
            data-testid="share-sheet-close"
            aria-label={intl.formatMessage({ id: 'common.close', defaultMessage: 'Close' })}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <FormattedMessage
            id="share.sheet-subtitle"
            defaultMessage="They'll land on the map, not a sign-up form."
          />
        </Typography>

        <GlobalError error={error} />

        <FormControlLabel
          control={
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Switch
                checked={publicModel}
                onChange={handlePublicToggle}
                disabled={publishMutation.isPending}
                data-testid="share-sheet-publish-toggle"
              />
              {publishMutation.isPending && (
                <CircularProgress
                  size={20}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-10px',
                    marginLeft: '-10px',
                  }}
                />
              )}
            </Box>
          }
          label={
            <Typography variant="body2">
              {publicModel
                ? intl.formatMessage({
                    id: 'share.link-anyone-view',
                    defaultMessage: 'Anyone with this link can view',
                  })
                : intl.formatMessage({
                    id: 'share.link-private',
                    defaultMessage: 'Publish a read-only page',
                  })}
            </Typography>
          }
        />

        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            value={publicUrl}
            data-testid="share-sheet-link"
            slotProps={{ input: { readOnly: true } }}
          />
          <Tooltip
            title={intl.formatMessage({
              id: 'publish.copied',
              defaultMessage: 'Copied to clipboard!',
            })}
            open={copied}
            onClose={() => setCopied(false)}
            leaveDelay={1500}
            arrow
          >
            <IconButton
              onClick={handleCopyLink}
              data-testid="share-sheet-copy-link"
              aria-label={intl.formatMessage({ id: 'common.copy', defaultMessage: 'Copy' })}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        <Typography variant="subtitle2">
          <FormattedMessage id="share.already-here" defaultMessage="Already here" />
        </Typography>
        {!isLoadingPermissions && (
          <List dense data-testid="share-sheet-collaborators">
            {permissions.map((permission) => (
              <ListItem
                key={permission.email}
                data-testid={`share-sheet-collaborator-${permission.email}`}
                secondaryAction={
                  permission.role !== 'owner' ? (
                    <IconButton
                      edge="end"
                      size="small"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(permission.email)}
                      aria-label={intl.formatMessage({
                        id: 'share.delete',
                        defaultMessage: 'Delete collaborator',
                      })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : undefined
                }
              >
                <RoleIcon role={permission.role} />
                <ListItemText
                  primary={
                    permission.name ? `${permission.name} <${permission.email}>` : permission.email
                  }
                  sx={{ marginLeft: '8px' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        <TextField
          fullWidth
          size="small"
          name="emails"
          type="email"
          placeholder={intl.formatMessage({
            id: 'share.invite-placeholder',
            defaultMessage: 'Invite by email…',
          })}
          value={invite.emails}
          onChange={handleInviteChange}
          disabled={addMutation.isPending}
          data-testid="share-sheet-invite-input"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="canEdit"
              checked={invite.canEdit}
              onChange={handleInviteChange}
              disabled={addMutation.isPending}
            />
          }
          label={
            <Typography variant="body2">
              <FormattedMessage id="share.can-edit" defaultMessage="Can edit" />
            </Typography>
          }
        />
        <AsyncButton
          variant="contained"
          color="primary"
          disabled={!isValidEmailList(invite.emails)}
          isLoading={addMutation.isPending}
          onClick={() => addMutation.mutate(invite)}
          loadingText={intl.formatMessage({
            id: 'share.adding-button',
            defaultMessage: 'Sharing...',
          })}
          data-testid="share-sheet-invite-submit"
        >
          {intl.formatMessage({ id: 'share.add-button', defaultMessage: 'Share' })}
        </AsyncButton>
      </Box>
    </Drawer>
  );
};

export default ShareSheet;
