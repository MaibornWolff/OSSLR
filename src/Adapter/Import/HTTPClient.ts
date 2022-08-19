import Axios from 'axios';

export class HTTPClient {
    /**
     * Performs a GET request for the given URL.
     * @param {string} url  The URL for the request.
     * @returns {Promise<string>} Of the result of the GET request.
     */
    public makeGetRequest(url: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            Axios.get(url).then(
                (response) => {
                    let result = response.data;
                    resolve(result);
                },
                (error) => {
                    reject(error);
                },
            );
        });
    }
}    
    
   