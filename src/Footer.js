import React from 'react';


class Footer extends React.Component {
    render() {
        return (
            <footer class="footer">
                <img src="images/text-wisemapping.svg" />
                <div>
                    <a href="termsofuse.html">Terms and Conditions</a>
                    <a href="mailto:feedback@wisemapping.com">Feedback</a>
                    <a href="mailto:team@wisemapping.com">Contact Us</a>
                    <a href="http://www.wisemapping.org/">Open Source</a>
                    <a href="faq.html">FAQ</a>
                    <a href="aboutus.html">About Us</a>
                </div>
            </footer>
        )
    };
}

export default Footer;

