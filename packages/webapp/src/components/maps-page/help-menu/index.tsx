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

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Help from '@mui/icons-material/Help';
import PolicyOutlined from '@mui/icons-material/PolicyOutlined';
import FeedbackOutlined from '@mui/icons-material/FeedbackOutlined';
import EmojiPeopleOutlined from '@mui/icons-material/EmailOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import Fab from '@mui/material/Fab';
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
    <>
      <Tooltip
        arrow={true}
        title={intl.formatMessage({ id: 'help.support', defaultMessage: 'Support' })}
      >
        <Fab
          color="primary"
          aria-haspopup="true"
          onClick={handleMenu}
          sx={{
            width: '28px',
            height: '28px',
            minHeight: '28px',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          <Help sx={{ fontSize: '18px' }} />
        </Fab>
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
    </>
  );
};

export default HelpMenu;
