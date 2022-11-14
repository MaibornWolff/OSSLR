import {Octokit} from 'octokit';
import * as dotenv from 'dotenv';
import {printError} from '../../Logging/ErrorFormatter';
import {Logger, LogLevel} from '../../Logging/Logging';


/**
 * Wrapper for the octokit GitHub client implementation. Used to download repos from GitHub.
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
                Logger.getInstance().addToLog('Value of access-token is undefined.', LogLevel.ERROR);
                printError('Error: Value of access-token is undefined.');
                process.exit(1);
            }
            this.octokit = new Octokit({auth: access_token});
            await this.octokit.request('GET /rate_limit', {});
        } catch (err) {
            printError('Error: Authentication with access-token failed.');
            Logger.getInstance().addToLog('Authentication with access-token failed.', LogLevel.ERROR);
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
        try {
            const res = await this.octokit.rest.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: '',
            });
            return res.data;
        } catch (e: any) {
            Logger.getInstance().addToLog(e, LogLevel.ERROR);
        }
        return undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    /**
     * Checks the remaining GitHub rate limit.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async checkRateLimit(): Promise<any> {
        try {
            return await this.octokit.request('GET /rate_limit', {});
        } catch (err) {
            Logger.getInstance().addToLog('Failed to access GitHub rate limit', LogLevel.ERROR);
        }

    }
}
