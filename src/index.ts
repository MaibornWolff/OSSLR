/* eslint-disable no-useless-escape */
import { readFileSync } from 'fs';
import * as path from 'path';
import { Octokit } from "octokit";
import { insertCopyrightInformation } from './copyright';
import { Logger } from './logging';

main();

function main(): void {
    let githubClient = createGithubClient();
    if (githubClient == null) {
        return;
    }
    let logger = new Logger();
    let bomPath = path.join('out', 'bom.json');
    try {
        let rawData = readFileSync(bomPath);
        let jsonData = JSON.parse(rawData.toString());
        insertCopyrightInformation(jsonData, githubClient, logger);
    } catch (err) {
        console.error(`Couldn't load bom.json from ${bomPath}.`);
    }
}
function createGithubClient(): Octokit {
    try {
        const accessToken = readFileSync('access-token', 'utf8');
        return new Octokit({ auth: accessToken });
    } catch (err) {
        console.error('Authentication with access-token failed.');
        console.error(err);
        return null;
    }
}
