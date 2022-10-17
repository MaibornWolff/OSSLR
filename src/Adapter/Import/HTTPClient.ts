import axios from 'axios';
import * as Logger from '../../Logging/Logging';

export class HTTPClient {
    /**
     * Performs a GET request for the given URL.
     * @param {string} url  The URL for the request.
     * @returns {Promise<string>} Of the result of the GET request.
     */

    async makeGetRequest(url: string): Promise<any> {
        return await axios.get(url).then(
            (response) => {
                let result: string = response.data;
                return result;
            },
            // In case request fails returns empty string
            () => {
                Logger.addToLog(`Get Request failed for ${url}`, 'Warning');
                return '';
            },
        );
    }
}    
    
   