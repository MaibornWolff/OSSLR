/* eslint-disable indent */
import { createLogger, transports, format } from 'winston';

let logger = null;

export function initializeLogger() {
    logger = createLogger({
        levels: { license: 0, extRefs: 1, copyright: 2 },
        format: format.simple(),
        transports: [
            new transports.File({ filename: 'combined.log', level: 'copyright' })
        ],
    });
}

export function addToLog(packageInfo, level) {
    let message = generateLogMessage(packageInfo, level);
    if (message == '') {
        return;
    }
    logger.log({
        level: level,
        message: message
    });
}

export function generatePackageName(packageInfo) {
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

function generateLogMessage(packageInfo, level) {
    switch (level) {
        case 'license':
            return `No License found for: ${generatePackageName(packageInfo)}`;
        case 'extRefs':
            return `No external references found for: ${generatePackageName(packageInfo)}`;
        case 'copyright':
            return `Unable to extract copyright notice for: ${generatePackageName(packageInfo)}`;
        default:
            console.error(`Error: Unknown log level: ${level}. No log entry created for package: ${generatePackageName(packageInfo)}`);
            return '';
    }
}
