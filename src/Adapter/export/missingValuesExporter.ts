import { PackageInfo } from '../../Domain/model/packageInfo';
import { License } from '../../Domain/model/license';
import { Exporter } from './exporter';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');



export class MissingValuesExporter implements Exporter {
    export(packageInfos: PackageInfo[], bomPath: string): void{
        try {
             let components = []
             for (let i = 0; i < packageInfos.length; i++){
                let p = packageInfos[i];
                components.push({"name": p.name, 
                    "group":p.group, 
                    "version":p.version,
                    "licenses": this.licenseToBOMJSON(p.licenses),
                    "copyright": ''
                })
             }
            if (!existsSync('out')) {
                mkdirSync('out');
            }
            writeFileSync(bomPath,  JSON.stringify({"components":components}, null, 4));
        } catch (err) {
            console.error(err);
        }
    }

    licenseToBOMJSON(licenses: License[]): any{
        let result = [];
        for (let i = 0; i < licenses.length; i++) {
            result.push({"license":{ "id": licenses[i].id, "url": licenses[i].url}})
        }
        return result;
    }   
}
