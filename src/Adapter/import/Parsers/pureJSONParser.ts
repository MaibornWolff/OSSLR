import { InputParser } from './inputParser';
import { PackageInfo } from '../../../Domain/model/packageInfo';


export class PureJSONParser extends InputParser {
    parseInput(data: string): PackageInfo[] {
        let rawData = JSON.parse(data);
        let packageInfos: PackageInfo[] = []
        for (let i = 0; i < rawData.length; i++) {
            const pkg = rawData[i];
            let packageInfo = new PackageInfo(
                pkg['group'],
                pkg['name'],
                pkg['version'],
                pkg['license'],
                pkg['externalReferences'],
                [], //license texts
                '', // readme
                pkg['copyright']
            );
            packageInfos.push(packageInfo);
        }
        return packageInfos
    }

}

