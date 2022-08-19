import { GithubClient } from '../Adapter/Import/GithubClient';
import { HTTPClient } from '../Adapter/Import/HTTPClient';
import * as Logger from '../Logger/Logging';

/**
 * Downloads license and README files from github and the content of other external websites.
 * Name proposals: Web scraper, downloader, data retriever, golden rtriever, data collector, data import,
 *                 data loader,
 */
export class Downloader {
  githubClient: GithubClient;
  httpClient: HTTPClient;

  constructor() {
    this.githubClient = new GithubClient();
    this.httpClient = new HTTPClient();
  }

  authenticateGithubClient() {
    try {
      this.githubClient.authenticateClient();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Passes the download task to the github downloader for github URLs
   * and the external website downloader for everything else.
   * @param url The URL to be downloaded.
   * @param logger The logger instance.
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
   * Downloads the content of the github repository with the given URL and
   * returns the license and README file if it exists as a tuple.
   * @param {string} url The API-URL of the github repository.
   * @param {Logger} logger The logger instance.
   * @returns {[string, string]} The content of the license file. Empty string if none was found.
   */
  async downloadDataFromGithub(url: string): Promise<[string, string]> {
    let readme = '';
    let license = '';
    try {
      const data = await this.githubClient.downloadRepo(url);
      if (!Array.isArray(data)) {
        throw new Error('Could not find repository.');
      }
      for (let i = 0; i < data.length; i++) {
        let fileName = data[i].name;
        if (
          fileName.toLowerCase() === 'license' ||
          fileName.match(new RegExp('license.[w]*', 'i'))
        ) {
          license = await this.httpClient.makeGetRequest(data[i]['download_url']);
        } else if (
          fileName.toLowerCase() === 'readme' ||
          fileName.match(new RegExp('readme.[w]*', 'i'))
          ) {
          readme = await this.httpClient.makeGetRequest(data[i]['download_url']);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      Logger.addToLog(err, 'Error');
      return [license, readme];
    }
    return [license, readme];
  }

  /**
   * Downloads the website with the given URL with the assumption that it cannot contain a README file.
   * Therefore it always return an empty string for the README part.
   * @param {string} url The URL of the website to be downloaded.
   * @param {Logger} logger The logger instance.
   * @returns {Promise<[string,string]>} A string containing the content of the website as html.
   */
  async downloadLicenseFromExternalWebsite(
    url: string
  ): Promise<[string, string]> {
    try {
      return [await  this.httpClient.makeGetRequest(url), ''];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      let errorMessage = `AxiosError: ${err.code}.`;
      if (err.response) {
        errorMessage = `Request ${url} failed with status ${err['response']['status']}. ${err['response']['statusText']}.`;
      } else if (err.code == 'ENOTFOUND') {
        errorMessage = `No response for the request ${url}.`;
      }
      Logger.addToLog(errorMessage, 'Error');
      return ['', ''];
    }
  }
}
