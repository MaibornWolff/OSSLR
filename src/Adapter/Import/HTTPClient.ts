import axios from 'axios';
import {Nullable, SPDXLicenses} from '../../Domain/Model/SPDXLicenses';
import {SPDXLicenseDetails} from '../../Domain/Model/SPDXLicenseDetails';
import {Logger, LogLevel} from '../../Logging/Logging';

export class HTTPClient {
    private static readonly success = 200;

    /**
     * Performs a GET request for the given URL.
     */
    async getWebsite(url: string): Promise<unknown> {
        const {data, status} = await axios.get<unknown>(url);
        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return '';
        }
        return data;
    }

    async getLicense(url: string): Promise<Nullable<SPDXLicenses>> {
        const {data, status} = await axios.get<SPDXLicenses>(url);
        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return null;
        }
        return data;
    }

    async getLicenseDetails(url: string): Promise<Nullable<SPDXLicenseDetails>> {
        const {data, status} = await axios.get<SPDXLicenseDetails>(url);
        if (status != HTTPClient.success) {
            Logger.getInstance().addToLog(`Error: Request for url ${url} failed with stats ${status}`, LogLevel.ERROR);
            return null;
        }
        return data;
    }
}    
