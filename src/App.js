import React from 'react';

import RegistrationApp from './RegistrationApp.js';
import LoginPage from './LoginPage.js';

const Apps = Object.freeze({
    LOGIN: {
        id: 'login',
        path: '/c/login'
    },
    REGISTRATION: {
        id: 'registration',
        path: '/c/user/registration'
    }
});

function router() {
    let result = null;

    // Is it running ebedded ?.
    const location = window.location;
    if (location.pathname.indexOf('/c/') !== -1) {
        const pathname = location.pathname;
        result = Object.values(Apps).find(value => value.path.endsWith(pathname));
    } else {
        // It's loaded from the npm start
        const pageId = new URLSearchParams(location.search).get('app');
        result = Object.values(Apps).find(value => value.id === pageId);
    }
    if (result === null) {
        result = Apps.LOGIN;
    }

    console.log("router():" + result);
    return result;
}

class App extends React.Component {
    constructor(props) {
        super(props);
    }
   
    render()
    {
        const locale = this.props.locale;
        const messages = this.props.messages;

        // Todo: This is a temporal hack to rudimentary dispatch application.
        let rootPage;
        switch (router()) {
            case Apps.LOGIN:
                rootPage = <LoginPage locale = { locale }
                messages = { messages }
                />;
                break
            case Apps.REGISTRATION:
                rootPage = <RegistrationApp locale = { locale }
                messages = { messages }
                />;
                break
            default:
                rootPage = <LoginPage locale = { locale }
                messages = { messages }
                />;
        }

        return rootPage;
        
    }

}
export default App;