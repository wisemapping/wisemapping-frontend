import React, { ReactElement } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom';
import RegistrationSuccessPage from './components/registration-success-page';
import ForgotPasswordSuccessPage from './components/forgot-password-success-page';
import RegistationPage from './components/registration-page';
import LoginPage from './components/login-page';
import store from './redux/store';
import { ForgotPasswordPage } from './components/forgot-password-page';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { theme } from './theme';
import AppI18n, { Locales } from './classes/app-i18n';
import MapsPage from './components/maps-page';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import ReactGA from 'react-ga';
import EditorPage from './components/editor-page';
import AppConfig from './classes/app-config';


declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme { }
}

// Google Analytics Initialization.
ReactGA.initialize(AppConfig.getGoogleAnalyticsAccount());

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchIntervalInBackground: false,
            staleTime: 5 * 1000 * 60, // 10 minutes
        },
    },
});

const App = (): ReactElement => {
    const locale = AppI18n.getBrowserLocale();

    // global variables set server-side
    const istTryMode = global.memoryPersistence;
    const mapId = parseInt(global.mapId, 10);

    return locale.message ? (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <IntlProvider
                    locale={locale.code}
                    defaultLocale={Locales.EN.code}
                    messages={locale.message as Record<string, string>}
                >
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <Router>
                                <Switch>
                                    <Route exact path="/">
                                        <Redirect to="/c/login" />
                                    </Route>
                                    <Route path="/c/login"
                                        component={LoginPage} 
                                    />
                                    <Route
                                        path="/c/registration"
                                        component={RegistationPage}
                                    />
                                    <Route
                                        path="/c/registration-success"
                                        component={RegistrationSuccessPage}
                                    />
                                    <Route
                                        path="/c/forgot-password"
                                        component={ForgotPasswordPage}
                                    />
                                    <Route
                                        path="/c/forgot-password-success"
                                        component={ForgotPasswordSuccessPage}
                                    />
                                    <Route
                                        exact path="/c/maps/"
                                        component={MapsPage}
                                    />
                                    <Route exact path="/c/maps/:id/edit">
                                        <EditorPage isTryMode={istTryMode} mapId={mapId} />
                                    </Route>
                                    <Route exact path="/c/maps/:id/try">
                                        <EditorPage isTryMode={istTryMode} mapId={mapId} />
                                    </Route>
                                </Switch>
                            </Router>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </IntlProvider>
            </QueryClientProvider>
        </Provider>
    ) : (
        <div>Loading ... </div>
    );
};

export default App;
