import { writeFileSync } from 'fs';
import path = require('path');
import { PackageInfo } from '../model/packageInfo';
import { Exporter } from './exporter';

export class CycloneDXExporter implements Exporter {
    exportBom(packageInfos: PackageInfo[], format: string, originalBom: string): void {
        switch (format) {
            case 'json':
                this.exportJson(packageInfos, originalBom);
                break;
            default:
                throw new Error(`Unsupported export file format: ${format}`);
        }
    }

    exportJson(packageInfos: PackageInfo[], originalBom: string) {
        let bomJson = JSON.parse(originalBom);
        bomJson = this.insertCopyrightIntoBom(packageInfos, bomJson)
        try {
            writeFileSync(path.join('out', 'updatedBom.json'), JSON.stringify(bomJson, null, 4));
        } catch (err) {
            console.error(err);
        }
    }
    
    insertCopyrightIntoBom(packageInfos: PackageInfo[], bomJson: object) {
        for (let i = 0; i < packageInfos.length; i++) {
            let copyright = packageInfos[i].copyright;
            if (copyright !== '') {
                console.log(bomJson['components']);
                bomJson['components'][i]['copyright'] = copyright;
            }
        }
        return bomJson;
    }
}
