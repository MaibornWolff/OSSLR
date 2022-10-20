import {SingleBar, Presets} from 'cli-progress';
import {CopyrightParser} from './Parsers/CopyrightParser';
import {CycloneDXParser} from './Parsers/CycloneDXParser';
import {FileReader} from '../Adapter/Import/FileReader';
import {Downloader} from './Downloader';
import {PackageInfo} from './Model/PackageInfo';
import {PDFFileWriter} from '../Adapter/Export/PDFFileWriter';
import {PDFParser} from './Parsers/PDFParser';
import {existsSync, mkdirSync} from 'fs';
import * as path from 'path';
import * as Logger from '../Logging/Logging';
import {JSONFileWriter} from '../Adapter/Export/JSONFileWriter';
import {JSONConverter} from './JSONConverter';
import {printError, printWarning} from '../Logging/ErrorFormatter';
import {CycloneDX} from './Model/CycloneDX';

/**
 * This class is responsible for distributing the different tasks to the responsible classes.
 */
export class LicenseChecker {
    progBar!: SingleBar;
    downloader!: Downloader;
    parser!: CycloneDXParser;
    packageInfos!: PackageInfo[];
    licenseTexts: Map<string, string> = new Map();
    bomPath!: string;
    bomData!: CycloneDX;
    missingValuesPath!: string;
    localDataPath!: string;
    localData: PackageInfo[] = [];
    noCopyrightList: PackageInfo[] = []; // Packages where the copyright has not been found for
    toBeAppended: PackageInfo[] = []; // Packages that are in the input file but not generated by cdxgen
    fileReader!: FileReader;

    /**
     * Initializes the correct parser for the given BOM format.
     * @param bomFormat Format of the BOM.
     * @param bomPath Path to the BOM file.
     */
    async init(bomFormat: string, bomPath: string, localDataPath: string, missingValues: string): Promise<void> {
        this.downloader = new Downloader();
        await this.downloader.authenticateGithubClient();
        this.fileReader = new FileReader();
        this.bomPath = bomPath;
        this.missingValuesPath = missingValues;
        this.localDataPath = localDataPath;
        let dataFormat = bomPath.split('.').pop();
        if (!dataFormat) {
            // data format is the file format and currently only json is supported
            Logger.addToLog(`Invalid file format of ${bomPath}. Currently only JSON files are supported.`, 'Error');
            printError(`Error: Invalid file format of ${bomPath}. Currently only JSON files are supported.`);
            process.exit(1);
        }
        switch (bomFormat) {
            // bomFormat is the actual format of the bom object, currently only cycloneDX is supported
            case 'cycloneDX':
                this.parser = new CycloneDXParser(dataFormat);
                break;
            default:
                Logger.addToLog(`Unsupported Bom Format ${bomFormat}. Currently only CycloneDX format is supported.`, 'Error');
                printError(`Error: Unsupported Bom Format ${bomFormat}. Currently only CycloneDX format is supported.`);
                process.exit(1);
        }
    }

    /**
     * Extracts the package information from the BOM file and saves them in a list of PackageInfo objects.
     */
    retrievePackageInfos(): void {
        try {
            this.bomData = this.parser.parseInput(this.fileReader.readInput(this.bomPath));
            this.packageInfos = this.parser.parseCycloneDX(this.bomData);
        } catch (err) {
            Logger.addToLog(`Unable to parse ${this.bomPath}. Please ensure that it has the correct format (CycloneDX).`, 'Error');
            printError(`Error: Unable to parse ${this.bomPath}. Please ensure that it has the correct format (CycloneDX).`);
            process.exit(1);
        }
    }

    /**
     * Downloads package data, namely the license texts and the readme.
     */
    async extractCopyrightForAllPackages() {
        console.log('Retrieving License Information...');
        this.progBar = new SingleBar({}, Presets.shades_classic);
        this.progBar.start(this.packageInfos.length, 0);
        await Promise.all(this.packageInfos.map((packageInfo) => this.checkExternalReferences(packageInfo)));
        this.progBar.stop();
        console.log('Done!');
    }

    async checkExternalReferences(packageInfo: PackageInfo) {
        for (let url of packageInfo.externalReferences) {
            if (packageInfo.copyright !== '') {
                break;
            }
            let [license, readme] = await this.downloadLicense(url);
            if (license != '') {
                packageInfo.copyright = this.parseCopyright(license);
            }
            if (readme != '' && packageInfo.copyright === '') {
                packageInfo.copyright = this.parseCopyright(license);
            }
        }
        this.progBar.increment();
    }

    async downloadLicense(url: string) {
        let {remaining, reset} = await this.downloader.getRemainingRateObj();
        // Checks how many request are still available to make to GitHub
        if (remaining < 1) {
            let waitTime = Math.abs(reset * 1000 - Date.now()) + 10000;
            Logger.addToLog('GitHub Request limit reached. Waiting for ' + waitTime + 'ms.', 'Warning');
            await new Promise(r => setTimeout(r, waitTime));
        }
        return await this.downloader.downloadLicenseAndREADME(url);
    }

    /**
     * Coordinates the parsing of the downloaded license files.
     */
    parseCopyright(source: string): string {
        let copyrightParser = new CopyrightParser();
        let copyright = copyrightParser.extractCopyright(source);
        if (copyright != '') {
            copyright = copyrightParser.removeOverheadFromCopyright(copyright);
        }
        return copyright;
    }

    /**
     * Extracts the package information from the file with default values and saves them in a list of PackageInfo objects.
     */
    retrieveLocalData(): void {
        if (!this.localDataPath) return;
        if (!existsSync(this.localDataPath)) {
            printWarning(`Error: Defaults file ${this.localDataPath} not found. Default values will be ignored.`);
            Logger.addToLog(`Error: Defaults file ${this.localDataPath} not found. Default values will be ignored.`, 'Error');
            return;
        }
        const localRawData = JSON.parse(this.fileReader.readInput(this.localDataPath));
        this.localData = this.parser.parseCycloneDX(localRawData);
    }

    /**
     * Combines the information that has been retrieves through external references and the ones given by the user.
     */
    combine(): void {
        let local: PackageInfo[] = this.localData;
        let generated: PackageInfo[] = this.packageInfos;
        for (let i = 0; i < local.length; i++) {
            let localDataAdded = false; // change name
            for (let j = 0; j < generated.length; j++) {
                if (
                    generated[j].samePackage(local[i]) && generated[j].isVersionInRangeOf(local[i])
                ) {
                    generated[j].licenses = local[i].licenses;
                    generated[j].copyright = local[i].copyright;
                    localDataAdded = true;
                    // Packages of the same name and group but with different versions
                } else if (generated[j].samePackage(local[i])) {
                    localDataAdded = true;
                    this.toBeAppended.push(local[i]);
                    printWarning('Warning: Version of package did not match in the given local file: ' + local[i].toString() + ' and the generated file by cdxgen: ' + generated[j].toString() + ' possible duplicate created.');
                    Logger.addToLog('Version of package did not match in the given local file: ' + local[i].toString() + ' and the generated file by cdxgen: ' + generated[j].toString() + ' possible duplicate created.', 'Warning');
                }
            }
            if (!localDataAdded) {
                this.toBeAppended.push(local[i]);
            }
        }
    }

    createOutputDir() {
        try {
            if (!existsSync(path.join('out'))) {
                mkdirSync(path.join('out'));
            }
        } catch (err) {
            printError(err);
            Logger.addToLog('Failed to create the out directory', 'Error');
            printError('Error: Failed to create the out directory');
            process.exit(1);
        }
    }

    /**
     * Exports updatedBom.json file and the file tracking packages with missing license/copyright
     */
    exportJSON(): void {
        let jsonParser = new JSONConverter();
        let jsonFileWriter = new JSONFileWriter();
        try {
            // Adding copyrights to packages
            this.bomData = jsonParser.insertCopyrightIntoBom(
                this.packageInfos,
                this.bomData
            );
            // Adding entries which are in the input file but missing in the generated file
            this.bomData = jsonParser.addMissingEntries(this.toBeAppended, this.bomData);

            // this.packageInfos.filter()
            this.packageInfos.forEach((packageInfo) => {
                if (packageInfo.copyright === '') {
                    printWarning('Warning: Failed to collect the necessary information for ' + packageInfo.toString());
                    Logger.addToLog('Failed to collect the necessary information for ' + packageInfo.toString(), 'Warning');
                    this.noCopyrightList.push(packageInfo);
                }
            });


            // Parse packageInfo into an array of Json objects
            let resultMissingValues = jsonParser.parsePkgInfo(
                this.noCopyrightList
            );
            // Stringify results so that they can be written
            const stringBom = JSON.stringify(this.bomData, null, 4);
            const stringMissingValues = JSON.stringify(resultMissingValues, null, 4);

            let newFile = path.join('out', 'updatedBom.json');
            jsonFileWriter.write(newFile, stringBom);
            jsonFileWriter.write(this.missingValuesPath, stringMissingValues);

        } catch (err: any) {
            Logger.addToLog('Failed to export output into a json file', 'Error');
            Logger.addToLog(err, 'Error');
            printError('Error: Failed to export output into a json file');
            process.exit(1);
        }
    }

    async getLicenseTexts() {
        //add to pdf
        let licenses = await this.downloader.getLicenses();
        let licensesIdsInSbom = new Set<string>();
        for (let pkg of this.packageInfos) {
            if (pkg.licenses[0]) {
                let pkgLicenseId = pkg.licenses[0].id ?? pkg.licenses[0].name ?? '';
                if (pkgLicenseId === '') {
                    continue;
                }
                if (!licenses.some((license: { licenseId: string; }) => license.licenseId === this.filterLicenseId(pkgLicenseId))) {
                    printWarning(`Warning: Unable to retrieve License text for package ${pkg.name} with license ${pkgLicenseId}.`);
                    Logger.addToLog(`Warning: Unable to retrieve License text for package ${pkg.name} with license ${pkgLicenseId}.`, 'Warning');
                    continue;
                }
                licensesIdsInSbom.add(licenses.find((license: { licenseId: string; }) => license.licenseId === this.filterLicenseId(pkgLicenseId)).licenseId);
            }
        }
        for (let pkgLicenseId of licensesIdsInSbom) {
            let licenseDetailsUrl = licenses.find((license: { licenseId: string; }) => license.licenseId === this.filterLicenseId(pkgLicenseId)).detailsUrl;
            this.licenseTexts.set(pkgLicenseId, await this.downloader.downloadLicenseText(licenseDetailsUrl));
        }
    }

    private filterLicenseId(pkgLicenseId: string) {
        //TODO Remove Brackets
        if (pkgLicenseId.match(new RegExp(' or ', 'i'))) {
            return pkgLicenseId.split(new RegExp(' or ', 'i'))[0];
        }
        return pkgLicenseId;
    }

    /**
     * Exports updatedBom.pdf file
     */
    exportPDF(): void {
        try {
            let pdfParser = new PDFParser();
            let pdfExporter = new PDFFileWriter();
            // Concat the missing values for pdf export
            this.packageInfos = this.packageInfos.concat(this.toBeAppended);
            let [chead, cbody] = pdfParser.parse(this.packageInfos);
            pdfExporter.export(chead, cbody, this.licenseTexts, 'updatedBom.pdf');
            // let [lhead, lbody] = pdfParser.parseLicenseTexts(this.packageInfos);
            // pdfExporter.export(lhead, lbody, 'licenseTexts.pdf');
        } catch (err: any) {
            Logger.addToLog(err, 'Error');
            printError(err);
        }
    }

    /**
     * Checks whether the bom contains license information for the given package.
     * @param {PackageInfo} packageInfo Entry from bom.json containing information for one package.
     * @returns {boolean} Whether the packageInfo contains a license.
     */
    hasLicense(packageInfo: PackageInfo): boolean {
        return (
            Array.isArray(packageInfo['licenses']) &&
            packageInfo['licenses'].length > 0
        );
    }

    /**
     * Checks whether the bom contains external references for the given package.
     * @param {object} packageInfo Entry from bom.json containing information for one package.
     * @returns {boolean} Whether the packageInfo contains external references.
     */
    hasExternalRefs(packageInfo: PackageInfo): boolean {
        return (
            Array.isArray(packageInfo['externalReferences']) &&
            packageInfo['externalReferences'].length > 0
        );
    }
}
