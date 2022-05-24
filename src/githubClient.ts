import { readFileSync } from "fs";
import { Octokit,  } from "octokit";
import { Logform } from "winston";
import { Logger } from "./logging";
import * as util from './util';

class GithubClient {
    octokit: Octokit;

    constructor(tokenUrl: string) {
        this.initializeClient(tokenUrl);
    }

    private initializeClient(tokenUrl: string) {
        try {
            const accessToken = readFileSync(tokenUrl, 'utf8');
            this.octokit = new Octokit({ auth: accessToken });
        } catch (err) {
            console.error('Authentication with access-token failed.');
            console.error(err);
        }
    }

    downloadRepo(url: string, logger: Logger): object {
        let repoInfo = util.filterRepoInfoFromURL(url);
        let repoOwner = repoInfo[0];
        let repoName = repoInfo[1];
        let license = '';
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