const fs = require('fs');
const path = require('path');
const octokit = require("octokit");
var githubClient;

try {
    const accessToken = fs.readFileSync('access-token', 'utf8');
    githubClient = new octokit.Octokit({ auth: accessToken });
    main();
} catch (err) {
    console.error(err);
}

function main() {
    let rawdata = fs.readFileSync(path.join("out", "bom.json"));
    let jsonData = JSON.parse(rawdata);

    for (let x in jsonData["components"]) {
        let packageInfo = jsonData["components"][x];
        if (!hasLicense(packageInfo)) {
            //TODO log packages without license
            continue;
        }
        if (!hasExternalRefs(packageInfo)) {
            //TODO log packages without external refs
            continue;
        }        
        let copyright = retrieveCopyrightInformation(packageInfo);
        if (copyright !== "") {
            insertCopyrightInformation(packageInfo, copyright);
        }
        //await Sleep(1000);
    }
}

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function insertCopyrightInformation(packageInfo, copyright) {
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


async function retrieveCopyrightInformation(packageInfo) {
    const extRefs = packageInfo["externalReferences"];
    for (let y in extRefs) {
        url = extRefs[y]["url"];
        if (url.includes("github.com")) {
            license = await downloadLicenseFromGithub(url, packageInfo);
        } else {
            license = await downloadLicenseFromExternalWebsite(url);
        }
        if (license === null) {
            continue;
        }
        // try {
        //     let fileName = generateFileName(packageInfo);
        //     fs.writeFileSync(path.join("out", "licenses", `${packageInfo.group}-${packageInfo.name}${y}.txt`), license);
        // } catch (err) {
        //     console.error(err);
        // }
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
    return fileName.charAt(fileName.length - 1) == '-' ? fileName.substring(0,fileName.length - 1) : fileName;;
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
                return licenseFile = await makeGetRequest(repoContent["data"][i]["download_url"]);
            } 
        }
    } catch (err) {
        if (err.status == "404") {
            console.log(`Repository with URL:${url} not found.`);
        } else {
            console.error(err);
            console.log(`${repoOwner}/${repoName}`);
        }
        return null;
    }
    return null;
}

function downloadLicenseFromExternalWebsite(url) {
    //TODO try to download other website and search for copyright notice
    return null;
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
        const axios = require('axios');
        axios.get(path).then(
            (response) => {
                var result = response.data;
                console.log('Processing Request');
                resolve(result);
            },
            (error) => {
                reject(error);
            }
        );
    });
}
