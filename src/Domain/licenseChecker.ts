import { SingleBar, Presets } from 'cli-progress';
import { CopyrightParser } from '../Adapter/import/Parsers/copyrightParser';
import { CycloneDXParser } from '../Adapter/import/Parsers/cycloneDXParser';
import { InputParser } from '../Adapter/import/Parsers/inputParser';
import { Downloader } from '../Adapter/import/downloader';
import { Logger } from '../Logger/logging';
import { PackageInfo } from './model/packageInfo';
import { CycloneDXExporter } from '../Adapter/export/cycloneDXExporter';
import { PDFExporter } from '../Adapter/export/pdfExporter';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');

/**
 * This class is responsible for distributing the different tasks to the responsible classes.
 */
export class LicenseChecker {
  logger: Logger;
  parser!: InputParser;
  packageInfos!: PackageInfo[];
  bomPath!: string;
  bomData!: string;

  constructor() {
    this.logger = Logger.getInstance();
  }
  /**
   * Initializes the correct parser for the given BOM format.
   * @param bomFormat Format of the BOM.
   * @param bomPath Path to the BOM file.
   */
  initParser(bomFormat: string, bomPath: string): void {
    this.bomPath = bomPath;
    let dataFormat = bomPath.split('.').pop()!;
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
      this.bomData = this.parser.readInput(this.bomPath);
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
            url,
            this.logger
          );
          if (license != '') {
            packageInfo.licenseTexts.push(license);
            //this.writeLicenseToDisk(license, packageInfo.toString());
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
 * Saves the given file to the disk.
 * @param {string} fileContent The license to be saved.
 * @param {string} fileName The information about the corresponding package in string form.
 */
  writeFileToDisk(fileContent: string, fileName: string): void {
    try {
        if (!existsSync(path.join('out', 'licenses'))) {
            mkdirSync(path.join('out', 'licenses'));
        }
        writeFileSync(path.join('out', 'licenses', `${fileName}.txt`), fileContent);
    } catch (err) {
        console.error(err);
    }
  }

  /**
   * Coordinates the parsing of the downloaded license files.
   */
  parseCopyright(): void {
    let copyrightParser = new CopyrightParser();
    for (let i = 0; i < this.packageInfos.length; i++) {
      for (let j = 0; j < this.packageInfos[i].licenseTexts.length; j++) {
        let copyright = copyrightParser.extractCopyright(
          this.packageInfos[i].licenseTexts[j],
          this.logger
        );
        // if the last license does not contain the copyright check the README
        if(j == this.packageInfos[i].licenseTexts.length - 1 && copyright === ''){
          console.log(`No copyright found inside License for ${this.packageInfos[i].name} checking README...`)
          copyright = copyrightParser.extractCopyright(
            this.packageInfos[i].readme,
            this.logger
          )
        }
        if (copyright === '') {
          console.log(`No success, no copyright found for ${this.packageInfos[i].name}!`) // Add some prompt to enter manually...
          continue;
        }
        copyright = copyrightParser.removeOverheadFromCopyright(copyright);
        this.packageInfos[i].copyright = copyright;
      }
    }
  }

  /**
   * Exports the BOM information.
   */
  export(): void {
    let cycloneDXExporter = new CycloneDXExporter();
    let pdfExporter = new PDFExporter(); 
    try {
      cycloneDXExporter.export(this.packageInfos, this.parser.format, this.bomData);
      pdfExporter.export(this.packageInfos);
    } catch (err) {
      throw err;
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
