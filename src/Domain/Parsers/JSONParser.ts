import { PackageInfo } from "../../Domain/Model/PackageInfo";
import { BOMFile } from "../../Domain/Model/UpdatedBOM";
import { License } from "../../Domain/Model/License";

export class JSONParser {
  exportResultToBom(
    packageInfos: PackageInfo[],
    originalBom: string
  ): string {
    let bomJson = JSON.parse(originalBom);
    bomJson = this.insertCopyrightIntoBom(packageInfos, bomJson);
    let str = JSON.stringify(bomJson, null, 4);
    return str;
  }

  insertCopyrightIntoBom(packageInfos: PackageInfo[], bomJson: any) {
    for (let i = 0; i < packageInfos.length; i++) {
      let copyright = packageInfos[i].copyright;
      if (copyright !== "") {
        bomJson["components"][i]["copyright"] = copyright;
      }
    }
    return bomJson;
  }

  exportMissingValues(packageInfos: PackageInfo[]): string {
    let components = [];
    for (let i = 0; i < packageInfos.length; i++) {
      let p = packageInfos[i];
      components.push({
        group: p.group,
        name: p.name,
        version: p.version,
        licenses: this.licenseToBOMJSON(p.licenses),
        copyright: "",
      });
    }
    return JSON.stringify({ "components": components }, null, 4);
  }

  licenseToBOMJSON(licenses: License[]): any {
    let result = [];
    for (let i = 0; i < licenses.length; i++) {
      result.push({ license: { id: licenses[i].id, url: licenses[i].url } });
    }
    return result;
  }
}
