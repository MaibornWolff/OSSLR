import {PackageInfo} from '../Model/PackageInfo';

/**
 * Converts the PackageInfos into the table format for the PDF output
 */
export class PDFParser {
    parse(packageInfos: PackageInfo[]): string[][][] {
        const col = ['Index', 'Group', 'Name', 'Version', 'License', 'Copyright'];
        const rows: string[][] = [];
        packageInfos.forEach((packageInfo, index) => {
            rows.push([
                (index + 1).toString(),
                packageInfo.group,
                packageInfo.name,
                packageInfo.version,
                packageInfo.licenses[0] ? packageInfo.licenses[0]['id'] : '',
                packageInfo.copyright
            ]);
        });
        return [[col], rows];
    }
}
