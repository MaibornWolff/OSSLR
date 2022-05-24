"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-useless-escape */
const fs_1 = require("fs");
const path = require("path");
const octokit_1 = require("octokit");
const util = require("./util");
const copyright_1 = require("./copyright");
main();
function main() {
    let githubClient = createGithubClient();
    if (githubClient == null) {
        return;
    }
    util.initializeLogger();
    let bomPath = path.join('out', 'bom.json');
    try {
        let rawData = (0, fs_1.readFileSync)(bomPath);
        let jsonData = JSON.parse(rawData.toString());
        (0, copyright_1.insertCopyrightInformation)(jsonData, githubClient);
    }
    catch (err) {
        console.error(`Couldn't load bom.json from ${bomPath}.`);
    }
}
function createGithubClient() {
    try {
        const accessToken = (0, fs_1.readFileSync)('access-token', 'utf8');
        return new octokit_1.Octokit({ auth: accessToken });
    }
    catch (err) {
        console.error('Authentication with access-token failed.');
        console.error(err);
        return null;
    }
}
