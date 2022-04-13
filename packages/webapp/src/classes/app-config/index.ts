import Client from "../client";
import CacheDecoratorClient from "../client/cache-decorator-client";
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
        apiBaseUrl: `${window.location.protocol}//${window.location.hostname}:${window.location.port}`,
        clientType: 'mock',
        recaptcha2Enabled: true,
        recaptcha2SiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    }

    isDevelopEnv(): boolean {
        const config = this.getInstance();
        return config.clientType === 'mock';
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
            result = new RestClient(this.getBaseUrl());
            console.log('Service using rest client. ' + JSON.stringify(config));
        } else {
            console.log('Warning:Service using mockservice client');
            result = new MockClient();
        }

        // Wrap with a cache decorator ...
        return new CacheDecoratorClient(result);
    }

    getBaseUrl(): string {
        const config = this.getInstance();
        return config.apiBaseUrl;
    }
}
const AppConfig = new _AppConfig();

export default AppConfig;