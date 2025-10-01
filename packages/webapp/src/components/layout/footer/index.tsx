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
        </div>
        <div>
          <h4>
            <FormattedMessage id="footer.faqandhelp" defaultMessage="Help & FAQ" />
          </h4>
          <div>
            <a href="https://www.wisemapping.com/aboutus.html">
              <FormattedMessage id="footer.aboutus" defaultMessage="About Us" />
            </a>
          </div>
          <div>
            <a href="https://www.wisemapping.com/faq.html">
              <FormattedMessage id="footer.faq" defaultMessage="F.A.Q." />
            </a>
          </div>
          <div>
            <a href="https://www.wisemapping.com/termsofuse.html">
              <FormattedMessage
                id="footer.termsandconditions"
                defaultMessage="Term And Conditions"
              />
            </a>
          </div>
        </div>
        <div>
          <h4>
            <FormattedMessage id="footer.contactus" defaultMessage="Contact Us" />
          </h4>
          <div>
            <a href="mailto:support@wisemapping.com">
              <FormattedMessage id="footer.support" defaultMessage="Support" />
            </a>
          </div>
          <div>
            <a href="mailto:feedback@wisemapping.com">
              <FormattedMessage id="footer.feedback" defaultMessage="Feedback" />
            </a>
          </div>
          <div>
            <a href="mailto:team@wisemapping.com">
              <FormattedMessage id="footer.team" defaultMessage="Our Team" />
            </a>
          </div>
        </div>
        <div>
          <h4>
            <FormattedMessage id="footer.others" defaultMessage="Others" />
          </h4>
          <div>
            <a href="https://www.paypal.com/donate/?hosted_button_id=CF7GJ7T6E4RS4">
              <FormattedMessage id="footer.donations" defaultMessage="Donations" />
            </a>
          </div>
          <div>
            <a href="http://www.wisemapping.org/">
              <FormattedMessage id="footer.opensource" defaultMessage="Open Source" />
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
