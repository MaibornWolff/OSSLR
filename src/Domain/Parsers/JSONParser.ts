import { PackageInfo } from '../../Domain/Model/PackageInfo';
import { BOMFile } from '../../Domain/Model/UpdatedBOM'
import { License } from '../../Domain/Model/License';


export class JSONParser {

    exportResultBomFile(packageInfos: PackageInfo[], format: string, originalBom: string): string {
        let bomJson = JSON.parse(originalBom);
        bomJson = this.insertCopyrightIntoBom(packageInfos, bomJson);
        return bomJson;
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

    exportMissingValuesFile(packageInfos: PackageInfo[], bomPath: string): string | undefined{
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
          
            return JSON.stringify({"components":components}, null, 4);
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