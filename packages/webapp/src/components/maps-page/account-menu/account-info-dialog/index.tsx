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
import Input from '../../../form/input';
import BaseDialog from '../../action-dispatcher/base-dialog';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import { useFetchAccount } from '../../../../classes/middleware';
import { ClientContext } from '../../../../classes/provider/client-context';
import AppI18n, { LocaleCode, Locales } from '../../../../classes/app-i18n';

type AccountInfoDialogProps = {
  onClose: () => void;
};

type AccountInfoModel = {
  email: string;
  firstname: string;
  lastname: string;
};

const defaultModel: AccountInfoModel = { firstname: '', lastname: '', email: '' };
const AccountInfoDialog = ({ onClose }: AccountInfoDialogProps): React.ReactElement => {
  const client = useContext(ClientContext);
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<string>('1');
  const [selectedLanguage, setSelectedLanguage] = React.useState<LocaleCode>('en');

  const [model, setModel] = React.useState<AccountInfoModel>(defaultModel);
  const [error, setError] = React.useState<ErrorInfo>();
  const intl = useIntl();

  const mutationChangeName = useMutation<void, ErrorInfo, AccountInfoModel>(
    (model: AccountInfoModel) => {
      return client.updateAccountInfo(model.firstname, model.lastname);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('account');
        onClose();
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const mutationRemove = useMutation<void, ErrorInfo, void>(
    () => {
      return client.deleteAccount();
    },
    {
      onSuccess: () => {
        window.location.href = '/c/login';
        onClose();
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const mutationChangeLanguage = useMutation<void, ErrorInfo, LocaleCode>(
    (locale: LocaleCode) => {
      return client.updateAccountLanguage(locale);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('account');
        // Reload the page to apply the new language
        window.location.reload();
      },
      onError: (error) => {
        setError(error);
      },
    },
  );

  const account = useFetchAccount();
  useEffect(() => {
    if (account) {
      setModel({
        email: account?.email,
        lastname: account?.lastname,
        firstname: account?.firstname,
      });
      // Set the current language from account or default
      const currentLocale = account?.locale || AppI18n.getDefaultLocale().code;
      setSelectedLanguage(currentLocale as LocaleCode);
    }
  }, [account?.email, account?.locale]);

  const handleOnClose = (): void => {
    onClose();
    setModel(defaultModel);
    setError(undefined);
    setShowDeleteDialog(false);
    setDeleteConfirmationText('');
    setActiveTab('1');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    // Reset delete confirmation when switching tabs
    if (newValue === '1') {
      setShowDeleteDialog(false);
      setDeleteConfirmationText('');
    }
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value as LocaleCode;
    setSelectedLanguage(newLanguage);
    mutationChangeLanguage.mutate(newLanguage);
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (showDeleteDialog) {
      if (deleteConfirmationText === 'DELETE') {
        mutationRemove.mutate();
      } else {
        setError({
          msg: intl.formatMessage({
            id: 'account.delete-confirmation-error',
            defaultMessage: 'Please type "DELETE" to confirm account deletion.',
          }),
        });
      }
    } else {
      mutationChangeName.mutate(model);
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof AccountInfoModel]: value });
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteDialog(true);
    setError(undefined);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmationText('');
    setError(undefined);
  };

  const handleDeleteConfirmationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmationText(event.target.value);
    if (error?.msg?.includes('DELETE')) {
      setError(undefined);
    }
  };

  const handleDeleteAccountSubmit = () => {
    const challengePhrase = intl.formatMessage({
      id: 'account.delete-challenge',
      defaultMessage: 'DELETE MY ACCOUNT',
    });

    if (deleteConfirmationText === challengePhrase) {
      mutationRemove.mutate();
    } else {
      setError({
        msg: intl.formatMessage({
          id: 'account.delete-confirmation-error',
          defaultMessage: `Please type "${challengePhrase}" to confirm account deletion.`,
        }),
      });
    }
  };

  const getSubmitButtonText = () => {
    if (showDeleteDialog) {
      return intl.formatMessage({
        id: 'account.delete-confirm',
        defaultMessage: 'Delete Account',
      });
    }
    return intl.formatMessage({
      id: 'accountinfo.button',
      defaultMessage: 'Save Changes',
    });
  };

  const shouldShowSubmitButton = () => {
    return activeTab === '1' || (activeTab === '2' && !showDeleteDialog);
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      onSubmit={shouldShowSubmitButton() ? handleOnSubmit : undefined}
      error={error}
      title={intl.formatMessage({ id: 'accountinfo.title', defaultMessage: 'Account Settings' })}
      submitButton={shouldShowSubmitButton() ? getSubmitButtonText() : undefined}
      maxWidth="md"
    >
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <TabList onChange={handleTabChange} aria-label="account settings tabs">
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label={intl.formatMessage({
                id: 'accountinfo.personal-info',
                defaultMessage: 'Personal Info',
              })}
              value="1"
            />
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label={intl.formatMessage({
                id: 'accountinfo.account-settings',
                defaultMessage: 'Account Settings',
              })}
              value="2"
            />
          </TabList>
        </Box>

        <TabPanel value="1" sx={{ px: 0 }}>
          <FormControl fullWidth={true}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}
              >
                <FormattedMessage
                  id="accountinfo.personal-details"
                  defaultMessage="Personal Details"
                />
              </Typography>

              <Input
                name="email"
                type="text"
                disabled={true}
                label={intl.formatMessage({ id: 'accountinfo.email', defaultMessage: 'Email' })}
                value={model.email}
                onChange={handleOnChange}
                error={error}
                fullWidth={true}
              />

              <Input
                name="firstname"
                type="text"
                label={intl.formatMessage({
                  id: 'accountinfo.firstname',
                  defaultMessage: 'First Name',
                })}
                value={model.firstname}
                onChange={handleOnChange}
                required={true}
                fullWidth={true}
              />

              <Input
                name="lastname"
                type="text"
                label={intl.formatMessage({
                  id: 'accountinfo.lastname',
                  defaultMessage: 'Last Name',
                })}
                value={model.lastname}
                onChange={handleOnChange}
                required={true}
                fullWidth={true}
              />
            </Box>
          </FormControl>
        </TabPanel>

        <TabPanel value="2" sx={{ px: 0 }}>
          <FormControl fullWidth={true}>
            <Box sx={{ mb: 2 }}>
              {/* Language Selection */}
              <Box sx={{ mb: 4 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LanguageIcon />
                      <FormattedMessage id="language.change" defaultMessage="Change Language" />
                    </Box>
                  </InputLabel>
                  <Select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LanguageIcon />
                        <FormattedMessage id="language.change" defaultMessage="Change Language" />
                      </Box>
                    }
                    disabled={mutationChangeLanguage.isLoading}
                  >
                    {Object.values(Locales).map((locale) => (
                      <MenuItem key={locale.code} value={locale.code}>
                        {locale.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {!showDeleteDialog ? (
                <Box>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <AlertTitle>
                      <FormattedMessage
                        id="account.delete-warning-title"
                        defaultMessage="Delete Account"
                      />
                    </AlertTitle>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <FormattedMessage
                        id="account.delete-warning-description"
                        defaultMessage="Once you delete your account, there is no going back. Please be certain."
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      <FormattedMessage
                        id="account.delete-warning-consequences"
                        defaultMessage="This will permanently delete:"
                      />
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      <Typography component="li" variant="body2">
                        <FormattedMessage
                          id="account.delete-warning-mindmaps"
                          defaultMessage="All your mindmaps and their content"
                        />
                      </Typography>
                      <Typography component="li" variant="body2">
                        <FormattedMessage
                          id="account.delete-warning-data"
                          defaultMessage="All your personal data and account information"
                        />
                      </Typography>
                      <Typography component="li" variant="body2">
                        <FormattedMessage
                          id="account.delete-warning-collaborations"
                          defaultMessage="All shared mindmaps and collaborations"
                        />
                      </Typography>
                      <Typography component="li" variant="body2">
                        <FormattedMessage
                          id="account.delete-warning-history"
                          defaultMessage="All account history and activity logs"
                        />
                      </Typography>
                    </Box>
                  </Alert>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={handleDeleteAccountClick}
                    sx={{
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <FormattedMessage
                      id="accountinfo.deleteaccount"
                      defaultMessage="Delete Account"
                    />
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <AlertTitle>
                      <FormattedMessage
                        id="account.delete-confirmation-title"
                        defaultMessage="Are you absolutely sure?"
                      />
                    </AlertTitle>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <FormattedMessage
                        id="account.delete-confirmation-warning"
                        defaultMessage="This action cannot be undone. This will permanently delete your account and remove all data from our servers."
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <FormattedMessage
                        id="account.delete-confirmation-instruction"
                        defaultMessage="Please type DELETE MY ACCOUNT to confirm:"
                      />
                    </Typography>
                  </Alert>

                  <Input
                    name="deleteConfirmation"
                    type="text"
                    label={intl.formatMessage({
                      id: 'account.delete-confirmation-label',
                      defaultMessage: 'Type "DELETE MY ACCOUNT" to confirm',
                    })}
                    value={deleteConfirmationText}
                    onChange={handleDeleteConfirmationChange}
                    error={error}
                    fullWidth={true}
                    required={true}
                  />

                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancelDelete} sx={{ flex: 1 }}>
                      <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      disabled={
                        deleteConfirmationText !==
                        intl.formatMessage({
                          id: 'account.delete-challenge',
                          defaultMessage: 'DELETE MY ACCOUNT',
                        })
                      }
                      onClick={handleDeleteAccountSubmit}
                      sx={{ flex: 1 }}
                    >
                      <FormattedMessage
                        id="account.delete-confirm"
                        defaultMessage="Delete Account"
                      />
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </FormControl>
        </TabPanel>
      </TabContext>
    </BaseDialog>
  );
};
export default AccountInfoDialog;
