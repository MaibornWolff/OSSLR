import axios from 'axios';
import * as Logger from '../../Logging/Logging';

export class HTTPClient {
    /**
     * Performs a GET request for the given URL.
     */
    async makeGetRequest(url: string): Promise<any> {
        return await axios.get(url).then(
            (response) => {
                return response.data;
            },
            // In case request fails returns empty string
            () => {
                Logger.addToLog(`Get Request failed for ${url}`, 'Warning');
                return '';
            },
        );
    }
}    
    
   