/* eslint-disable @typescript-eslint/no-explicit-any */
import {PackageInfo} from './Model/PackageInfo';
import {License} from './Model/License';
import * as Logger from '../Logging/Logging';
import {CycloneDX} from './Model/CycloneDX';

/**
 * Converts the PackageInfo back to json
 */
export class JSONConverter {

    /**
     * Insert copyright attribute to bom json object
     */
    insertCopyrightIntoBom(packageInfos: PackageInfo[], bomJson: CycloneDX): CycloneDX {
        if (!bomJson.components) {
            return bomJson;
        }
        for (let i = 0; i < packageInfos.length; i++) {
            const copyright = packageInfos[i].copyright;
            if (copyright !== '') {
                bomJson.components[i].copyright = copyright;
            }
        }
        return bomJson;
    }

    /**
     * Parses PackageInfo array into a json object
     */
    parsePkgInfo(packageInfos: PackageInfo[]): any {
        const components = [];
        for (let i = 0; i < packageInfos.length; i++) {
            const p = packageInfos[i];
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
     */
    licenseToBOM(licenses: License[]): object {
        const result = [];
        for (let i = 0; i < licenses.length; i++) {
            result.push({license: {id: licenses[i].id, url: licenses[i].url}});
        }
        return result;
    }

    /**
     * Parses License for bom json object
     */
    addMissingEntries(packageInfos: PackageInfo[], bomJson: CycloneDX) {
        const components = bomJson['components'];
        if (components) {
            components.concat(this.parsePkgInfo(packageInfos).components);
            return bomJson;
        } else {
            Logger.addToLog('Failed to insert a new entry into the bom file.', 'Error');
            return bomJson;
        }
    }
}
