import { Button, Divider, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { TranslateTwoTone } from '@material-ui/icons';
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Client, { ErrorInfo, AccountInfo, LocaleCode } from "../../../client";
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../redux/clientSlice';
import { FormattedMessage, useIntl } from 'react-intl';

const localeToStr = new Map<LocaleCode, string>([["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"]]);


const LanguageMenu = () => {
    const queryClient = useQueryClient();
    const client: Client = useSelector(activeInstance);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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

    const { data } = useQuery<unknown, ErrorInfo, AccountInfo>('account', () => {
        return client.fetchAccountInfo();
    });

    return (
        <span>
            <Tooltip title={intl.formatMessage({ id: 'language.change', defaultMessage: 'Change Language' })}>
                <Button
                    size="small"
                    variant="outlined"
                    disableElevation={true}
                    color="primary"
                    onClick={handleMenu}
                    startIcon={<TranslateTwoTone />}
                >
                    {localeToStr.get(data?.language ? data?.language : 'en')}
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
                <MenuItem onClick={handleOnClick} id="en">
                    {localeToStr.get('en')}
                </MenuItem>

                <MenuItem onClick={handleOnClick} id="es">
                    {localeToStr.get('es')}
                </MenuItem>

                <MenuItem onClick={handleOnClick} id="fr">
                    {localeToStr.get('fr')}
                </MenuItem>

                <MenuItem onClick={handleOnClick} id="de">
                    {localeToStr.get('de')}
                </MenuItem>
                <Divider />

                <MenuItem onClick={handleOnClick}>
                    <FormattedMessage id="language.help" defaultMessage=" Help to Translate" />
                </MenuItem>
            </Menu>
        </span>);
}
export default LanguageMenu;