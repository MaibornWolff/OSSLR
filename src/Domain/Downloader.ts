import { GithubClient } from '../Adapter/Import/GithubClient';
import { HTTPClient } from '../Adapter/Import/HTTPClient';
import * as Logger from '../Logger/Logging';

/**
 * Downloads license and README files from github and the content of other external websites.
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
      console.error('Failed to authenticate GitHub client');
      Logger.addToLog('Failed to authenticate GitHub client' , 'Error');
      process.exit(1);
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
   * @returns {[string, string]} The content of the license file. Empty string if none was found.
   */
  async downloadDataFromGithub(url: string): Promise<[string, string]> {
    let readme = '';
    let license = '';
    try {
      const data = await this.githubClient.downloadRepo(url);
      if (!Array.isArray(data)) {
         console.error('Could not find repository');
         Logger.addToLog('Could not find repository', 'Error');
         process.exit(1);
      }
      for (let i = 0; i < data.length; i++) {
        let fileName = data[i].name;
        if (
          fileName.toLowerCase() === 'license' ||
          fileName.match(new RegExp('license.[w]*', 'i'))
        ) {
          //license = await this.urlRequestHandler(data[i], url);
          license = await this.httpClient.makeGetRequest(data[i]['download_url']);

        } else if (
          fileName.toLowerCase() === 'readme' ||
          fileName.match(new RegExp('readme.[w]*', 'i'))
          ) {
          //readme = await this.urlRequestHandler(data[i], url);
          readme = await this.httpClient.makeGetRequest(data[i]['download_url']);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      Logger.addToLog(err, 'Error');
      process.exit(1);
    }
    console.log('Kebab');
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

  /**
   * Returns an object with usefull information to determine how many Requests are still available for GitHub API
   * For more information: https://docs.github.com/en/rest/rate-limit
   * @returns {Promise<{ limit: number, used: number, remaining: number, reset: number }} request rate object 
   */
  async getRemainingRateObj(): Promise<{ limit: number, used: number, remaining: number, reset: number }>{
    let limitObject = this.githubClient.checkRateLimit();
    const {rate} = (await limitObject).data;
    return rate;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async urlRequestHandler(file: any, url: string) : Promise<string>{
    let download_url = file['download_url'];
    if(!download_url){
      console.warn(`Invalid downlaod URL for ${file.name} file, repository URL: ${url}`);
      Logger.addToLog(`Invalid downlaod URL for ${file.name} file, repository URL: ${url}`, 'Warning');
      return '';
    }

    const result = await this.httpClient.makeGetRequest(url);
    if (!(typeof result === 'string')){
      console.warn(`Get request failed for ${file.name} file from: ${url}`);
      Logger.addToLog(`Get request failed for ${file.name} file from: ${url}`, 'Warning');
      return '';
    }
    return result;

  }
}
