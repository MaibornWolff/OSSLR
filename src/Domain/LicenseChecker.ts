import { SingleBar, Presets } from 'cli-progress';
import { CopyrightParser } from './Parsers/CopyrightParser';
import { CycloneDXParser } from './Parsers/CycloneDXParser';
import { FileReader } from '../Adapter/Import/FileReader';
import { Downloader } from './Downloader';
import { PackageInfo } from './Model/PackageInfo';
import { PDFFileWriter } from '../Adapter/Export/PDFFileWriter';
import { PDFParser } from './Parsers/PDFParser';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as Logger from '../Logger/Logging';
import { JSONFileWriter } from '../Adapter/Export/JSONFileWriter';
import { JSONParser } from './Parsers/JSONParser';

/**
 * This class is responsible for distributing the different tasks to the responsible classes.
 */
export class LicenseChecker {
  parser!: CycloneDXParser;
  packageInfos!: PackageInfo[];
  bomPath!: string;
  bomData!: string;
  missingValuesPath!: string;
  localDataPath!: string | undefined;
  localData: PackageInfo[] = [];
  noCopyrightList: PackageInfo[] = []; // Packages where the copyright has not been found for
  toBeAppended: PackageInfo[] = []; // Packages that are in the input file but not generated by cdxgen
  fileReader!: FileReader;

  /**
   * Initializes the correct parser for the given BOM format.
   * @param bomFormat Format of the BOM.
   * @param bomPath Path to the BOM file.
   */
  init(bomFormat: string, bomPath: string, localDataPath: string | undefined, missingValues: string): void {
    this.fileReader = new FileReader();
    Logger.initializeLogger();
    this.bomPath = bomPath;
    this.missingValuesPath = missingValues;
    this.localDataPath = localDataPath;
    let dataFormat = bomPath.split('.').pop();
    if (!dataFormat) throw new Error('invalid data format');

    switch (bomFormat) {
      case 'cycloneDX':
        this.parser = new CycloneDXParser(dataFormat);
        break;
      default:
        throw new Error(`Unsupported Bom Format ${bomFormat}`);
    }
  }

  /**
   * Extracts the package information from the BOM file and saves them in a list of PackageInfo objects.
   */
  retrievePackageInfos(): void {
    try {
      this.bomData = this.fileReader.readInput(this.bomPath);
      this.packageInfos = this.parser.parseInput(this.bomData);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Coordinates the download of license and README.md files for all packages.
   */
  // change name
  async downloadPackageData() {
    try {
      let downloader = new Downloader();
      downloader.authenticateGithubClient();
      console.log('Retrieving License Information...');
      const progBar = new SingleBar({}, Presets.shades_classic);
      progBar.start(this.packageInfos.length, 0);
      for (let packageInfo of this.packageInfos) {
        progBar.increment();

        /*
        // LOGGING FOR DEBUGGING:
        if (!this.hasLicense(packageInfo)) {
          let message = Logger.generateLogMessage(packageInfo, 'License');
          this.logger.addToLog(message, 'License');
          continue;
        }
        if (!this.hasExternalRefs(packageInfo)) {
          let message = Logger.generateLogMessage(packageInfo, 'ExtRefs');
          this.logger.addToLog(message, 'ExtRefs');
          continue;
        }
        */
        for (let url of packageInfo.externalReferences) {
          let [license, readme] = await downloader.downloadLicenseAndREADME(
            url
          );
          if (license != '') {
            packageInfo.licenseTexts.push(license);
          }
          packageInfo.readme = readme;
        }
      }
      progBar.stop();
      console.log('Done!');
    } catch (err) {
      throw err;
    }
  }

  /**
   * Coordinates the parsing of the downloaded license files.
   */
  parseCopyright(): void {
    let copyrightParser = new CopyrightParser();
    for (let i = 0; i < this.packageInfos.length; i++) {
      let licenseTexts = this.packageInfos[i].licenseTexts; // readability
      for (let j = 0; j < licenseTexts.length; j++) {
        let copyright = copyrightParser.extractCopyright(licenseTexts[j]);
        // if the last license does not contain the copyright check the README
        if (j == licenseTexts.length - 1 && copyright === '') {
          copyright = copyrightParser.extractCopyright(
            this.packageInfos[i].readme
          );
        }
        if (copyright === '') {
          continue;
        }
        copyright = copyrightParser.removeOverheadFromCopyright(copyright);
        this.packageInfos[i].copyright = copyright;
      }
    }
  }
  
  retrieveLocalData(): void{
    if (!this.localDataPath) return;
    if (!existsSync(this.localDataPath)) {
      console.warn('Invalid local file path');
      return;
    }
    const temp = this.fileReader.readInput(this.localDataPath);
    this.localData= this.parser.parseInput(temp);
  }

  // manual vs input vs local...
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
          // To logger 
          console.warn('Version of package did not match in the given local file: ' + local[i].toString() + ' and the generated file by cdxegen: ' + generated[j].toString() + ' possible duplicate created.');
        }
      }
      if (!localDataAdded) {
        this.toBeAppended.push(local[i]);
      }
    }
  }

  exportJSON(): void {
    let jsonParser = new JSONParser();
    let jsonFileWriter = new JSONFileWriter();
    try {
      // Adding copyrights to packages
      let resultBom = JSON.parse(this.bomData);
      resultBom = jsonParser.insertCopyrightIntoBom(
        this.packageInfos,
        resultBom
      );
      // Adding entries which are in the input file but missing in the generated file
      resultBom = jsonParser.addMissingEntries(this.toBeAppended, resultBom);

      // change to this.packageinfofilter
      this.packageInfos.forEach((packageInfo) => {
        if (packageInfo.copyright === '') {
          // To logger 
          console.error('Failed to collect the necessary information for ' + packageInfo.toString());
          this.noCopyrightList.push(packageInfo);
        }
      });

      // Parse packageInfo into a array of Json objects
      let resultMissingValues = jsonParser.parsePkgInfo(
        this.noCopyrightList
      );
      // Strigify results so that they can be written
      const stringBom = JSON.stringify(resultBom, null, 4);
      const stringMissingValues = JSON.stringify(resultMissingValues, null, 4);

      let newFile = path.join('out', 'updatedBom.json');
      jsonFileWriter.write(newFile, stringBom);
      jsonFileWriter.write(this.missingValuesPath, stringMissingValues);

    } catch (err) {
      throw err;
    }
  }

  exportPDF(): void {
    try {
      let pdfParser = new PDFParser();
      let pdfExporter = new PDFFileWriter();
      // Concat the missing values for pdf export 
      this.packageInfos = this.packageInfos.concat(this.toBeAppended);
      let [head, body] = pdfParser.parse(this.packageInfos);
      pdfExporter.export(head, body);
    } catch (err) {
      throw err;
    }
  }


  /**
   * Saves the given file to the disk.
   * @param {string} fileContent The license to be saved.
   * @param {string} fileName The information about the corresponding package in string form.
   */
  writeFileToDisk(fileContent: string, fileName: string): void {
    try {
      if (!existsSync(path.join('out', 'licenses'))) {
        mkdirSync(path.join('out', 'licenses'));
      }
      writeFileSync(
        path.join('out', 'licenses', `${fileName}.txt`),
        fileContent
      );
    } catch (err) {
      console.error(err);
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

  hasCopyright(packageInfo: PackageInfo): boolean {
    return packageInfo.copyright !== '';
  }
}
