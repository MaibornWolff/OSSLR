import { readFileSync } from "fs";
import { Octokit, } from "octokit";
import { Logform, loggers } from "winston";
import { Logger } from "./logging";
import * as util from './util';

/**
 * Wrapper for the octokit github client implementation. Used to download repos from github.
 */
export class GithubClient {
    private octokit: Octokit;

    constructor(tokenUrl: string, logger: Logger) {
        try {
            const accessToken = readFileSync(tokenUrl, 'utf8');
            this.octokit = new Octokit({ auth: accessToken });
        } catch (err) {
            logger.addToLog(err, 'Error')
            console.error('Authentication with access-token failed.');
            throw err;
        }
    }

    /**
     * Downloads the github repo with the given url.
     * @param url The repo url.
     * @param logger The logger instance.
     * @returns The content of the repo.
     */
    async downloadRepo(url: string, logger: Logger): Promise<Object> {
        let repoInfo = util.filterRepoInfoFromURL(url);
        let repoOwner = repoInfo[0];
        let repoName = repoInfo[1];
        try {
            let repoContent = await this.octokit.rest.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: ''
            });
            return repoContent;
        } catch (err) {
            if (err.status == '404') {
                logger.addToLog(`Repository with URL ${url} not found.`, 'Error');
            } else {
                logger.addToLog(err, 'Error');
            }
            throw err;
        }
    }
}
