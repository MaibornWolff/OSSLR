/* eslint-disable no-useless-escape */
import { readFileSync } from 'fs';
import * as path from 'path';
import { Octokit } from 'octokit';
import * as util from './util.js';
import { insertCopyrightInformation } from './copyright.js';

main();

function main() {
    let githubClient = createGithubClient();
    if (githubClient == null) {
        return;
    }
    util.initializeLogger();
    let bomPath = path.join('out', 'bom.json');
    try {
        let rawData = readFileSync(bomPath);
        let jsonData = JSON.parse(rawData);
        insertCopyrightInformation(jsonData, githubClient);
    } catch (err) {
        console.error(`Couldn't load bom.json from ${bomPath}.`);
    }
}

function createGithubClient() {
    try {
        const accessToken = readFileSync('access-token', 'utf8');
        return new Octokit({ auth: accessToken });
    } catch (err) {
        console.error('Authentication with access-token failed.');
        console.error(err);
        return null;
    }
}
