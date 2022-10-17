import {GithubClient} from '../Adapter/Import/GithubClient';
import {HTTPClient} from '../Adapter/Import/HTTPClient';
import * as Logger from '../Logging/Logging';
import {printError} from '../Logging/ErrorFormatter';

/**
 * Downloads license and README files from GitHub and the content of other external websites.
 */
export class Downloader {
    private githubClient: GithubClient;
    private httpClient: HTTPClient;
    private readonly licenseUrl = 'https://spdx.org/licenses/licenses.json';

    constructor() {
        this.githubClient = new GithubClient();
        this.httpClient = new HTTPClient();
    }

    async authenticateGithubClient() {
        try {
            await this.githubClient.authenticateClient();
        } catch (err) {
            printError('Error: Failed to authenticate GitHub client. Please make sure to provide a valid access token.');
            Logger.addToLog('Failed to authenticate GitHub client. Please make sure to provide a valid access token.', 'Error');
            process.exit(1);
        }
    }

    /**
     * Passes the download task to the GitHub downloader for GitHub URLs
     * and the external website downloader for everything else.
     * @param url The URL to be downloaded.
     * @returns {Promise<[string, string]>} The content of the downloaded license or website.
     */
    async downloadLicenseAndREADME(url: string): Promise<[string, string]> {
        if (url.includes('github.com')) {
            return await this.downloadDataFromGithub(url);
        } else {
            return await this.downloadLicenseFromExternalWebsite(url);
        }
    }

    /**
     * Downloads the content of the GitHub repository with the given URL and
     * returns the license and README file if it exists as a tuple.
     * @param {string} url The API-URL of the GitHub repository.
     * @returns {[string, string]} The content of the license file. Empty string if none was found.
     */
    async downloadDataFromGithub(url: string): Promise<[string, string]> {
        let readme = '';
        let license = '';

        try {
            let [repoName, repoOwner] = this.filterRepoInfoFromURL(url);

            const data = await this.githubClient.downloadRepo(repoOwner, repoName);
            for (let i = 0; i < data.length; i++) {
                let fileName = data[i].name;
                if (
                    fileName.toLowerCase() === 'license' ||
                    fileName.match(new RegExp('license.[a-zA-z]*', 'i'))
                ) {
                    license = await this.urlRequestHandler(data[i], url);
                } else if (
                    fileName.toLowerCase() === 'readme' ||
                    fileName.match(new RegExp('readme.[a-zA-z]*', 'i'))
                ) {
                    readme = await this.urlRequestHandler(data[i], url);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            Logger.addToLog(`${err.status}, Request to ${url} failed.`, 'Warning');
            return ['', ''];
        }
        return [license, readme];
    }

    /**
     * Extracts the username and repository name form a GitHub URL.
     * @param {string} url URL to the GitHub repository.
     * @returns {string[]} A string array containing the extracted username and repository name
     */
    filterRepoInfoFromURL(url: string): string[] {
        let re = new RegExp('github.com([/:])([\\w-]+)/([\\w-.]+)');
        let filtered = re.exec(url);
        let user = '';
        let repo = '';
        if (
            filtered != null &&
            filtered[2] != undefined &&
            filtered[3] != undefined
        ) {
            user = filtered[2];
            repo = filtered[3].replace(new RegExp('.git$'), '');
            return [user, repo];
        } else {
            Logger.addToLog(`Invalid GitHub link for ${url}.`, 'Warning');
            throw new Error(`Invalid GitHub link for ${url}.`);
        }
    }

    /**
     * Downloads the website with the given URL with the assumption that it cannot contain a README file.
     * Therefore, it always returns an empty string for the README part.
     * @param {string} url The URL of the website to be downloaded.
     * @returns {Promise<[string,string]>} A string containing the content of the website as html.
     */
    async downloadLicenseFromExternalWebsite(
        url: string
    ): Promise<[string, string]> {
        try {
            return [await this.httpClient.makeGetRequest(url), ''];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            let errorMessage = `AxiosError: ${err.code}.`;
            if (err.response) {
                errorMessage = `Request ${url} failed with status ${err['response']['status']}. ${err['response']['statusText']}.`;
            } else if (err.code == 'ENOTFOUND') {
                errorMessage = `No response for the request ${url}.`;
            }
            Logger.addToLog(errorMessage, 'Warning');
            return ['', ''];
        }
    }

    /**
     * Returns an object with usefull information to determine how many Requests are still available for GitHub API
     * For more information: https://docs.github.com/en/rest/rate-limit
     * @returns {Promise<{ limit: number, used: number, remaining: number, reset: number }} request rate object
     */
    async getRemainingRateObj(): Promise<{ limit: number, used: number, remaining: number, reset: number }> {
        let limitObject = this.githubClient.checkRateLimit();
        const {rate} = (await limitObject).data;
        return rate;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async urlRequestHandler(file: any, url: string): Promise<string> {
        // download_url !== url, url is here only for proper error message
        let download_url = file['download_url'];
        if (!download_url) {
            Logger.addToLog(`Invalid download URL for ${file.name} file, repository URL: ${url}`, 'Warning');
            return '';
        }
        return await this.httpClient.makeGetRequest(download_url);
    }

    async getLicenses() {
        return (await this.httpClient.makeGetRequest(this.licenseUrl)).licenses;
    }

    async downloadLicenseText(detailsUrl: string) {
        return (await this.httpClient.makeGetRequest(detailsUrl)).licenseText;
    }
}
