import TranslateTwoTone from '@mui/icons-material/TranslateTwoTone';
import React, { useContext } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { FormattedMessage, useIntl } from 'react-intl';
import AppI18n, { LocaleCode, Locales } from '../../../classes/app-i18n';
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
  const mutation = useMutation(
    (locale: LocaleCode) => client.updateAccountLanguage(locale ? locale : 'en'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('account');
        handleClose();
      },
      onError: (error) => {
        console.error(`Unexpected error ${error}`);
      },
    },
  );

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
    const localeCode = event.target['id'];
    mutation.mutate(localeCode);
  };

  const userLocale = AppI18n.getUserLocale();
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
        <MenuItem onClick={handleOnClick} id={Locales.EN.code}>
          {Locales.EN.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.ES.code}>
          {Locales.ES.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.DE.code}>
          {Locales.DE.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.FR.code}>
          {Locales.FR.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.RU.code}>
          {Locales.RU.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.ZH.code}>
          {Locales.ZH.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.ZH_CN.code}>
          {Locales.ZH_CN.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.JA.code}>
          {Locales.JA.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.PT.code}>
          {Locales.PT.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.IT.code}>
          {Locales.IT.label}
        </MenuItem>

        <MenuItem onClick={handleOnClick} id={Locales.HI.code}>
          {Locales.HI.label}
        </MenuItem>

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
      <DialogTitle>Help us to support more languages !</DialogTitle>
      <DialogContent>
        <DialogContentText>
          We need your help !. If you are interested, send us an email to team@wisemapping.com.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageMenu;
