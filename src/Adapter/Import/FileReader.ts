import {readFileSync} from 'fs';
import { Logger, LogLevel } from '../../Logging/Logging';


import {printError} from '../../Logging/ErrorFormatter';

/**
 * General Input parser used to read bom files. Implementation for parsing the bom files
 * is implemented in subclasses for the specific data format.
 */
export class FileReader {
    /**
     * Reads the bom file at the given url.
     */
    readInput(url: string): string {
        try {
            return readFileSync(url).toString();
        } catch (err) {
            const log = new Logger();
            log.addToLog(`Couldn't load bom.json from ${url}.`, LogLevel.ERROR);
            printError(`Error: Couldn't load bom.json from ${url}.`);
            process.exit(1);
        }
    }
}
