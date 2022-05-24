import Axios from 'axios'
import { GithubClient } from "./githubClient";
import { Logger } from "./logging";

class LicenseDownloader {
    githubClient: GithubClient;

    constructor(tokenUrl: string) {
        this.githubClient = new GithubClient(tokenUrl);
    }

    async downloadLicense(url: string, logger: Logger): Promise<string> {
        if (url.includes('github.com')) {
            return await this.downloadLicenseFromGithub(url, logger);
        } else {
            return await this.downloadLicenseFromExternalWebsite(url, logger);
        }
    }

    /**
     * Downloads the content of the github repository with the given URL and
     * returns the license file if it exists.
     * @param {string} url The API-URL of the github repository.
     * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
     * @returns {string} The content of the license file. Empty string if none was found.
     */
    private async downloadLicenseFromGithub(url: string, logger: Logger): Promise<string> {
        let license = '';
        let repoContent = this.githubClient.downloadRepo(url, logger);
        for (let i in repoContent['data']) {
            let fileName = repoContent['data'][i]['name'];
            if (fileName.toLowerCase() === 'license' || fileName.match(new RegExp('license\.[\w]*'), 'i')) {
                license = await this.makeGetRequest(repoContent['data'][i]['download_url']);
            }
        }
        return license;
    }

    /**
     * Downloads the website with the given URL.
     * @param {string} url The URL of the website to be downloaded.
     * @returns {string} A string containing the content of the website as html.
     */
    private async downloadLicenseFromExternalWebsite(url: string, logger: Logger): Promise<string> {
        try {
            return await this.makeGetRequest(url);
        } catch (err) {
            let errorMessage = `AxiosError: ${err.code}.`;
            if (err.response) {
                errorMessage = `Request ${url} failed with status ${err['response']['status']}. ${err['response']['statusText']}.`;
            } else if (err.code == 'ENOTFOUND') {
                errorMessage = `No response for the request ${url}.`;
            }
            logger.addToLog(errorMessage, 'Error');
            return '';
        }
    }

    /**
     * Performs a GET request for the given URL.
     * @param {string} url  The URL for the request.
     * @returns {promise} Of the result of the GET request.
     */
    private makeGetRequest(url: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            Axios.get(url).then(
                (response) => {
                    var result = response.data;
                    resolve(result);
                },
                (error) => {
                    reject(error);
                },
            );
        });
    }
}