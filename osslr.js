const fs = require('fs');
const path = require('path');
const octokit = require("octokit");
const cliProgress = require('cli-progress');
const axios = require('axios');
var githubClient;

try {
    const accessToken = fs.readFileSync('access-token', 'utf8');
    githubClient = new octokit.Octokit({ auth: accessToken });
    main();
} catch (err) {
    console.error("Authentication with access-token failed.");
    console.error(err);
}

function main() {
    try {
        let bomPath = path.join("out", "bom.json");
        let rawdata = fs.readFileSync(bomPath);
        let jsonData = JSON.parse(rawdata);
        insertCopyrightInformation(jsonData);
    } catch (err) {
        console.error(`Couldn't load bom.json from ${bomPath}.`)
    }
}

async function insertCopyrightInformation(jsonData) {
    console.log(`Retreiving License Information...`);
    const progBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progBar.start(jsonData["components"].length, 0);
    for (let x in jsonData["components"]) {
        progBar.increment();
        let packageInfo = jsonData["components"][x];
        if (!hasLicense(packageInfo)) {
            //TODO log packages without license
            continue;
        }
        if (!hasExternalRefs(packageInfo)) {
            //TODO log packages without external refs
            continue;
        }
        let copyright = await retrieveCopyrightInformation(packageInfo, x);
        if (copyright !== "") {
            insertCopyrightIntoBom(packageInfo, copyright);
        }
    }
    progBar.stop();
    console.log("Done!");
}

function insertCopyrightIntoBom(packageInfo, copyright) {
    //TODO Add functionality to insert copyright into pom.json
}

function extractCopyright(packageData) {
    //TODO Add extraction functionality
}

function hasLicense(packageInfo) {
    // Check if cdxgen found license
    return packageInfo["licenses"] !== []
}

function hasExternalRefs(packageInfo) {
    // Check if any external resources exist
    return typeof packageInfo["externalReferences"] !== 'undefined';
}


async function retrieveCopyrightInformation(packageInfo, x) {
    const extRefs = packageInfo["externalReferences"];
    let license = null;
    for (let y in extRefs) {
        url = extRefs[y]["url"];
        if (url.includes("github.com")) {
            //license = await downloadLicenseFromGithub(url);
        } else {
            license = await downloadLicenseFromExternalWebsite(url, x);
        }
        if (license === null) {
            continue;
        }
        try {
            let fileName = generateFileName(packageInfo);
            fs.writeFileSync(path.join("out", "licenses", `${fileName}.txt`), license);
        } catch (err) {
            console.error(err);
        }
        let copyright = extractCopyright(license);
        if (copyright !== "") {
            return copyright;
        }
    }
    handleNoCopyrightFound(packageInfo);
    return "";
}

function generateFileName(packageInfo) {
    let fileName = "";
    if (packageInfo["group"] != "") {
        fileName += packageInfo["group"] + "-";
    }
    if (packageInfo["name"] != "") {
        fileName += packageInfo["name"] + "-";
    }
    if (packageInfo["version"] != "") {
        fileName += packageInfo["version"];
    }
    if (fileName === "") {
        fileName = "unnamed";
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
            repo: repoName
        });
        for (let i in repoContent["data"]) {
            let fileName = repoContent["data"][i]["name"];
            if (fileName.toLowerCase() === "license" || fileName.toLowerCase().match(new RegExp("license\.[\w]*"))) {
                return await makeGetRequest(repoContent["data"][i]["download_url"]);
            }
        }
    } catch (err) {
        if (err.status == "404") {
            console.error(`\nRepository with URL:${url} not found.`);
        } else {
            console.error(err);
            console.error(`${repoOwner}/${repoName}`);
        }
        return null;
    }
    return null;
}

async function downloadLicenseFromExternalWebsite(url, x) {
    try {
        return await makeGetRequest(url);
    } catch(err) {
        if (err["response"] !== undefined) {
             console.error(`\nError: Request failed with status ${err["response"]["status"]}. ${err["response"]["statusText"]}.`);
        } else {
            console.error(err);
        }
        return null;        
    }
}

function filterRepoInfoFromURL(url) {
    let re = new RegExp("github.com\/([\\w\-]+)\/([\\w\-\.]+)");
    url = re.exec(url);
    let user = url[1];
    let repo = url[2].replace(new RegExp(".git$"), "");
    return [user, repo];
}

function makeGetRequest(path) {
    return new Promise(function (resolve, reject) {
        axios.get(path).then(
            (response) => {
                var result = response.data;
                resolve(result);
            },
            (error) => {
                reject(error);
            }
        );
    });
}

function writeToFile(content, packageInfo, directory) {
    try {
        let fileName = generateFileName(packageInfo);
        fs.writeFileSync(path.join("out", directory, fileName), content);
    } catch (err) {
        console.error(err);
    }
}