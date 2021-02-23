import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Help from '@material-ui/icons/Help';
import PolicyOutlined from '@material-ui/icons/PolicyOutlined';
import FeedbackOutlined from '@material-ui/icons/FeedbackOutlined';
import EmojiPeopleOutlined from '@material-ui/icons/EmailOutlined';
import EmailOutlined from '@material-ui/icons/EmailOutlined';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';

const HelpMenu = (): React.ReactElement => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const intl = useIntl();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <span>
            <Tooltip
                arrow={true}
                title={intl.formatMessage({ id: 'help.support', defaultMessage: 'Support' })}
            >
                <IconButton aria-haspopup="true" onClick={handleMenu}>
                    <Help />
                </IconButton>
            </Tooltip>
            <Menu
                id="appbar-profile"
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
                <MenuItem onClick={handleClose}>
                    <Link
                        color="textSecondary"
                        href="https://www.wisemapping.com/termsofuse.html"
                        target="help"
                    >
                        <ListItemIcon>
                            <PolicyOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage
                            id="footer.termsandconditions"
                            defaultMessage="Term And Conditions"
                        />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="mailto:team@wisemapping.com">
                        <ListItemIcon>
                            <EmailOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.contactus" defaultMessage="Contact Us" />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link color="textSecondary" href="mailto:feedback@wisemapping.com">
                        <ListItemIcon>
                            <FeedbackOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.feedback" defaultMessage="Feedback" />
                    </Link>
                </MenuItem>

                <MenuItem onClick={handleClose}>
                    <Link
                        color="textSecondary"
                        href="https://www.wisemapping.com/aboutus.html"
                        target="help"
                    >
                        <ListItemIcon>
                            <EmojiPeopleOutlined fontSize="small" />
                        </ListItemIcon>
                        <FormattedMessage id="footer.aboutus" defaultMessage="About Us" />
                    </Link>
                </MenuItem>
            </Menu>
        </span>
    );
};

export default HelpMenu;
