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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorInfo, Permission } from '../../../../classes/client';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import UserAvatar from '../user-avatar';
import {
  InviteBox,
  InviteControls,
  InviteField,
  InviteSpacer,
  PeopleList,
  PersonEmail,
  PersonName,
  PersonRole,
  PersonRow,
  PersonText,
  SectionTitle,
} from './styled';
import { ClientContext } from '../../../../classes/provider/client-context';
import AsyncButton from '../../../form/async-button';

type ShareModel = {
  emails: string;
  canEdit: boolean;
  message: string;
};

const defaultModel: ShareModel = { emails: '', canEdit: true, message: '' };

type ShareFieldProps = {
  value: string;
  label: string;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

/*
 * The text fields are memoised: a key re-renders only the field typed in. In development MUI's
 * FormControl (inside each TextField) updates itself from an effect after each of its renders;
 * with every field re-rendered on each key, characters typed in one burst (as Cypress types
 * them) add up to React's nested-update limit.
 */
const EmailsField = React.memo(function EmailsField({
  value,
  label,
  disabled,
  onChange,
}: ShareFieldProps): React.ReactElement {
  const intl = useIntl();
  return (
    <InviteField
      id="emails"
      name="emails"
      required={true}
      size="small"
      type="email"
      variant="outlined"
      placeholder={intl.formatMessage({
        id: 'share.emails-placeholder',
        defaultMessage: 'Add people by email, separated by commas',
      })}
      label={label}
      onChange={onChange}
      value={value}
      disabled={disabled}
    />
  );
});

const MessageField = React.memo(function MessageField({
  value,
  label,
  disabled,
  onChange,
}: ShareFieldProps): React.ReactElement {
  return (
    <InviteField
      multiline
      rows={3}
      size="small"
      variant="outlined"
      name="message"
      onChange={onChange}
      value={value}
      disabled={disabled}
      label={label}
    />
  );
});

const ShareDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const intl = useIntl();
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const [showMessage, setShowMessage] = React.useState<boolean>(false);
  const [model, setModel] = React.useState<ShareModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();

  const deleteMutation = useMutation({
    mutationFn: (email: string) => {
      return client.deleteMapPermission(mapId, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`perm-${mapId}`] });
      setModel(defaultModel);
    },
    onError: (error: ErrorInfo) => {
      setError(error);
    },
  });

  const splitEmail = (emails: string): string[] => {
    return emails
      .split(/,|;/)
      .map((e) => e.trim().replace(/\s/g, ''))
      .filter((e) => e.trim().length > 0);
  };

  const addMutation = useMutation({
    mutationFn: (model: ShareModel) => {
      const emails = splitEmail(model.emails);
      const permissions = emails.map((email: string) => {
        return { email: email, role: model.canEdit ? ('editor' as const) : ('viewer' as const) };
      });
      return client.addMapPermissions(mapId, model.message, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`perm-${mapId}`] });
      setModel(defaultModel);
    },
    onError: (error: ErrorInfo) => {
      setError(error);
    },
  });

  const handleOnClose = (): void => {
    // Invalidate cache ...
    queryClient.invalidateQueries({ queryKey: [`perm-${mapId}`] });
    onClose();
  };

  // Stable, so that a key re-renders only the field typed in (see EmailsField).
  const handleOnChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value =
      event.target.type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
    setModel((current) => ({ ...current, [name as keyof ShareModel]: value }));
    event.stopPropagation();
  }, []);

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
    // Prevent duplicate requests if already deleting
    if (!deleteMutation.isPending) {
      deleteMutation.mutate(email);
    }
  };

  const { isPending: isLoading, data: permissions = [] } = useQuery<
    unknown,
    ErrorInfo,
    Permission[]
  >({
    queryKey: [`perm-${mapId}`],
    queryFn: () => client.fetchMapPermissions(mapId),
  });

  const roleLabel = (role: Permission['role']): string =>
    role === 'owner'
      ? intl.formatMessage({ id: 'role.owner', defaultMessage: 'Owner' })
      : role === 'editor'
        ? intl.formatMessage({ id: 'role.editor', defaultMessage: 'Editor' })
        : intl.formatMessage({ id: 'role.viewer', defaultMessage: 'Viewer' });
  const deleteLabel = intl.formatMessage({
    id: 'share.delete',
    defaultMessage: 'Delete collaborator',
  });

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
          defaultMessage: "Add collaborators. They'll get instant email access to edit together.",
        })}
        maxWidth="sm"
        error={error}
      >
        <InviteBox>
          <EmailsField
            label={intl.formatMessage({ id: 'common.emails', defaultMessage: 'Emails' })}
            onChange={handleOnChange}
            value={model.emails}
            disabled={addMutation.isPending}
          />

          <InviteControls>
            <FormControlLabel
              control={
                <Checkbox
                  checked={model.canEdit}
                  onChange={handleOnChange}
                  name="canEdit"
                  color="primary"
                  size="small"
                  disabled={addMutation.isPending}
                />
              }
              label={<FormattedMessage id="share.can-edit" defaultMessage="Can edit" />}
            />
            <FormControlLabel
              onChange={(event, value) => {
                setShowMessage(value);
              }}
              control={<Checkbox color="primary" size="small" disabled={addMutation.isPending} />}
              label={
                <FormattedMessage id="share.add-message" defaultMessage="Customize share message" />
              }
            />
            <InviteSpacer />
            <AsyncButton
              color="primary"
              type="button"
              variant="contained"
              disableElevation={true}
              onClick={handleOnAddClick}
              disabled={!isValid}
              isLoading={addMutation.isPending}
              loadingText={intl.formatMessage({
                id: 'share.adding-button',
                defaultMessage: 'Sharing...',
              })}
            >
              {intl.formatMessage({ id: 'share.add-button', defaultMessage: 'Share' })}
            </AsyncButton>
          </InviteControls>

          {showMessage && (
            <MessageField
              onChange={handleOnChange}
              value={model.message}
              disabled={addMutation.isPending}
              label={intl.formatMessage({
                id: 'share.message',
                defaultMessage: 'Message',
              })}
            />
          )}
        </InviteBox>

        {!isLoading && permissions && permissions.length > 0 && (
          <>
            <SectionTitle id="share-people-title">
              <FormattedMessage id="share.people-with-access" defaultMessage="People with access" />
            </SectionTitle>
            <PeopleList aria-labelledby="share-people-title">
              {permissions.map((permission) => (
                <PersonRow key={permission.email}>
                  <UserAvatar name={permission.name || permission.email} />
                  <PersonText>
                    <PersonName>{permission.name || permission.email}</PersonName>
                    {permission.name && <PersonEmail>{permission.email}</PersonEmail>}
                  </PersonText>
                  <PersonRole>{roleLabel(permission.role)}</PersonRole>
                  <Tooltip title={deleteLabel}>
                    <span>
                      <IconButton
                        aria-label={deleteLabel}
                        disabled={permission.role === 'owner' || deleteMutation.isPending}
                        onClick={(e) => handleOnDeleteClick(e, permission.email)}
                        size="small"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </PersonRow>
              ))}
            </PeopleList>
          </>
        )}
      </BaseDialog>
    </div>
  );
};

export default ShareDialog;
