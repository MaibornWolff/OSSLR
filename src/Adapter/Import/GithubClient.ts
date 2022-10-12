import {Octokit} from 'octokit';
import * as dotenv from 'dotenv';
import * as Logger from '../../Logging/Logging';
import {printError} from '../../Logging/ErrorFormatter';


/**
 * Wrapper for the octokit GitHub client implementation. Used to download repos from github.
 */
export class GithubClient {
    private octokit!: Octokit; // ! indicates that the initialization happens, but not in the constructor.

    /**
     * Authenticates client via an access-token to GitHub.
     * @returns {void}
     */
    async authenticateClient(): Promise<void> {
        try {
            dotenv.config();
            const access_token = process.env.ACCESS_TOKEN;
            if (access_token == undefined) {
                Logger.addToLog('Value of access-token is undefined.', 'Error');
                printError('Error: Value of access-token is undefined.');
                process.exit(1);
            }
            this.octokit = new Octokit({auth: access_token});
            await this.octokit.request('GET /rate_limit', {});
        } catch (err) {
            printError('Error: Authentication with access-token failed.');
            Logger.addToLog('Authentication with access-token failed.', 'Error');
            process.exit(1);
        }
    }

    /**
     * Downloads the GitHub repo with the given url.
     * @param {string} url The repo url.
     * @returns {Promise<any>} The content of the repo.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async downloadRepo(url: string): Promise<any> {
        let repoOwner = '';
        let repoName = '';
        try {
            let repoInfo = this.filterRepoInfoFromURL(url);
            // check whether filtering worked or is undefined
            if (repoInfo) {
                repoOwner = repoInfo[0];
                repoName = repoInfo[1];
            }
            //unauthenticated requests, the rate limit allows you to make up to 60 requests per hour
            // what happens if owner and name both ''
            const res = await this.octokit.rest.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: '',
            });
            return res.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            return err;
        }
    }

    /**
     * Extracts the username and repository name form a GitHub URL.
     * @param {string} url URL to the GitHub repository.
     * @returns {string[]} A string array containing the extracted username and repository name
     */
    filterRepoInfoFromURL(url: string): string[] | undefined {
        try {
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
                return undefined;
            }
        } catch (err) {
            Logger.addToLog(`Failed to filter out repository from GitHub link ${url}`, 'Warning');
            return undefined;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async checkRateLimit(): Promise<any> {
        try {
            return await this.octokit.request('GET /rate_limit', {});
        } catch (err) {
            Logger.addToLog('Failed to acces GitHub rate limit', 'Error');
        }

    }
}
