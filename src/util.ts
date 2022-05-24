/* eslint-disable indent */
/**
 * Generates a name for the given package in the form: "group-name-version".
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {string} The generated name for the package.
 */
export function generatePackageName(packageInfo: object): string {
    let fileName = '';
    if (packageInfo['group'].trim() != '') {
        fileName += packageInfo['group'] + '-';
    }
    if (packageInfo['name'].trim() != '') {
        fileName += packageInfo['name'] + '-';
    }
    if (fileName === '') {
        fileName = 'unnamed-';
    }
    if (packageInfo['version'].trim() != '') {
        fileName += packageInfo['version'];
    }
    return fileName.charAt(fileName.length - 1) == '-' ? fileName.substring(0, fileName.length - 1) : fileName;
}

/**
 * Generates a log message from the info of the given package depending on the given level.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {string} level The level of the log message.
 * @returns {string} The message to be added to the log.
 */
export function generateLogMessage(packageInfo: object, level: string): string {
    switch (level) {
        case 'License':
            return `No License found for: ${generatePackageName(packageInfo)}`;
        case 'ExtRefs':
            return `No external references found for: ${generatePackageName(packageInfo)}`;
        case 'Copyright':
            return `Unable to extract copyright notice for: ${generatePackageName(packageInfo)}`;
        default:
            console.error(`Error: Unknown log level: ${level}. No log entry created for package: ${generatePackageName(packageInfo)}`);
            return '';
    }
}

/**
 * Extracts the username and repository name form a github URL.
 * @param {string} url URL to the github repository.
 * @returns {string[]} A string array containing the extracted username and repository name
 */
 export function filterRepoInfoFromURL(url: string): string[] {
    let re = new RegExp('github.com\/([\\w\-]+)\/([\\w\-\.]+)');
    let filtered = re.exec(url);
    let user = filtered[1];
    let repo = filtered[2].replace(new RegExp('.git$'), '');
    return [user, repo];
}