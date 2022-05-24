"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterRepoInfoFromURL = exports.hasExternalRefs = exports.hasLicense = exports.insertCopyrightIntoBom = exports.removeOverheadFromCopyright = exports.insertCopyrightInformation = void 0;
/* eslint-disable no-useless-escape */
const fs_1 = require("fs");
const cli_progress_1 = require("cli-progress");
const path = require("path");
const axios_1 = require("axios");
const util = require("./util");
/**
 * Main loop of the script, coordinating the download of license information, the extraction of
 * the copyright notice and the insertion of the information into the existing bom.
 * @param {object} jsonData Content of the bom.json file.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 */
async function insertCopyrightInformation(jsonData, githubClient) {
    console.log(typeof githubClient);
    console.log('Retrieving License Information...');
    const progBar = new cli_progress_1.SingleBar({}, cli_progress_1.Presets.shades_classic);
    progBar.start(jsonData['components'].length, 0);
    for (let i in jsonData['components']) {
        progBar.increment();
        let packageInfo = jsonData['components'][i];
        if (!hasLicense(packageInfo)) {
            let message = util.generateLogMessage(packageInfo, 'License');
            util.addToLog(message, 'License');
            continue;
        }
        if (!hasExternalRefs(packageInfo)) {
            let message = util.generateLogMessage(packageInfo, 'ExtRefs');
            util.addToLog(message, 'ExtRefs');
            continue;
        }
        let copyright = await retrieveCopyrightInformation(packageInfo, githubClient);
        if (copyright == '') {
            let message = util.generateLogMessage(packageInfo, 'Copyright');
            util.addToLog(message, 'Copyright');
            continue;
        }
        copyright = removeOverheadFromCopyright(copyright);
        packageInfo = insertCopyrightIntoBom(packageInfo, copyright);
    }
    progBar.stop();
    console.log('Done!');
    try {
        (0, fs_1.writeFileSync)(path.join('out', 'updatedBom.json'), JSON.stringify(jsonData, null, '\t'));
    }
    catch (err) {
        console.error(err);
    }
}
exports.insertCopyrightInformation = insertCopyrightInformation;
/**
 * Removes html tags and other artifacts not filtered out
 * by the regex from the copyright string.
 * @param {string} copyright The original extracted copyright notice.
 * @returns {string} The updated copyright notice.
 */
function removeOverheadFromCopyright(copyright) {
    // remove everything in brackets except the (c)
    let re = /\([^)]*\)|<[^>]*>/g;
    let matches = copyright.match(re);
    for (let i in matches) {
        if (matches[i].toLowerCase() != '(c)') {
            copyright = copyright.replace(matches[i], '');
        }
    }
    // remove unnecessary whitespace
    return copyright.replace(/\s\s+/g, ' ').trim();
}
exports.removeOverheadFromCopyright = removeOverheadFromCopyright;
/**
 * Adds a new entry containing the copyright notice to the bom.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {string} copyright The copyright notice to be inserted.
 * @returns {object} The updated json entry.
 */
function insertCopyrightIntoBom(packageInfo, copyright) {
    packageInfo['licenses'][0]['license'].copyright = copyright;
    return packageInfo;
}
exports.insertCopyrightIntoBom = insertCopyrightIntoBom;
/**
 * Extracts copyright notice from license file or website.
 * @param {string} license Content of a license file or website potentially containing copyright notice.
 * @returns {string} Extracted copyright notice. Empty string if no matches found.
 */
function extractCopyright(license) {
    const regExps = [
        new RegExp('(©|\\(c\\))? ?copyright (©|\\(c\\))? ?[0-9]+.*', 'i'),
        new RegExp('(©|\\(c\\)) copyright.*', 'i'),
        new RegExp('copyright (©|\\(c\\)).*', 'i'),
        new RegExp('copyright [0-9]+.*', 'i')
    ];
    for (let i in regExps) {
        if (license.match(regExps[i])) {
            return regExps[i].exec(license)[0];
        }
    }
    if (license.match(new RegExp('copyright.*', 'i'))) {
        util.addToLog(new RegExp('copyright.*', 'i').exec(license)[0], 'Debug');
    }
    return '';
}
/**
 * Checks whether the bom contains license information for the given package.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {boolean} Whether the packageInfo contains a license.
 */
function hasLicense(packageInfo) {
    return Array.isArray(packageInfo['licenses']) && packageInfo['licenses'].length > 0;
}
exports.hasLicense = hasLicense;
/**
 * Checks whether the bom contains external references for the given package.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {boolean} Whether the packageInfo contains external references.
 */
function hasExternalRefs(packageInfo) {
    return Array.isArray(packageInfo['externalReferences']) && packageInfo['externalReferences'].length > 0;
}
exports.hasExternalRefs = hasExternalRefs;
/**
 * Downloads license information and tries to extract copyright notice from it.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 * @returns {string} The extracted copyright notice. Empty string if none was found.
 */
async function retrieveCopyrightInformation(packageInfo, githubClient) {
    const extRefs = packageInfo['externalReferences'];
    let license = '';
    let copyright = '';
    for (let i in extRefs) {
        let url = extRefs[i]['url'];
        if (url.includes('github.com')) {
            license = await downloadLicenseFromGithub(url, githubClient);
        }
        else {
            license = await downloadLicenseFromExternalWebsite(url);
        }
        if (license == '') {
            continue;
        }
        try {
            let fileName = util.generatePackageName(packageInfo);
            if (!(0, fs_1.existsSync)(path.join('out', 'licenses'))) {
                (0, fs_1.mkdirSync)(path.join('out', 'licenses'));
            }
            (0, fs_1.writeFileSync)(path.join('out', 'licenses', `${fileName}.txt`), license);
        }
        catch (err) {
            console.error(err);
        }
        copyright = extractCopyright(license);
        if (copyright !== '') {
            return copyright;
        }
    }
    return copyright;
}
/**
 * Downloads the content of the github repository with the given URL and
 * returns the license file if it exists.
 * @param {string} url The API-URL of the github repository.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 * @returns {string} The content of the license file. Empty string if none was found.
 */
async function downloadLicenseFromGithub(url, githubClient) {
    let repoInfo = filterRepoInfoFromURL(url);
    let repoOwner = repoInfo[0];
    let repoName = repoInfo[1];
    let license = '';
    try {
        let repoContent = await githubClient.rest.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: ''
        });
        for (let i in repoContent['data']) {
            let fileName = repoContent['data'][i]['name'];
            if (fileName.toLowerCase() === 'license' || fileName.match(new RegExp('license\.[\w]*'), 'i')) {
                license = await makeGetRequest(repoContent['data'][i]['download_url']);
            }
        }
    }
    catch (err) {
        if (err.status == '404') {
            util.addToLog(`Repository with URL ${url} not found.`, 'Error');
        }
        else {
            util.addToLog(err, 'Error');
        }
        return license;
    }
    return license;
}
/**
 * Downloads the website with the given URL.
 * @param {string} url The URL of the website to be downloaded.
 * @returns {string} A string containing the content of the website as html.
 */
async function downloadLicenseFromExternalWebsite(url) {
    try {
        return await makeGetRequest(url);
    }
    catch (err) {
        let errorMessage = `AxiosError: ${err.code}.`;
        if (err.response) {
            errorMessage = `Request ${url} failed with status ${err['response']['status']}. ${err['response']['statusText']}.`;
        }
        else if (err.code == 'ENOTFOUND') {
            errorMessage = `No response for the request ${url}.`;
        }
        util.addToLog(errorMessage, 'Error');
        return '';
    }
}
/**
 * Extracts the username and repository name form a github URL.
 * @param {string} url URL to the github repository.
 * @returns {string[]} A string array containing the extracted username and repository name
 */
function filterRepoInfoFromURL(url) {
    let re = new RegExp('github.com\/([\\w\-]+)\/([\\w\-\.]+)');
    let filtered = re.exec(url);
    let user = filtered[1];
    let repo = filtered[2].replace(new RegExp('.git$'), '');
    return [user, repo];
}
exports.filterRepoInfoFromURL = filterRepoInfoFromURL;
/**
 * Performs a GET request for the given URL.
 * @param {string} url  The URL for the request.
 * @returns {promise} Of the result of the GET request.
 */
function makeGetRequest(url) {
    return new Promise(function (resolve, reject) {
        axios_1.default.get(url).then((response) => {
            var result = response.data;
            resolve(result);
        }, (error) => {
            reject(error);
        });
    });
}
