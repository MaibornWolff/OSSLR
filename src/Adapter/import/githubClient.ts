import { readFileSync } from 'fs';
import { access } from 'fs/promises';
import { Octokit } from 'octokit';

/**
 * Wrapper for the octokit github client implementation. Used to download repos from github.
 */
export class GithubClient {
    private octokit: Octokit;

    authenticateURL(tokenUrl: string) {
        try {
            const accessToken = readFileSync(tokenUrl, 'utf8');
            this.octokit = new Octokit({ auth: accessToken });
        } catch (err) {
            console.error('Authentication with access-token failed.');
            throw err;
        }
    }

    authenticateEnv(){
        try{
            const access_token = process.env.ACCESS_TOKEN;
            if(access_token == undefined){
                console.log("Please set your access token as an environment variable: ACCESS_TOKEN=\"your-token\".");
                return;
            }
            this.octokit = new Octokit({ auth: process.env.ACCESS_TOKEN}) // nochmal anschauen, vielleicht alternative
        } catch(err){
            console.error('Authentication with access-token failed.');
            throw err;
        }
    }

    /**
     * Downloads the github repo with the given url.
     * @param {string} url The repo url.
     * @returns {Promise<unknown>} The content of the repo.
     */
    async downloadRepo(url: string): Promise<unknown> {
        let repoInfo = this.filterRepoInfoFromURL(url);
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
    filterRepoInfoFromURL(url: string): string[] {
        let re = new RegExp('github.com\/([\\w\-]+)\/([\\w\-\.]+)');
        let filtered = re.exec(url);
        let user = filtered[1];
        let repo = filtered[2].replace(new RegExp('.git$'), '');
        return [user, repo];
    }
}
