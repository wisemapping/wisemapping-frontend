import { sessionExpired } from "../../redux/clientSlice";
import Client from "../client";
import MockClient from "../client/mock-client";
import RestClient from "../client/rest-client";


interface Config {
    apiBaseUrl: string;
    analyticsAccount?: string;
    recaptcha2Enabled: boolean;
    recaptcha2SiteKey?: string;
    clientType: 'mock' | 'rest';
}

class _AppConfig {

    private defaultInstance: Config = {
        apiBaseUrl: '/',
        clientType: 'mock',
        recaptcha2Enabled: true,
        recaptcha2SiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    }

    private getInstance(): Config {
        // Config can be inserted in the html page to define the global properties ...
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result = (window as any).serverconfig;
        if (!result) {
            result = this.defaultInstance;
        }

        return result;
    }

    isRecaptcha2Enabled(): boolean {
        const config = this.getInstance();
        return config.recaptcha2Enabled;
    }

    getRecaptcha2SiteKey(): string | undefined {
        const config = this.getInstance();
        return config.recaptcha2SiteKey;
    }

    getGoogleAnalyticsAccount(): string | undefined {
        const config = this.getInstance();
        return config.analyticsAccount;
    }

    buildClient(): Client {

        const config = this.getInstance();
        let result: Client;
        if (config.clientType == 'rest') {
            result = new RestClient(config.apiBaseUrl, () => {
                sessionExpired();
            });
            console.log('Service using rest client. ' + JSON.stringify(config));
        } else {
            console.log('Warning:Service using mockservice client');
            result = new MockClient();
        }
        return result;
    }
}
const AppConfig = new _AppConfig();

export default AppConfig;