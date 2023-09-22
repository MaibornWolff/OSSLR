
import {Nullable, SPDXLicenses} from '../../Domain/Model/SPDXLicenses';
import {SPDXLicenseDetails} from '../../Domain/Model/SPDXLicenseDetails';
import {Logger, LogLevel} from '../../Logging/Logging';

export class HTTPClient {
    private static readonly success = 200;

    /**
     * Performs a GET request for the given URL.
     */
    async getWebsite(url: string): Promise<unknown> {
        const response = await fetch(url);
        const data = await response.body?.toString();
        const status = response.status;

        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return '';
        }
        return data;
    }

    async getLicense(url: string): Promise<Nullable<SPDXLicenses>> {
        const response = await fetch(url);
        
        const status = response.status;

        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return null;
        }
        const data = await response.json();
        return data;
    }

    async getLicenseDetails(url: string): Promise<Nullable<SPDXLicenseDetails>> {
        const response = await fetch(url);
        const data = await response.json();
        const status = response.status;

        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return null;
        }
        return data;
    }
}
