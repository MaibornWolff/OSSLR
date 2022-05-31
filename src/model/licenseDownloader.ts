import Axios from 'axios';
import { GithubClient } from './githubClient';
import { Logger } from '../logging';

/**
 * Downloads license files from github and the content of other external websites.
 */
export class LicenseDownloader {
    githubClient: GithubClient;

    constructor() {
        this.githubClient = new GithubClient();
    }

    authenticateGithubClient(tokenUrl) {
        try {
            this.githubClient.authenticate(tokenUrl);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Passes the download task to the github downloader for github URLs
     * and the external website downloader for everything else.
     * @param url The URL to be downloaded.
     * @param logger The logger instance.
     * @returns {Promise<string>} The content of the downloaded license or website.
     */
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
     * @param {Logger} logger The logger instance.
     * @returns {string} The content of the license file. Empty string if none was found.
     */
    async downloadLicenseFromGithub(url: string, logger: Logger): Promise<string> {
        let license = '';
        try {
            let repoContent = await this.githubClient.downloadRepo(url);
            // util.writeLicenseToDisk(JSON.stringify(repoContent, null, 4), 'repocontent');
            for (let i in repoContent['data']) {
                let fileName = repoContent['data'][i]['name'];
                //check if filename = license or license.*
                if (fileName.toLowerCase() === 'license' || fileName.match(new RegExp('license\.[\w]*'), 'i')) {
                    license = await this.makeGetRequest(repoContent['data'][i]['download_url']);
                }
            }
        } catch (err) {
            logger.addToLog(err, 'Error');
            return license;
        }
        return license;
    }

    /**
     * Downloads the website with the given URL.
     * @param {string} url The URL of the website to be downloaded.
     * @param {Logger} logger The logger instance.
     * @returns {Promise<string>} A string containing the content of the website as html.
     */
    async downloadLicenseFromExternalWebsite(url: string, logger: Logger): Promise<string> {
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
     * @returns {Promise<string>} Of the result of the GET request.
     */
    private makeGetRequest(url: string): Promise<string> {
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