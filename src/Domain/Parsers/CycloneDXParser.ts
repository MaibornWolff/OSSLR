import { PackageInfo } from '../Model/PackageInfo';
import { License } from '../Model/License';
import * as Logger from '../../Logger/Logging';

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
  parseInput(data: string): PackageInfo[] {
    switch (this.format) {
      case 'json':
        return this.parseJSON(data);
      default:
        Logger.addToLog( `Error: Failed to parse file of this unsupported file format: \"filename.${this.format}\".`, 'Error');
        console.error(
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
  parseJSON(data: string): PackageInfo[] {
    // is this name fitting?
    let rawData = JSON.parse(data);
    let packageInfos = [];
    for (let i in rawData['components']) {
      let pkg = rawData['components'][i];
      let licenses = [];
      let licensesProPkg = this.extractLicensesFromPkg(pkg['licenses']);
      let copyright = '';
      for (let j in licensesProPkg) {
        licenses.push(licensesProPkg[j]);
      }
      let extRefs = [];
      if (pkg['externalReferences']) {
        for (let j in pkg['externalReferences']) {
          extRefs.push(pkg['externalReferences'][j]['url']);
        }
      }
      if (pkg.copyright) {
        copyright = pkg.copyright;
      }
      let packageInfo = new PackageInfo(
        pkg['group'],
        pkg['name'],
        pkg['version'],
        licenses,
        extRefs,
        [],
        '',
        copyright
      );
      packageInfos.push(packageInfo);
    }
    return packageInfos;
  }

  extractLicensesFromPkg(parsedLicense: object[]): License[] {
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
        url: licenseUrl,
      });
    }
    return licenses;
  }
}
