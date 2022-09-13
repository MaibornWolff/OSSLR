import axios, {AxiosError} from 'axios';
import * as Logger from '../../Logger/Logging';

export class HTTPClient {
    /**
     * Performs a GET request for the given URL.
     * @param {string} url  The URL for the request.
     * @returns {Promise<string>} Of the result of the GET request.
     */
    public makeGetRequest(url: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            axios.get(url).then(
                (response) => {
                    let result = response.data;
                    resolve(result);
                },
                (error: AxiosError) => {
                    Logger.addToLog(error.response?.status + ' ' + error.response?.statusText, 'Error');
                    reject(error);
                },
            );
        });
    }
}    
    
   