import React from 'react'
import { FormattedMessage } from 'react-intl'

const logo = require('../images/logo-text.svg')


const Footer = () => {
  return (
    <footer className="footer" >
      <img src={logo} alt="logo"/>
      <div >
        <div><a href="termsofuse.html"> <FormattedMessage id="footer.termsandconditions" defaultMessage="Term And Conditions" /> </a></div>
        <div><a href="faq.html"> <FormattedMessage id="footer.faq" defaultMessage="F.A.Q." /> </a></div >
        <div><a href="aboutus.html"> <FormattedMessage id="footer.aboutus" defaultMessage="About Us" /></a></div >
      </div>
      <div >
        <div><a href="http://www.wisemapping.org/"> <FormattedMessage id="footer.opensource" defaultMessage="Open Source" /> </a></div>
        <div><a href="mailto:team@wisemapping.com"> <FormattedMessage id="footer.contactus" defaultMessage="Contact Us" /> </a></div>
        <div>< a href="mailto:feedback@wisemapping.com" > <FormattedMessage id="footer.feedback" defaultMessage="Feedback" /> </a></div>
      </div>
      <div>
        <div><span className="button-style2" >< a href="https://www.paypal.com/webapps/shoppingcart?flowlogging_id=c7ac923b53025&mfid=1606520600355_c7ac923b53025#/checkout/openButton">< FormattedMessage id="footer.donations" defaultMessage="PayPal Donations" /> </a></span ></div>
      </div >
    </footer>
  )
}

export default Footer;
