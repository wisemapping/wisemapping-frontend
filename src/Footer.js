import React from 'react';
import { FormattedMessage } from 'react-intl'


class Footer extends React.Component {
    render() {
        return (
            <footer class="footer">
                <img src="images/text-wisemapping.svg" alt="logo"/>
                <div>
                    <div><a href="termsofuse.html"><FormattedMessage id="TERMS_AND_CONDITIONS" defaultMessage="Term And Conditions" /></a></div>
                    <div><a href="faq.html"><FormattedMessage id="FAQ" defaultMessage="F.A.Q." /></a></div>
                    <div><a href="aboutus.html"><FormattedMessage id="ABOUT_US" defaultMessage="About Us" /></a></div>
                </div>
                <div>
                    <div><a href="http://www.wisemapping.org/"><FormattedMessage id="OPEN_SOURCE" defaultMessage="Open Source" /></a></div>
                    <div><a href="mailto:team@wisemapping.com"><FormattedMessage id="CONTACT_US" defaultMessage="Contact Us" /></a></div>
                    <div><a href="mailto:feedback@wisemapping.com"><FormattedMessage id="FEEDBACK" defaultMessage="Feedback" /></a></div>
                </div>
                <div>
                    <div><span id="siteseal"><script async type="text/javascript" src="https://seal.godaddy.com/getSeal?sealID=iGLOz83ePtxZCiqwz4QuXb7OQWXTflEIPdOnuR2PzaUwSru3lYJNEj9VdqJ1"></script></span></div>
                    <div><span class="button-style2"><a href="https://www.paypal.com/webapps/shoppingcart?flowlogging_id=c7ac923b53025&mfid=1606520600355_c7ac923b53025#/checkout/openButton"><FormattedMessage id="DONATIONS" defaultMessage="PayPal Donations" /></a></span></div>
                </div>
            </footer>
        )
    };
}

export default Footer;

