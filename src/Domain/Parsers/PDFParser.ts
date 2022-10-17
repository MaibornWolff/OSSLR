import {PackageInfo} from '../Model/PackageInfo';

export class PDFParser {
    parse(packageInfos: PackageInfo[]): string[][][] {
        let col = ['Index', 'Group', 'Name', 'Version', 'License', 'Copyright'];
        let rows: string[][] = [];
        packageInfos.forEach((packageInfo, index) => {
            rows.push([
                (index + 1).toString(),
                packageInfo.group,
                packageInfo.name,
                packageInfo.version,
                this.extractLicense(packageInfo),
                packageInfo.copyright
            ]);
        });
        return [[col], rows];
    }

    extractLicense(packageInfo: PackageInfo) {
        if (packageInfo.licenses.length === 0 || !packageInfo.licenses[0]['id']) {
            return '';
        }
        return packageInfo.licenses[0]['id'];
    }

    parseLicenseTexts(packageInfos: PackageInfo[]): string[][][] {
        let col = ['Index', 'Group', 'Name', 'LicenseText'];
        let rows: string[][] = [];

        packageInfos.forEach((packageInfo, index) => {
            let groupPdf: string;
            let namePdf: string;
            let licenseTextPdf: string;

            if (packageInfo.group !== '') {
                groupPdf = packageInfo.group;
            } else {
                groupPdf = 'no group';
            }

            if (packageInfo.name !== '') {
                namePdf = packageInfo.name;
            } else {
                namePdf = 'no name';
            }

            if (packageInfo.licenseTexts.length >= 1) {
                licenseTextPdf = packageInfo.licenseTexts[0];
                for (let i = 1; i < packageInfo.licenseTexts.length; i++) {
                    licenseTextPdf += '\n\n\n';
                    licenseTextPdf += packageInfo.licenseTexts[i];

                }
            } else {
                licenseTextPdf = 'no license text available';
            }
            rows.push([(index + 1).toString(), groupPdf, namePdf, licenseTextPdf]);
        });

        return [[col], rows];
    }

}
