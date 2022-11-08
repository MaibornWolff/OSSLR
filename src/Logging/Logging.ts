import * as winston from 'winston';
import {PackageInfo} from '../Domain/Model/PackageInfo';


export class Logger {
    private static instance: Logger;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private logger: winston.Logger;

    /**
     * Custom logging levels:
     * License: no license information found in bom file
     * Copyright: unable to extract copyright notice from external refs.
     * Error: error messages.
     * Debug: debug messages.
     * Warning: warning messages.
     */

    constructor() {
        this.initializeLogger();
    }

    public static getInstance() {
        if (!this.instance)
            this.instance = new Logger();
        return this.instance;
    }

    public static setSilent() {
        if (!this.instance) {
            this.instance = new Logger();
        }
        this.instance.logger.transports[0].silent = true;
    }

    /**
     * Initializes the logger instances used for documenting
     * packages where no copyright notice could be found and error messages.
     */
    private initializeLogger(): void {
        this.logger = winston.createLogger({
            levels: {Error: 0, Warning: 1, License: 2, Copyright: 3},
            format: winston.format.simple(),
            transports: [
                new winston.transports.File({filename: 'error.log', level: 'Copyright'}),
            ],
        });
    }

    /**
     * Adds an entry to the log file.
     */
    public addToLog(message: string, level: LogLevel): void {
        this.logger.log({
            level: level,
            message: message,
        });
    }

    /**
     * Generates a log message from the info of the given package depending on the given level.
     */
    private generateLogMessage(
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
}

export enum LogLevel {
    LICENSE = 'License',
    ERROR = 'Error',
    DEBUG = 'Debug',
    WARNING = 'Warning',
}