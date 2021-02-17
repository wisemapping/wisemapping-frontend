import TranslateTwoTone from '@material-ui/icons/TranslateTwoTone';
import React from "react";
import { useMutation, useQueryClient } from "react-query";
import Client from "../../../classes/client";
import { useSelector } from 'react-redux';
import { activeInstance, fetchAccount } from '../../../redux/clientSlice';
import { FormattedMessage, useIntl } from 'react-intl';
import { LocaleCode, Locales } from '../../../classes/app-i18n';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';


const LanguageMenu = (): React.ReactElement => {
    const queryClient = useQueryClient();
    const client: Client = useSelector(activeInstance);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openHelpDialog, setHelpDialogOpen] = React.useState<boolean>(false);

    const open = Boolean(anchorEl);
    const intl = useIntl();

    const mutation = useMutation((locale: LocaleCode) => client.updateAccountLanguage(locale),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('account')
                handleClose();
            }
        }
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
    }

    const accountInfo = fetchAccount();
    return (
        <span>
            <Tooltip title={intl.formatMessage({ id: 'language.change', defaultMessage: 'Change Language' })}>
                <Button
                    size="small"
                    variant="outlined"
                    disableElevation={true}
                    color="primary"
                    style={{ borderColor: 'gray', color: 'gray' }}
                    onClick={handleMenu}
                    startIcon={<TranslateTwoTone style={{ color: 'inherit' }} />}
                >
                    {accountInfo?.locale?.label}
                </Button>
            </Tooltip>
            <Menu id="appbar-language"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                getContentAnchorEl={null}
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
                <Divider />

                <MenuItem onClick={() => { handleClose(); setHelpDialogOpen(true) }} >
                    <FormattedMessage id="language.help" defaultMessage="Help to Translate" />
                </MenuItem>
            </Menu>
            {openHelpDialog &&
                <HelpUsToTranslateDialog onClose={() => setHelpDialogOpen(false)} />
            }
        </span>);
}

type HelpUsToTranslateDialogProp = {
    onClose: () => void
}
const HelpUsToTranslateDialog = ({ onClose }: HelpUsToTranslateDialogProp) => {

    return (
        <Dialog
            open={true}
            onClose={onClose}
        >
            <DialogTitle>Help us to support more languages !</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    We need your help !. If you are interested, send us an email to team@wisemapping.com.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}


export default LanguageMenu;
