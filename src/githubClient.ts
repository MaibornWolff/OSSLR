import { readFileSync } from "fs";
import { Octokit, } from "octokit";
import { Logform, loggers } from "winston";
import { Logger } from "./logging";
import * as util from './util';

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

    private initializeClient(tokenUrl: string, logger: Logger) {

    }

    downloadRepo(url: string, logger: Logger): object {
        let repoInfo = util.filterRepoInfoFromURL(url);
        let repoOwner = repoInfo[0];
        let repoName = repoInfo[1];
        try {
            let repoContent = this.octokit.rest.repos.getContent({
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
            return null;
        }
    }
}