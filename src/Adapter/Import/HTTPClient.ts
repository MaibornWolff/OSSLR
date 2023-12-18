import {Nullable, SPDXLicenses} from '../../Domain/Model/SPDXLicenses';
import {SPDXLicenseDetails} from '../../Domain/Model/SPDXLicenseDetails';
import {Logger, LogLevel} from '../../Logging/Logging';
import {printError} from '../../Logging/ErrorFormatter';

export class HTTPClient {
    private static readonly success = 200;

    /**
     * Performs a GET request for the given URL.
     */
    async getWebsite(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            const status = response.status;
            if (status != HTTPClient.success) {
                Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
                return '';
            }

            const data = response.body?.toString();
            if (data === undefined) {
                Logger.getInstance().addToLog(`Error: Received empty body for request to url ${url}`, LogLevel.ERROR);
                return '';
            }
            return data;
        } catch (e: unknown) {
            printError(`Error: An error occurred when fetching ${url}: \"${e}\"`);
            Logger.getInstance().addToLog(`Error: An error occurred when fetching ${url}: \"${e}\"`, LogLevel.ERROR);
            return '';
        }
    }

    async getLicense(url: string): Promise<Nullable<SPDXLicenses>> {
        const response = await fetch(url);

        const status = response.status;

        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return null;
        }
        return await response.json();
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
