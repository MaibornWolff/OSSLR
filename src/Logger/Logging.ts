import * as winston from 'winston';
import {PackageInfo} from '../Domain/Model/PackageInfo';

/**
 * Custom logging levels:
 * License: no license information found in bom file
 * Copyright: unable to extract copyright notice from external refs.
 * Error: error messages.
 * Debug: debug messages.
 * Warning: warning messages.
 */
export type Level = 'License' | 'Error' | 'Debug' | 'Warning';

let logger: winston.Logger;

/**
 * Adds an entry to the log file.
 * @param {string} message The message to be logged. .
 * @param {string} level The level of the log message.
 */
export function addToLog(message: string, level: Level): void {
    logger.log({
        level: level,
        message: message,
    });
}

/**
 * Initializes the logger instances used for documenting
 * packages where no copyright notice could be found and error messages.
 */
export function initializeLogger(): void {
    logger = winston.createLogger({
        levels: {Error: 0, Warning: 1},
        format: winston.format.simple(),
        transports: [
            new winston.transports.File({filename: 'error.log', level: 'Error'}),
        ],
    });
}

/*
* Initilize silent Logger, to stop logging
*/
export function initializeSilentLogger(): void {
    initializeLogger();
    logger.transports[0].silent = true;
}

/**
 * Generates a log message from the info of the given package depending on the given level.
 * @param {PackageInfo} packageInfo Entry from bom.json containing information for one package.
 * @param {string} level The level of the log message.
 * @returns {string} The message to be added to the log.
 */
export function generateLogMessage(
    packageInfo: PackageInfo,
    level: string
): string {
    switch (level) {
        case 'License':
            return 'No License found for: ' + packageInfo.toString();
        case 'ExtRefs':
            return 'No external references found for: ' + packageInfo.toString();
        case 'Copyright':
            return (
                'Unable to extract copyright notice for: ' + packageInfo.toString()
            );
        default:
            return '';
    }
}
