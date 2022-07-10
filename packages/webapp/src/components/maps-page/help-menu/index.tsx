import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Help from '@mui/icons-material/Help';
import PolicyOutlined from '@mui/icons-material/PolicyOutlined';
import FeedbackOutlined from '@mui/icons-material/FeedbackOutlined';
import EmojiPeopleOutlined from '@mui/icons-material/EmailOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';

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
        <IconButton aria-haspopup="true" onClick={handleMenu} size="large">
          <Help />
        </IconButton>
      </Tooltip>
      <Menu
        id="appbar-profile"
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
        <MenuItem onClick={handleClose}>
          <Link
            color="textSecondary"
            href="https://www.wisemapping.com/termsofuse.html"
            target="help"
          >
            <ListItemIcon>
              <PolicyOutlined fontSize="small" />
            </ListItemIcon>
            <FormattedMessage id="footer.termsandconditions" defaultMessage="Term And Conditions" />
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
          <Link color="textSecondary" href="https://www.wisemapping.com/aboutus.html" target="help">
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
