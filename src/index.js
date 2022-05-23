"use strict";
exports.__esModule = true;
/* eslint-disable no-useless-escape */
var fs_1 = require("fs");
var path = require("path");
var octokit_1 = require("octokit");
var util = require("./util.js");
var copyright_js_1 = require("./copyright.js");
main();
function main() {
    var githubClient = createGithubClient();
    if (githubClient == null) {
        return;
    }
    util.initializeLogger();
    var bomPath = path.join('out', 'bom.json');
    try {
        var rawData = (0, fs_1.readFileSync)(bomPath);
        var jsonData = JSON.parse(rawData.toString());
        (0, copyright_js_1.insertCopyrightInformation)(jsonData, githubClient);
    }
    catch (err) {
        console.error("Couldn't load bom.json from ".concat(bomPath, "."));
    }
}
function createGithubClient() {
    try {
        var accessToken = (0, fs_1.readFileSync)('access-token', 'utf8');
        return new octokit_1.Octokit({ auth: accessToken });
    }
    catch (err) {
        console.error('Authentication with access-token failed.');
        console.error(err);
        return null;
    }
}
