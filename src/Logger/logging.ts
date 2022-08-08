import * as winston from 'winston';
import { PackageInfo } from '../Domain/model/packageInfo';

/**
 * Custom logging levels:
 * License: no license information found in bom file
 * ExtRefs: not external references found in bom file
 * Copyright: unable to extract copyright notice from external refs.
 * Error: error messages.
 * Debug: debug messages.
*/
export type Level = 'License' | 'ExtRefs' | 'Copyright' | 'Error' | 'Debug';

/**
 * Wrapper class for winston logger instances. Passes messages to the corresponding logger unit based on the level.
 */
export class Logger {
    private static instance: Logger;
    licenseLogger!: winston.Logger;
    errorLogger!: winston.Logger;
    debugLogger!: winston.Logger;

    private constructor() {
        this.initializeLogger();
        Logger.instance = this;
    }

    public static getInstance(){
        return this.instance ?? new Logger();
    }

    /**
     * Adds an entry to the log file.
     * @param {string} message The message to be logged. .
     * @param {string} level The level of the log message.
     */
    addToLog(message: string, level: Level): void {
        switch (level) {
            case 'Error':
                this.errorLogger.log({
                    level: level,
                    message: message
                });
                return;
            case 'Debug':
                this.debugLogger.log({
                    level: level,
                    message: message
                });
                return;
            default:
                this.licenseLogger.log({
                    level: level,
                    message: message
                });
        }
    }

    /**
     * Initializes the logger instances used for documenting
     * packages where no copyright notice could be found and error messages.
     */
    private initializeLogger(): void {
        this.licenseLogger = winston.createLogger({
            levels: { License: 0, ExtRefs: 1, Copyright: 2 },
            format: winston.format.simple(),
            transports: [
                new winston.transports.File({ filename: 'copyright.log', level: 'Copyright' })
            ],
        });
        this.errorLogger = winston.createLogger({
            levels: { Error: 0 },
            format: winston.format.simple(),
            transports: [
                new winston.transports.File({ filename: 'error.log', level: 'Error' })
            ],
        });
        this.debugLogger = winston.createLogger({
            levels: { Debug: 0 },
            format: winston.format.simple(),
            transports: [
                new winston.transports.File({ filename: 'debug.log', level: 'Debug' })
            ],
        });
    }
    
    /**
     * Generates a log message from the info of the given package depending on the given level.
     * @param {PackageInfo} packageInfo Entry from bom.json containing information for one package.
     * @param {string} level The level of the log message.
     * @returns {string} The message to be added to the log.
     */
    public static generateLogMessage(packageInfo: PackageInfo, level: string): string {
        switch (level) {
            case 'License':
                return "No License found for: " + packageInfo.toString();
            case 'ExtRefs':
                return "No external references found for: " + packageInfo.toString();
            case 'Copyright':
                return "Unable to extract copyright notice for: " + packageInfo.toString();
            default:
                return '';
        }
}


}
