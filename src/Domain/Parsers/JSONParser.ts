/* eslint-disable @typescript-eslint/no-explicit-any */
import { PackageInfo } from '../../Domain/Model/PackageInfo';
import { License } from '../../Domain/Model/License';


export class JSONParser {
 
  insertCopyrightIntoBom(packageInfos: PackageInfo[], bomJson: any) {
    for (let i = 0; i < packageInfos.length; i++) {
      let copyright = packageInfos[i].copyright;
      if (copyright !== '') {
        bomJson['components'][i]['copyright'] = copyright;
      }
    }
    return bomJson;
  }

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

  licenseToBOM(licenses: License[]): object {
    let result = [];
    for (let i = 0; i < licenses.length; i++) {
      result.push({ license: { id: licenses[i].id, url: licenses[i].url } });
    }
    return result;
  }

  addMissingEntries(packageInfos: PackageInfo[], bomJson: any){
    let components = bomJson['components'];
    if(components){
        bomJson['components'] = components.concat(this.parsePkgInfo(packageInfos).components);
        return bomJson;
    } else {
      console.error('Failed to insert a new entry into the bom file.');
      return bomJson;
    }
  }
}
