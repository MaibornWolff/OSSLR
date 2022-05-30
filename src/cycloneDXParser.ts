import { InputParser } from "./inputParser";
import { PackageInfo } from "./packageInfo";

/**
 * Input Parser implementation for the CycloneDX format. Extracts package information from the bom file and stores them in a PackageInfo object.
 */
export class CycloneDXParser extends InputParser {
    constructor(format: string) {
        super(format);
    }

    /**
     * Hands the given bom file to the parser for the corresponding data format. Throws an error if the format is not supported.
     * @param data The content of the bom file to be parsed.
     * @returns List of PackageInfo objects containing the extracted information.
     */
    parseInput(data: string): PackageInfo[] {
        switch (this.format) {
            case 'json':
                return this.parseJSON(data);
            default:
                throw new Error(`Unsupported file format ${this.format}`);
        }
    }

    /**
     * Parser for bom files in json format.
     * @param data The content of the bom file to be parsed.
     * @returns List of PackageInfo objects containing the extracted information.
     */
    parseJSON(data: string): PackageInfo[] {
        let rawData = JSON.parse(data);
        let packageInfos = [];
        for (let i in rawData['components']) {
            let pkg = rawData['components'][i];
            let licenses = [];
            for (let j in pkg["licenses"]) {
                licenses.push(pkg['licenses'][j]);
            }
            let extRefs = [];
            for (let j in pkg['externalReferences']) {
                extRefs.push(pkg['externalReferences'][j]['url']);
            }
            let packageInfo: PackageInfo = {
                group: pkg['group'],
                name: pkg['name'],
                version: pkg['version'],
                licenses: licenses,
                externalReferences: extRefs,
                licenseTexts: [],
                copyright: []
            };
            packageInfos.push(packageInfo);
        }
        return packageInfos;
    }
}
