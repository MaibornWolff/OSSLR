/* eslint-disable @typescript-eslint/no-explicit-any */
import {PackageInfo} from '../Model/PackageInfo';
import {License} from '../Model/License';
import * as Logger from '../../Logger/Logging';


export class JSONParser {

    /**
     * Insert copyright attribute to bom json object
     * @param {PackageInfo[]} packageInfos PackageInfo array
     * @param {any} bomJson The original extracted bom json object notice.
     * @returns {any} updated bom json object
     */
    insertCopyrightIntoBom(packageInfos: PackageInfo[], bomJson: any): any {
        for (let i = 0; i < packageInfos.length; i++) {
            let copyright = packageInfos[i].copyright;
            if (copyright !== '') {
                bomJson['components'][i]['copyright'] = copyright;
            }
        }
        return bomJson;
    }

    /**
     * Parses PackageInfo array into a json object
     * @param {PackageInfo[]} packageInfos the PackageInfos
     * @returns {any} updated bom json object
     */
    parsePkgInfo(packageInfos: PackageInfo[]): any {
        let components = [];
        for (let i = 0; i < packageInfos.length; i++) {
            let p = packageInfos[i];
            components.push({
                group: p.group,
                name: p.name,
                version: p.version,
                licenses: this.licenseToBOM(p.licenses),
                copyright: p.copyright
            });
        }
        return {'components': components};
    }

    /**
     * Parses License for bom json object
     * @param {License[]} licenses License object
     * @returns {object} updated bom json object
     */
    licenseToBOM(licenses: License[]): object {
        let result = [];
        for (let i = 0; i < licenses.length; i++) {
            result.push({license: {id: licenses[i].id, url: licenses[i].url}});
        }
        return result;
    }

    /**
     * Parses License for bom json object
     * @param {PackageInfo[]} licenses License object
     * @param {any} bomJson bom json object
     * @returns {object} bomJson updated bom json object
     */
    addMissingEntries(packageInfos: PackageInfo[], bomJson: any) {
        let components = bomJson['components'];
        if (components) {
            bomJson['components'] = components.concat(this.parsePkgInfo(packageInfos).components);
            return bomJson;
        } else {
            Logger.addToLog('Failed to insert a new entry into the bom file.', 'Error');
            return bomJson;
        }
    }
}
