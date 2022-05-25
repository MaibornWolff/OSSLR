/* eslint-disable no-useless-escape */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { SingleBar, Presets } from 'cli-progress';
import * as path from 'path';
import Axios from 'axios';
import * as util from './util';
import { Octokit } from 'octokit';
import { Logger } from './logging';
import { PackageId } from 'typescript';
import { PackageInfo } from './packageInfo';
/**
 * Main loop of the script, coordinating the download of license information, the extraction of
 * the copyright notice and the insertion of the information into the existing bom.
 * @param {object} jsonData Content of the bom.json file.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 */
export async function insertCopyrightInformation(jsonData: object, githubClient: Octokit, logger: Logger) {
    console.log('Retrieving License Information...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(jsonData['components'].length, 0);
    for (let i in jsonData['components']) {
        progBar.increment();
        let packageInfo = jsonData['components'][i];
        if (!hasLicense(packageInfo)) {
            let message = util.generateLogMessage(packageInfo, 'License');
            logger.addToLog(message, 'License');
            continue;
        }
        if (!hasExternalRefs(packageInfo)) {
            let message = util.generateLogMessage(packageInfo, 'ExtRefs');
            logger.addToLog(message, 'ExtRefs');
            continue;
        }
        let copyright = await retrieveCopyrightInformation(packageInfo, githubClient, logger);
        if (copyright == '') {
            let message = util.generateLogMessage(packageInfo, 'Copyright');
            logger.addToLog(message, 'Copyright');
            continue;
        }
        copyright = removeOverheadFromCopyright(copyright);
        packageInfo = insertCopyrightIntoBom(packageInfo, copyright);
    }
    progBar.stop();
    console.log('Done!');
    try {
        writeFileSync(path.join('out', 'updatedBom.json'), JSON.stringify(jsonData, null, '\t'));
    } catch (err) {
        console.error(err);
    }
}

/**
 * Removes html tags and other artifacts not filtered out
 * by the regex from the copyright string.
 * @param {string} copyright The original extracted copyright notice.
 * @returns {string} The updated copyright notice.
 */
export function removeOverheadFromCopyright(copyright: string): string {
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

/**
 * Adds a new entry containing the copyright notice to the bom.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {string} copyright The copyright notice to be inserted.
 * @returns {object} The updated json entry.
 */
export function insertCopyrightIntoBom(packageInfo: object, copyright: string): object {
    packageInfo['licenses'][0]['license'].copyright = copyright;
    return packageInfo;
}

/**
 * Extracts copyright notice from license file or website.
 * @param {string} license Content of a license file or website potentially containing copyright notice.
 * @returns {string} Extracted copyright notice. Empty string if no matches found.
 */
function extractCopyright(license: string, logger: Logger): string {
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
        logger.addToLog(new RegExp('copyright.*', 'i').exec(license)[0], 'Debug');
    }
    return '';
}

/**
 * Checks whether the bom contains license information for the given package.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {boolean} Whether the packageInfo contains a license.
 */
export function hasLicense(packageInfo: object): boolean {
    return Array.isArray(packageInfo['licenses']) && packageInfo['licenses'].length > 0;
}

/**
 * Checks whether the bom contains external references for the given package.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {boolean} Whether the packageInfo contains external references.
 */
export function hasExternalRefs(packageInfo: object): boolean {
    return Array.isArray(packageInfo['externalReferences']) && packageInfo['externalReferences'].length > 0;
}

/**
 * Downloads license information and tries to extract copyright notice from it.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 * @returns {string} The extracted copyright notice. Empty string if none was found.
 */
async function retrieveCopyrightInformation(packageInfo: PackageInfo, githubClient: Octokit, logger: Logger): Promise<string> {
    const extRefs = packageInfo['externalReferences'];
    let license = '';
    let copyright = '';
    for (let i in extRefs) {
        let url = extRefs[i]['url'];
        if (url.includes('github.com')) {
            license = await downloadLicenseFromGithub(url, githubClient, logger);
        } else {
            license = await downloadLicenseFromExternalWebsite(url, logger);
        }
        if (license == '') {
            continue;
        }
        try {
            let fileName = util.generatePackageName(packageInfo);
            if (!existsSync(path.join('out', 'licenses'))) {
                mkdirSync(path.join('out', 'licenses'));
            }
            writeFileSync(path.join('out', 'licenses', `${fileName}.txt`), license);
        } catch (err) {
            console.error(err);
        }
        copyright = extractCopyright(license, logger);
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
async function downloadLicenseFromGithub(url: string, githubClient: Octokit, logger: Logger): Promise<string> {
    let repoInfo = util.filterRepoInfoFromURL(url);
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
    } catch (err) {
        if (err.status == '404') {
            logger.addToLog(`Repository with URL ${url} not found.`, 'Error');
        } else {
            logger.addToLog(err, 'Error');
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
async function downloadLicenseFromExternalWebsite(url: string, logger: Logger): Promise<string> {
    try {
        return await makeGetRequest(url);
    } catch (err) {
        let errorMessage = `AxiosError: ${err.code}.`;
        if (err.response) {
            errorMessage = `Request ${url} failed with status ${err['response']['status']}. ${err['response']['statusText']}.`;
        } else if (err.code == 'ENOTFOUND') {
            errorMessage = `No response for the request ${url}.`;
        }
        logger.addToLog(errorMessage, 'Error');
        return '';
    }
}

/**
 * Performs a GET request for the given URL.
 * @param {string} url  The URL for the request.
 * @returns {promise} Of the result of the GET request.
 */
function makeGetRequest(url: string): Promise<string> {
    return new Promise<string>(function (resolve, reject) {
        Axios.get(url).then(
            (response) => {
                var result = response.data;
                resolve(result);
            },
            (error) => {
                reject(error);
            },
        );
    });
}
