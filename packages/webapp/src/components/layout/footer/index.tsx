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
import { FormattedMessage } from 'react-intl';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { StyledFooter } from './styled';
import poweredByIcon from './pwrdby-white.svg';
import ThemeToggle from '../../common/theme-toggle';

const Footer = (): React.ReactElement => {
  return (
    <StyledFooter>
      <div>
        <div style={{ padding: 0, margin: 0 }}>
          <a href="http://www.wisemapping.org/">
            <img src={poweredByIcon} alt="Powered By WiseMapping" />
          </a>
          <div className="copyright">
            <FormattedMessage
              id="footer.copyright"
              defaultMessage="© {year} WiseMapping LLC"
              values={{ year: new Date().getFullYear() }}
            />
          </div>
        </div>

        {/* Support — help-seeking paths */}
        <div>
          <h4>
            <FormattedMessage id="footer.col-support" defaultMessage="Support" />
          </h4>
          <div>
            <a href="https://www.wisemapping.com/faq.html">
              <FormattedMessage id="footer.faq" defaultMessage="F.A.Q." />
            </a>
          </div>
          <div>
            <a href="mailto:team@wisemapping.com">
              <FormattedMessage id="footer.contactus" defaultMessage="Contact Us" />
            </a>
          </div>
          <div>
            <a href="mailto:feedback@wisemapping.com">
              <FormattedMessage id="footer.feedback" defaultMessage="Feedback" />
            </a>
          </div>
        </div>

        {/* Community — project-external reach */}
        <div>
          <h4>
            <FormattedMessage id="footer.col-community" defaultMessage="Community" />
          </h4>
          <div>
            <a href="https://www.wisemapping.com/opensource" rel="noopener noreferrer">
              <FormattedMessage id="footer.opensource" defaultMessage="Open Source" />
            </a>
          </div>
          <div>
            <a href="https://www.wisemapping.com/news" rel="noopener noreferrer">
              <FormattedMessage id="footer.news" defaultMessage="News" />
            </a>
          </div>
          <div>
            <a href="https://x.com/wisemapping" target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="footer.twitter" defaultMessage="X" />
            </a>
          </div>
        </div>

        {/* Company — legal, trust, and ways to back the project */}
        <div>
          <h4>
            <FormattedMessage id="footer.col-company" defaultMessage="Company" />
          </h4>
          <div>
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=CF7GJ7T6E4RS4"
              target="_blank"
              rel="noopener noreferrer"
              className="donate-link"
            >
              <FavoriteIcon className="donate-icon" />
              <FormattedMessage id="footer.donations" defaultMessage="Donate" />
            </a>
          </div>
          <div>
            <a href="https://www.wisemapping.com/aboutus.html">
              <FormattedMessage id="footer.aboutus" defaultMessage="About Us" />
            </a>
          </div>
          <div>
            <a href="https://www.wisemapping.com/termsofuse.html">
              <FormattedMessage
                id="footer.termsandconditions"
                defaultMessage="Terms and Conditions"
              />
            </a>
          </div>
          <div>
            <a href="https://www.wisemapping.com/privacy">
              <FormattedMessage id="footer.privacypolicy" defaultMessage="Privacy Policy" />
            </a>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            marginTop: '10px',
          }}
        >
          <ThemeToggle showBackground={true} />
        </div>
      </div>
    </StyledFooter>
  );
};

export default Footer;
