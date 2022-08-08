import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');
import { PackageInfo } from '../../Domain/model/packageInfo';
import { Exporter } from './exporter';
import { BOMFile } from './../../Domain/model/updatedBOM'

export class CycloneDXExporter implements Exporter {
    export(packageInfos: PackageInfo[], format: string, originalBom: string): void {
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
        bomJson = this.insertCopyrightIntoBom(packageInfos, bomJson);
        try {
            if (!existsSync('out')) {
                mkdirSync('out');
            }
            writeFileSync(path.join('out', 'updatedBom.json'), JSON.stringify(bomJson, null, 4));
        } catch (err) {
            console.error(err);
        }
    }

    insertCopyrightIntoBom(packageInfos: PackageInfo[], bomJson: BOMFile ) {
        for (let i = 0; i < packageInfos.length; i++) {
            let copyright = packageInfos[i].copyright;
            if (copyright !== '') {
                bomJson['components'][i]['copyright'] = copyright;
            }
        }
        return bomJson;
    }
}
