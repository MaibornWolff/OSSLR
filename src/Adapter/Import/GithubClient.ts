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
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async downloadRepo(repoOwner: string, repoName: string): Promise<any> {
        //unauthenticated requests, the rate limit allows you to make up to 60 requests per hour
        // what happens if owner and name both ''
        const res = await this.octokit.rest.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: '',
        });
        return res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    /**
     * Checks the remaining GitHub rate limmit.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async checkRateLimit(): Promise<any> {
        try {
            return await this.octokit.request('GET /rate_limit', {});
        } catch (err) {
            Logger.addToLog('Failed to acces GitHub rate limit', 'Error');
        }

    }
}
