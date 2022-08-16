import { PackageInfo } from '../../Domain/model/packageInfo';
import { Exporter } from './exporter';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');



export class MissingValuesExporter implements Exporter {
    export(packageInfos: PackageInfo[]): void{
        try {
            packageInfos.forEach(p  => {
                p.licenseTexts = undefined;
                p.readme = undefined;
             });
            if (!existsSync('out')) {
                mkdirSync('out');
            }
            writeFileSync(path.join('out',  'missingValues.json'),  JSON.stringify(packageInfos, null, 4));
        } catch (err) {
            console.error(err);
        }
    }
}
