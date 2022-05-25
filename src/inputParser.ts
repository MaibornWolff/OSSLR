import { PackageInfo } from './packageInfo';
import { readFileSync } from 'fs';

export abstract class InputParser {
    format: string;

    constructor(format: string) {
        this.format = format;
    }

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
