import {PackageInfo} from '../Model/PackageInfo';
import {License} from '../Model/License';
import * as Logger from '../../Logging/Logging';
import {printError} from '../../Logging/ErrorFormatter';
import {CycloneDX} from '../Model/CycloneDX';

/**
 * Input Parser implementation for the CycloneDX format. Extracts package information from the bom file and stores them in a PackageInfo object.
 */
export class CycloneDXParser {
    format: string;

    constructor(format: string) {
        this.format = format;
    }

    /**
     * Hands the given bom file to the parser for the corresponding data format. Throws an error if the format is not supported.
     * @param {string} data The content of the bom file to be parsed.
     * @returns {PackageInfo[]} List of PackageInfo objects containing the extracted information.
     */
    parseInput(data: string): CycloneDX {
        switch (this.format) {
            case 'json':
                return JSON.parse(data);
            default:
                Logger.addToLog(`Error: Failed to parse file of this unsupported file format: \"filename.${this.format}\".`, 'Error');
                printError(
                    `Error: Failed to parse file of this unsupported file format: \"filename.${this.format}\".`
                );
                process.exit(1);
        }
    }

    /**
     * Parser for bom files in json format.
     * @param data The content of the bom file to be parsed.
     * @returns List of PackageInfo objects containing the extracted information.
     */
    parseCycloneDX(data: CycloneDX): PackageInfo[] {
        const packageInfos = [];
        if (!data.components)
            return [];
        for (const pkg of data.components) {
            const licenses = [];
            const licensesPerPkg = this.extractLicensesFromPkg(pkg.licenses);
            let copyright = '';
            for (const j in licensesPerPkg) {
                licenses.push(licensesPerPkg[j]);
            }
            const extRefs = [];
            if (pkg['externalReferences']) {
                for (const j in pkg['externalReferences']) {
                    extRefs.push(pkg['externalReferences'][j]['url']);
                }
            }
            if (pkg.copyright) {
                copyright = pkg.copyright;
            }
            const packageInfo = new PackageInfo(
                pkg['group'] ?? '',
                pkg['name'] ?? '',
                pkg['version'] ?? '',
                licenses,
                extRefs,
                '',
                copyright
            );
            packageInfos.push(packageInfo);
        }
        return packageInfos;
    }

    /**
     * Parser bom files, that parses the license attribute to a License object
     * @param bomLicenses Array of licenses in bom format from a particular package.
     * @returns List of License objects containing the extracted information.
     */
    extractLicensesFromPkg(bomLicenses: any): License[] {
        const licenses = [];
        for (const j in bomLicenses) {
            let licenseId: string;
            let licenseUrl: string;
            const license = JSON.parse(JSON.stringify(bomLicenses[j]));
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
                url: licenseUrl,
            });
        }
        return licenses;
    }
}
