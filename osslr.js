import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Octokit } from 'octokit';
import cliProgress from 'cli-progress';
import Axios from 'axios';
// var problems = '';
// var copyrights = '';
var githubClient;

main();

function main() {
    githubClient = createGithubClient();
    if (githubClient == null) {
        return;
    }
    try {
        let bomPath = join('out', 'bom.json');
        let rawdata = readFileSync(bomPath);
        let jsonData = JSON.parse(rawdata);
        insertCopyrightInformation(jsonData);
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
    }
    return null;
}

async function insertCopyrightInformation(jsonData) {
    console.log(`Retreiving License Information...`);
    const progBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progBar.start(jsonData['components'].length, 0);
    for (let i in jsonData['components']) {
        progBar.increment();
        let packageInfo = jsonData['components'][i];
        if (!hasLicense(packageInfo)) {
            //TODO log packages without license
            continue;
        }
        if (!hasExternalRefs(packageInfo)) {
            //TODO log packages without external refs
            continue;
        }
        let copyright = await retrieveCopyrightInformation(packageInfo);
        if (copyright !== '') {
            insertCopyrightIntoBom(packageInfo, copyright);
        }
    }
    progBar.stop();
    console.log('Done!');
    try {
        writeFileSync(join('out', 'updatedBom.json'), JSON.stringify(jsonData, null, '\t'));
        // writeFileSync(join('out', 'problems.txt'), problems);
        // writeFileSync(join('out', 'copyrights.txt'), copyrights);
    } catch (err) {
        console.error(err);
    }
}

function insertCopyrightIntoBom(packageInfo, copyright) {
    try {
        packageInfo['licenses'][0]['license'].copyright = copyright;
    } catch (err) {
        console.error(err);
    }
}

function extractCopyright(license, packageData) {
    //TODO Finalize extraction functionality
    let re1 = new RegExp('copyright (©|\\(c\\)) [0-9]+.*', 'i');
    let re2 = new RegExp('(©|\\(c\\)) copyright [0-9]+.*', 'i');
    let re3 = new RegExp('copyright [0-9]+.*', 'i');
    if (license.match(re1)) {
        return re1.exec(license)[0];
        // copyrights += re1.exec(license)[0] + '\n';
    } else if (license.match(re2)) {
        return re2.exec(license)[0];
        // copyrights += re2.exec(license)[0] + '\n';
    } else if (license.match(re3)) {
        return re3.exec(license)[0];
        // copyrights += re3.exec(license)[0] + '\n';
    } else if (license.toLowerCase().includes('copyright')) {
        problems += generateFileName(packageData) + '\n';
        return '';
    }
    return '';
}

function hasLicense(packageInfo) {
    // Check if cdxgen found license
    return Array.isArray(packageInfo['licenses']) && packageInfo['licenses'].length > 0;
}

function hasExternalRefs(packageInfo) {
    // Check if any external resources exist
    return typeof packageInfo['externalReferences'] !== undefined;
}


async function retrieveCopyrightInformation(packageInfo) {
    const extRefs = packageInfo['externalReferences'];
    let license = null;
    for (let i in extRefs) {
        let url = extRefs[i]['url'];
        if (url.includes('github.com')) {
            license = await downloadLicenseFromGithub(url);
        } else {
            license = await downloadLicenseFromExternalWebsite(url);
        }
        if (license === null) {
            continue;
        }
        try {
            let fileName = generateFileName(packageInfo);
            writeFileSync(join('out', 'licenses', `${fileName}.txt`), license);
        } catch (err) {
            console.error(err);
        }
        let copyright = extractCopyright(license, packageInfo);
        if (copyright !== '') {
            return copyright;
        }
    }
    handleNoCopyrightFound(packageInfo);
    return '';
}

function generateFileName(packageInfo) {
    let fileName = '';
    if (packageInfo['group'] != '') {
        fileName += packageInfo['group'] + '-';
    }
    if (packageInfo['name'] != '') {
        fileName += packageInfo['name'] + '-';
    }
    if (packageInfo['version'] != '') {
        fileName += packageInfo['version'];
    }
    if (fileName === '') {
        fileName = 'unnamed';
    }
    return fileName.charAt(fileName.length - 1) == '-' ? fileName.substring(0, fileName.length - 1) : fileName;;
}

function handleNoCopyrightFound(packageInfo) {
    //TODO handle no copyright found
}

async function downloadLicenseFromGithub(url) {
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
