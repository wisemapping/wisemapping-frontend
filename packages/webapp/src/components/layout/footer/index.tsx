import React from 'react'
import { FormattedMessage } from 'react-intl'
import { StyledFooter } from './styled'

const logo = require('../../../images/logo-text.svg')

const Footer = () => {
  return (
    <StyledFooter>
      <div style={{ padding: 0, margin: 0 }}>
        <a href="http://www.wisemapping.org/">
          <div style={{ textAlign: "left" }}>Powered By</div><img src={logo} alt="logo" />
        </a>
      </div>
      <div >
        <h4><FormattedMessage id="footer.faqandhelp" defaultMessage="Help & FAQ" /></h4>
        <div><a href="https://www.wisemapping.com/faq.html"> <FormattedMessage id="footer.faq" defaultMessage="F.A.Q." /> </a></div >
        <div><a href="https://www.wisemapping.com/termsofuse.html"> <FormattedMessage id="footer.termsandconditions" defaultMessage="Term And Conditions" /> </a></div>
        <div><a href="mailto:team@wisemapping.com"> <FormattedMessage id="footer.contactus" defaultMessage="Contact Us" /> </a></div>
      </div>
      <div >
        <h4><FormattedMessage id="footer.others" defaultMessage="Others" /></h4>
        <div><a href="https://www.wisemapping.com/aboutus.html"> <FormattedMessage id="footer.aboutus" defaultMessage="About Us" /></a></div >
        <div><a href="mailto:feedback@wisemapping.com" > <FormattedMessage id="footer.feedback" defaultMessage="Feedback" /> </a></div>
        <div><a href="http://www.wisemapping.org/"> <FormattedMessage id="footer.opensource" defaultMessage="Open Source" /> </a></div>
      </div>
    </StyledFooter>
  )
}

export default Footer;
