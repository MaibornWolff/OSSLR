import { PackageInfo } from './packageInfo';
import { readFileSync } from 'fs';

/**
 * General Input parser used to read bom files. Implementation for parsing the bom files
 * is implemented in subclasses for the specific data format.
 */
export abstract class InputParser {
    format: string;

    constructor(format: string) {
        this.format = format;
    }

    /**
     * Reads the bom file at the given url.
     * @param url The url of the bom file.
     * @returns The content of the bom file.
     */
    readInput(url: string): string {
        try {
            return readFileSync(url).toString();
        } catch (err) {
            console.error(`Couldn't load bom.json from ${url}.`);
            throw (err);
        }
    }
    abstract parseInput(url: string): PackageInfo[];
}
