import { Octokit } from 'octokit';
import * as dotenv from 'dotenv';
import * as Logger from '../../Logger/Logging';

//import { components } from '@octokit/openapi-types';

//type DirectoryItem = components['schemas']['content-directory'][number];

/**
 * Wrapper for the octokit github client implementation. Used to download repos from github.
 */
export class GithubClient {
  private octokit!: Octokit; // ! indicates that the initilization happens, but not in the constructor.

  /**
   * Authenticates client via an access-token to github.
   * @returns {void}
   */
  authenticateClient(): void {
    try {
      dotenv.config();
      const access_token = process.env.ACCESS_TOKEN;
      if (access_token == undefined) {
        Logger.addToLog('Value of access-token is undefined.', 'Error');
        throw new Error('Value of access-token is undefined.');
      }
      this.octokit = new Octokit({ auth: access_token });
    } catch (err) {
      console.error('Authentication with access-token failed.');
      Logger.addToLog('Authentication with access-token failed.', 'Error');
      throw err;
    }
  }

  /**
   * Downloads the github repo with the given url.
   * @param {string} url The repo url.
   * @returns {Promise<DirectoryItem[]>} The content of the repo.
   */
  // async downloadRepo(url: string): Promise<DirectoryItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async downloadRepo(url: string): Promise<any> {
    let repoOwner = '';
    let repoName = '';
    try {
      let repoInfo = this.filterRepoInfoFromURL(url);
      if (repoInfo != null) {
        repoOwner = repoInfo[0];
        repoName = repoInfo[1];
      } else {
        throw new Error('Could not find repository');
      }
      //unauthenticated requests, the rate limit allows you to make up to 60 requests per hour
      const res = await this.octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: '',
      });
      const data = res.data;
      if (!Array.isArray(data)) {
        return [];
      }
      return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.status == '404') {
        throw `Repository with URL ${url} not found.`;
      } else {
        throw err;
      }
    }
  }

  /**
   * Extracts the username and repository name form a github URL.
   * @param {string} url URL to the github repository.
   * @returns {string[]} A string array containing the extracted username and repository name
   */
  filterRepoInfoFromURL(url: string): string[] | undefined {
    try {
      let re = new RegExp('github.com(/|:)([\\w-]+)/([\\w-.]+)');
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
        Logger.addToLog('Invalid GitHub link.', 'Error');
        throw new Error('Invalid GitHub link.');
      }
    } catch (err) {
      console.log(err);
    }
  }

   // Response Schema:
  // https://docs.github.com/en/rest/rate-limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async checkRateLimit(){
    return await this.octokit.request('GET /rate_limit', {});
  }
}
