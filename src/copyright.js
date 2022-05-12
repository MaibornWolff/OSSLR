import { existsSync, mkdirSync, writeFileSync } from 'fs';
import cliProgress from 'cli-progress';
import * as path from 'path';
import Axios from 'axios';
import * as util from './util.js';

//var problems = '';
let copyrights = '';

export async function insertCopyrightInformation(jsonData, githubClient) {
    console.log('Retreiving License Information...');
    const progBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progBar.start(jsonData['components'].length, 0);
    for (let i in jsonData['components']) {
        progBar.increment();
        let packageInfo = jsonData['components'][i];
        if (!hasLicense(packageInfo)) {
            util.addToLog(packageInfo, 'license');
            continue;
        }
        if (!hasExternalRefs(packageInfo)) {
            util.addToLog(packageInfo, 'extRefs');
            continue;
        }
        let copyright = await retrieveCopyrightInformation(packageInfo, githubClient);
        if (copyright == '') {
            util.addToLog(packageInfo, 'copyright');
            continue;
        }
        copyright = removeOverheadFromCopyright(copyright);
        packageInfo = insertCopyrightIntoBom(packageInfo, copyright);
    }
    progBar.stop();
    console.log('Done!');
    try {
        writeFileSync(path.join('out', 'updatedBom.json'), JSON.stringify(jsonData, null, '\t'));
        // writeFileSync(path.join('out', 'problems.txt'), problems);
        writeFileSync(path.join('out', 'copyrights.txt'), copyrights);
    } catch (err) {
        console.error(err);
    }
}

export function removeOverheadFromCopyright(copyright) {
    // remove everything in brackets excpet the (c)
    var re = /\([^)]*\)|<[^>]*>/g;

    let matches = copyright.match(re);
    for (let i in matches) {
        if (matches[i].toLowerCase() != '(c)') {
            copyright = copyright.replace(matches[i], '');
        }
    }
    // remove unnecessary whitespaces
    return copyright.replace(/\s\s+/g, ' ').trim();
}

export function insertCopyrightIntoBom(packageInfo, copyright) {
    try {
        packageInfo['licenses'][0]['license'].copyright = copyright;
        return packageInfo;
    } catch (err) {
        console.error(err);
        return packageInfo;
    }
}

function extractCopyright(license) {
    // Your code goes here. Return copyright notice as a string
    return '';
}

// function extractCopyright(license) {
//     //TODO Finalize extraction functionality
//     let re1 = new RegExp('copyright (©|\\(c\\)) [0-9]+.*', 'i');
//     let re2 = new RegExp('(©|\\(c\\)) copyright [0-9]+.*', 'i');
//     let re3 = new RegExp('copyright [0-9]+.*', 'i');
//     if (license.match(re1)) {
//         copyrights += re1.exec(license)[0] + '\n';
//         return re1.exec(license)[0];
//     } else if (license.match(re2)) {
//         copyrights += re2.exec(license)[0] + '\n';
//         return re2.exec(license)[0];
//     } else if (license.match(re3)) {
//         copyrights += re3.exec(license)[0] + '\n';
//         return re3.exec(license)[0];
//     } else if (license.toLowerCase().includes('copyright')) {
//         // problems += util.generatePackageName(packageInfo) + '\n';
//         return '';
//     }
//     return '';
// }

function hasLicense(packageInfo) {
    // Check if cdxgen found license
    return Array.isArray(packageInfo['licenses']) && packageInfo['licenses'].length > 0;
}

function hasExternalRefs(packageInfo) {
    // Check if any external resources exist
    return typeof packageInfo['externalReferences'] !== 'undefined';
}

async function retrieveCopyrightInformation(packageInfo, githubClient) {
    const extRefs = packageInfo['externalReferences'];
    let license = null;
    for (let i in extRefs) {
        let url = extRefs[i]['url'];
        if (url.includes('github.com')) {
            license = await downloadLicenseFromGithub(url, githubClient);
        } else {
            license = await downloadLicenseFromExternalWebsite(url);
        }
        if (license === null) {
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
        let copyright = extractCopyright(license);
        if (copyright !== '') {
            return copyright;
        }
    }
    return '';
}

async function downloadLicenseFromGithub(url, githubClient) {
    let repoInfo = filterRepoInfoFromURL(url);
    let repoOwner = repoInfo[0];
    let repoName = repoInfo[1];
    try {
        let repoContent = await githubClient.rest.repos.getContent({
            owner: repoOwner,
            repo: repoName,
        });
        for (let i in repoContent['data']) {
            let fileName = repoContent['data'][i]['name'];
            if (fileName.toLowerCase() === 'license' || fileName.match(new RegExp('license\.[\w]*'), 'i')) {
                return await makeGetRequest(repoContent['data'][i]['download_url']);
            }
        }
    } catch (err) {
        if (err.status == '404') {
            console.error(`\nRepository with URL ${url} not found.`);
        } else {
            console.error(err);
            console.error(`${repoOwner}/${repoName}`);
        }
        return null;
    }
    return null;
}

async function downloadLicenseFromExternalWebsite(url) {
    try {
        return await makeGetRequest(url);
    } catch (err) {
        if (err['response'] !== undefined) {
            console.error(`\nError: Request ${url} failed with status ${err['response']['status']}. ${err['response']['statusText']}.`);
        } else {
            console.error(err);
        }
        return null;
    }
}

function filterRepoInfoFromURL(url) {
    let re = new RegExp('github.com\/([\\w\-]+)\/([\\w\-\.]+)');
    url = re.exec(url);
    let user = url[1];
    let repo = url[2].replace(new RegExp('.git$'), '');
    return [user, repo];
}

function makeGetRequest(path) {
    return new Promise(function (resolve, reject) {
        Axios.get(path).then(
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
