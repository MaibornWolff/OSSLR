import { Octokit } from 'octokit';
import { components  } from "@octokit/openapi-types";
import * as dotenv from "dotenv";


type DirectoryItem = components["schemas"]["content-directory"][number];
/**
 * Wrapper for the octokit github client implementation. Used to download repos from github.
 */
export class GithubClient {
    private octokit!: Octokit; // ! indicates that the initilization happens, but not in the constructor.

    /**
     * Authenticates client via an access-token to github.
     * @returns {void}
     */
    authenticateClient(): void{
        try{
            dotenv.config();
            const access_token = process.env.ACCESS_TOKEN;
            if(access_token == undefined){
                console.log("Please set your access token as an environment variable: ACCESS_TOKEN=\"your-token\".");
                return;
            }
            this.octokit = new Octokit({ auth: access_token})
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
        let repoOwner = '';
        let repoName = '';
        try {
            let repoInfo = this.filterRepoInfoFromURL(url);
            if(repoInfo != null){
                repoOwner = repoInfo[0];
                repoName = repoInfo[1];
            } else {
                console.log(url)
                throw new Error('Could not find repository');
            }
            const {data}   = await this.octokit.rest.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: ''
            });
            return data;
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
            let re = new RegExp('github.com\/([\\w\-]+)\/([\\w\-\.]+)');
            let filtered = re.exec(url);
            let user = '';
            let repo = '';
            if(filtered != null){
                user = filtered[1];
                repo = filtered[2].replace(new RegExp('.git$'), '');
                return [user, repo];
            }else{
                throw new Error('Invalid GitHub link.');  
            }
        } catch (err) {
            console.log(err);
        }
    }
}
