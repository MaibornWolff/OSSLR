import {PackageInfo} from '../Model/PackageInfo';

export class PDFParser {
    parse(packageInfos: PackageInfo[]): string[][][] {
        let col = ['Index', 'Group', 'Name', 'Version', 'License', 'Copyright'];
        let rows: string[][] = [];

        let groupPdf: string;
        let namePdf: string;
        let versionPdf: string;
        let licensePdf: string;
        let copyrightPdf: string;

        packageInfos.forEach((packageInfo, index) => {
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

            if (packageInfo.version !== '') {
                versionPdf = packageInfo.version;
            } else {
                versionPdf = 'no version';
            }

            licensePdf = this.extractLicense(packageInfo);

            if (packageInfo.copyright !== '') {
                copyrightPdf = packageInfo.copyright;
            } else {
                copyrightPdf = 'no copyright';
            }
            rows.push([(index + 1).toString(), groupPdf, namePdf, versionPdf, licensePdf, copyrightPdf]);
        });
        return [[col], rows];
    }

    extractLicense(packageInfo: PackageInfo) {
        if (packageInfo.licenses.length > 0) {
            if (packageInfo.licenses[0]['id']) {
                return packageInfo.licenses[0]['id'];
            } else {
                return 'no license';
            }
        } else {
            return 'no license';
        }
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
