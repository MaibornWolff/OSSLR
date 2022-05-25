import { InputParser } from "./inputParser";
import { PackageInfo } from "./packageInfo";

export class CycloneDXParser extends InputParser {
    constructor(format: string) {
        super(format);
    }

    parseInput(data: string): PackageInfo[] {
        switch (this.format) {
            case 'json':
                return this.parseJSON(data);
            default:
                throw new Error(`Unsupported file format ${this.format}`);
        }
    }

    private parseJSON(data: string): PackageInfo[] {
        let rawData = JSON.parse(data);
        let packageInfos = [];
        for (let i in rawData['components']) {                  
            let pkg = rawData['components'][i];
            console.log(pkg);
            let licenses = [];
            for (let j in pkg['licenses']) {
                licenses.push(pkg['licenses'][j]);
            }
            let extRefs = [];
            for (let j in pkg['externalReferences']) {
                extRefs.push(pkg['externalReferences'][j]['url']); 
            }
            let packageInfo = {
                group: pkg['group'],
                name: pkg['name'],
                version : pkg['version'],
                licenses: licenses,
                externalReferences: extRefs
            };
            packageInfos.push(packageInfo);
        }
        return packageInfos;
    }
}
