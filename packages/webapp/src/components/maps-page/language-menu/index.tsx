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

import TranslateTwoTone from '@mui/icons-material/TranslateTwoTone';
import React, { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormattedMessage, useIntl } from 'react-intl';
import AppI18n, { LocaleCode, Locales } from '../../../classes/app-i18n';
import { useFetchAccount } from '../../../classes/middleware';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { mobileAppbarButton } from '../style';
import { ClientContext } from '../../../classes/provider/client-context';

const LanguageMenu = (): React.ReactElement => {
  const queryClient = useQueryClient();
  const client = useContext(ClientContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openHelpDialog, setHelpDialogOpen] = React.useState<boolean>(false);

  const open = Boolean(anchorEl);
  const intl = useIntl();
  const theme = useTheme();
  const smMediaQuery = theme.breakpoints.down('sm');

  // Todo: For some reasons, in some situations locale is null. More research needed.
  const mutation = useMutation({
    mutationFn: (locale: LocaleCode) => client.updateAccountLanguage(locale ? locale : 'en'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
      handleClose();
    },
    onError: (error) => {
      console.error(`Unexpected error ${error}`);
    },
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnClick = (localeCode: LocaleCode) => {
    mutation.mutate(localeCode);
  };

  const account = useFetchAccount();
  const userLocale = AppI18n.getUserLocale(account?.locale);
  return (
    <span>
      <Tooltip
        arrow={true}
        title={intl.formatMessage({
          id: 'language.change',
          defaultMessage: 'Change Language',
        })}
      >
        <Button
          size="small"
          variant="outlined"
          disableElevation={true}
          color="primary"
          css={{
            [smMediaQuery]: mobileAppbarButton,
          }}
          onClick={handleMenu}
          startIcon={<TranslateTwoTone style={{ color: 'inherit' }} />}
        >
          <span className="message">{userLocale.label}</span>
        </Button>
      </Tooltip>
      <Menu
        id="appbar-language"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Every supported locale, so none can be left out of the menu. */}
        {Object.values(Locales).map((locale) => (
          <MenuItem key={locale.code} onClick={() => handleOnClick(locale.code)} id={locale.code}>
            {locale.label}
          </MenuItem>
        ))}

        <Divider />

        <MenuItem
          onClick={() => {
            handleClose();
            setHelpDialogOpen(true);
          }}
        >
          <FormattedMessage id="language.help" defaultMessage="Help to Translate" />
        </MenuItem>
      </Menu>
      {openHelpDialog && <HelpUsToTranslateDialog onClose={() => setHelpDialogOpen(false)} />}
    </span>
  );
};

type HelpUsToTranslateDialogProp = {
  onClose: () => void;
};
const HelpUsToTranslateDialog = ({ onClose }: HelpUsToTranslateDialogProp) => {
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>
        <FormattedMessage
          id="language.help-dialog.title"
          defaultMessage="Help us support more languages!"
        />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormattedMessage
            id="language.help-dialog.description"
            defaultMessage="We need your help! If you are interested, send us an email at {email}."
            values={{ email: 'team@wisemapping.com' }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          <FormattedMessage id="common.close" defaultMessage="Close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageMenu;
