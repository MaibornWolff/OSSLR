import { InputParser } from './inputParser';
import { PackageInfo } from '../../../Domain/model/packageInfo';
import { License } from '../../../Domain/model/license';

/**
 * Input Parser implementation for the CycloneDX format. Extracts package information from the bom file and stores them in a PackageInfo object.
 */
export class CycloneDXParser extends InputParser {
    constructor(format: string) {
        super(format);
    }

    /**
     * Hands the given bom file to the parser for the corresponding data format. Throws an error if the format is not supported.
     * @param {string} data The content of the bom file to be parsed.
     * @returns {PackageInfo[]} List of PackageInfo objects containing the extracted information.
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
            let licensesProPkg = this.extractLicensesFromPkg(pkg['licenses']);
            for (let j in licensesProPkg) {
                licenses.push(licensesProPkg[j]);
            }
            let extRefs = [];
            for (let j in pkg['externalReferences']) {
                extRefs.push(pkg['externalReferences'][j]['url']);
            }
            let packageInfo = new PackageInfo(
                pkg['group'],
                pkg['name'],
                pkg['version'],
                licenses,
                extRefs,
                [],
                '',
                ''
            );
            packageInfos.push(packageInfo);
        }
        return packageInfos;
    }

    extractLicensesFromPkg(parsedLicense: []): License[] {
        let licenses = [];
        for (let j in parsedLicense) {
            let licenseId: string;
            let licenseUrl: string;
            let license = JSON.parse(JSON.stringify(parsedLicense[j]));
            if (license['license']['id']) {
                licenseId = license['license']['id'];
            } else if (license['license']['name']) {
                licenseId = license['license']['name'];
            } else {
                licenseId = 'no id';
            }
            if (license['license']['url']) {
                licenseUrl = license['license']['url'];
            } else {
                licenseUrl = 'no url';
            }
            licenses.push({
                id: licenseId,
                url: licenseUrl
            })
        }
        return licenses;
    }
}
