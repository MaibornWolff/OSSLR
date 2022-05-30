import { writeFileSync } from "fs";
import path = require("path");
import { PackageInfo } from "../model/packageInfo";
import { Exporter } from "./exporter";

export class CycloneDXExporter implements Exporter {
    exportbom(packageInfos: PackageInfo[], format: string, originalBom: string): void {
       switch (format) {
           case "json":
               this.exportjson(packageInfos, originalBom);
       }


    }
    exportjson(packageInfos: PackageInfo[], originalBom: string) {
        originalBom = JSON.parse(originalBom);
        originalBom = this.insertCopyrightIntoBom(packageInfos, originalBom)
        try {
            writeFileSync(path.join('out', 'updatedbom.json'), JSON.stringify(originalBom, null, 4));
        } catch (err) {
            console.error(err);
        }
    }
    insertCopyrightIntoBom(packageInfos: PackageInfo[], originalBom: string) {
        for(let i = 0; i < packageInfos.length; i++) {
            let copyright = packageInfos[i].copyright;
            if(copyright !== "") {
                originalBom["components"][i]["copyright"] = copyright;
            }
        }   
        return originalBom;
    }

}


