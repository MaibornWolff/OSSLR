import { PackageInfo } from '../model/PackageInfo';

export class PDFParser {
    parse(packageInfos: PackageInfo[]): any {
        let col = ["Group", "Name", "Version", "License", "Copyright"];
        let rows : string[][] = []

        let groupPdf: string;
        let namePdf: string;
        let versionPdf: string;
        let licensePdf: string;
        let copyrightPdf: string;

        packageInfos.forEach(packageInfo => {
            if (packageInfo.group !== '') {
                groupPdf = packageInfo.group;
            } else {
                groupPdf = "no group";
            }

            if (packageInfo.name !== '') {
                namePdf = packageInfo.name;
            } else {
                namePdf = "no name";
            }

            if (packageInfo.version !== '') {
                versionPdf = packageInfo.version;
            } else {
                versionPdf = "no version";
            }

            licensePdf = this.extractLicense(packageInfo);

            if (packageInfo.copyright !== '') {
                copyrightPdf = packageInfo.copyright;
            } else {
                copyrightPdf = "no copyright";
            }
            rows.push([groupPdf, namePdf, versionPdf, licensePdf, copyrightPdf]);
        });
       return [[col], rows]
    }

    extractLicense(packageInfo: PackageInfo){
        if (packageInfo.licenses.length > 0) {
            if (packageInfo.licenses[0]['id']) {
                return packageInfo.licenses[0]['id'];
            } else {
                return "no license";
            }
        } else {
            return "no license";
        }
    }
}