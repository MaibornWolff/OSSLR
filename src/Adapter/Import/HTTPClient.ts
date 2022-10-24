import axios from 'axios';
import * as Logger from '../../Logging/Logging';
import {Nullable, SPDXLicenses} from '../../Domain/Model/SPDXLicenses';
import {SPDXLicenseDetails} from '../../Domain/Model/SPDXLicenseDetails';

export class HTTPClient {
    private readonly success = 200;

    /**
     * Performs a GET request for the given URL.
     */
    async getWebsite(url: string): Promise<string> {
        const {data, status} = await axios.get<string>(url);
        if (status != this.success) {
            Logger.addToLog(`Error: Request for url ${url} failed with stats ${status}`, 'Error');
            return '';
        }
        return data;
    }

    async getLicense(url: string): Promise<Nullable<SPDXLicenses>> {
        const {data, status} = await axios.get<SPDXLicenses>(url);
        if (status != this.success) {
            Logger.addToLog(`Error: Request for url ${url} failed with stats ${status}`, 'Error');
            return null;
        }
        return data;
    }

    async getLicenseDetails(url: string): Promise<Nullable<SPDXLicenseDetails>> {
        const {data, status} = await axios.get<SPDXLicenseDetails>(url);
        if (status != this.success) {
            Logger.addToLog(`Error: Request for url ${url} failed with stats ${status}`, 'Error');
            return null;
        }
        return data;
    }
}    
