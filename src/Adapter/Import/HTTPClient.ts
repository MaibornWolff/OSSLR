import axios from 'axios';
import * as Logger from '../../Logger/Logging';

export class HTTPClient {
    /**
     * Performs a GET request for the given URL.
     * @param {string} url  The URL for the request.
     * @returns {Promise<string>} Of the result of the GET request.
     */
    
    async makeGetRequest(url: string): Promise<string> {
        let res = await axios.get(url).then(
                (response) => {
                    let result: string = response.data;
                    return result;
                },
                // In case request fails returns empty string
                () => {
                    console.warn(`Get Request failed for ${url}`);
                    Logger.addToLog(`Get Request failed for ${url}`, 'Warning');
                    return '';
                },
            );
        return res;
    }
}    
    
   