"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLogMessage = exports.generatePackageName = exports.addToLog = exports.initializeLogger = void 0;
/* eslint-disable indent */
const winston_1 = require("winston");
let licenseLogger = null;
let errorLogger = null;
let debugLogger = null;
/**
 * Initializes the logger instances used for documenting
 * packages where no copyright notice could be found and error messages.
 * Uses custom levels:
 * license: no license information found in bom file
 * extRefs: not external references found in bom file
 * copyright: unable to extract copyright notice from external refs.
 * error: error messages.
 */
function initializeLogger() {
    licenseLogger = (0, winston_1.createLogger)({
        levels: { License: 0, ExtRefs: 1, Copyright: 2 },
        format: winston_1.format.simple(),
        transports: [
            new winston_1.transports.File({ filename: 'copyright.log', level: 'Copyright' })
        ],
    });
    errorLogger = (0, winston_1.createLogger)({
        levels: { Error: 0 },
        format: winston_1.format.simple(),
        transports: [
            new winston_1.transports.File({ filename: 'error.log', level: 'Error' })
        ],
    });
    debugLogger = (0, winston_1.createLogger)({
        levels: { Debug: 0 },
        format: winston_1.format.simple(),
        transports: [
            new winston_1.transports.File({ filename: 'debug.log', level: 'Debug' })
        ],
    });
}
exports.initializeLogger = initializeLogger;
/**
 * Adds an entry to the log file.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {string} level The level of the log message.
 */
function addToLog(message, level) {
    if (level == 'Error') {
        errorLogger.log({
            level: level,
            message: message
        });
    }
    else if (level == 'Debug') {
        debugLogger.log({
            level: level,
            message: message
        });
    }
    else {
        licenseLogger.log({
            level: level,
            message: message
        });
    }
}
exports.addToLog = addToLog;
/**
 * Generates a name for the given package in the form: "group-name-version".
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {string} The generated name for the package.
 */
function generatePackageName(packageInfo) {
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
exports.generatePackageName = generatePackageName;
/**
 * Generates a log message from the info of the given package depending on the given level.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {string} level The level of the log message.
 * @returns {string} The message to be added to the log.
 */
function generateLogMessage(packageInfo, level) {
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
exports.generateLogMessage = generateLogMessage;
