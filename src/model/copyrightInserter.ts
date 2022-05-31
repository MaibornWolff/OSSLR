import { SingleBar, Presets } from 'cli-progress';
import { CopyrightParser } from '../parser/copyrightParser';
import { CycloneDXParser } from '../parser/cycloneDXParser';
import { InputParser } from '../parser/inputParser';
import { LicenseDownloader } from './licenseDownloader';
import { Logger } from '../logging';
import { PackageInfo } from './packageInfo';
import * as util from './util';
import { CycloneDXExporter } from '../export/cycloneDXExporter';

export class CopyrightInserter {
  logger: Logger;
  parser: InputParser;
  packageInfos: PackageInfo[];
  bomPath: string;
  bomData: string;

  constructor() {
    this.logger = new Logger();
  }

  initParser(bomFormat: string, bomPath: string): void {
    this.bomPath = bomPath;
    let dataFormat = bomPath.split('.').pop();
    switch (bomFormat) {
      case 'cycloneDX':
        this.parser = new CycloneDXParser(dataFormat);
        break;
      default:
        throw new Error(`Unsupported Bom Format ${bomFormat}`);
    }
  }

  retrievePackageInfos(): void {
    try {
      this.bomData = this.parser.readInput(this.bomPath);
      this.packageInfos = this.parser.parseInput(this.bomData);
    } catch (err) {
      throw err;
    }
  }

  async downloadLicenses(tokenUrl: string) {
    try {
      let licenseDownloader = new LicenseDownloader();
      licenseDownloader.authenticateGithubClient(tokenUrl);
      console.log('Retrieving License Information...');
      const progBar = new SingleBar({}, Presets.shades_classic);
      progBar.start(this.packageInfos.length, 0);
      for (let packageInfo of this.packageInfos) {        
        progBar.increment();
        if (!this.hasLicense(packageInfo)) {
          let message = util.generateLogMessage(packageInfo, 'License');
          this.logger.addToLog(message, 'License');
          continue;
        }
        if (!this.hasExternalRefs(packageInfo)) {
          let message = util.generateLogMessage(packageInfo, 'ExtRefs');
          this.logger.addToLog(message, 'ExtRefs');
          continue;
        }
        for (let url of packageInfo.externalReferences) {
          let license = await licenseDownloader.downloadLicense(
            url,
            this.logger
          );
          if (license != '') {
            packageInfo.licenseTexts.push(license);
            let fileName = util.generatePackageName(packageInfo);
            util.writeLicenseToDisk(license, fileName);
          }
        }
      }
      progBar.stop();
      console.log('Done!');
    } catch (err) {
      throw err;
    }
  }

  parseCopyright(): void {
    let copyrightParser = new CopyrightParser();
    for (let i = 0; i < this.packageInfos.length; i++) {
      for (let j = 0; j < this.packageInfos[i].licenseTexts.length; j++) {
        let copyright = copyrightParser.extractCopyright(
          this.packageInfos[i].licenseTexts[j],
          this.logger
        );
        if (copyright === '') {
          continue;
        }
        copyright = copyrightParser.removeOverheadFromCopyright(copyright);
        this.packageInfos[i].copyright = copyright;
      }
    }
  }

  exportBom(): void {
    let cycloneDXExporter = new CycloneDXExporter();
    try {
      cycloneDXExporter.exportBom(this.packageInfos, this.parser.format, this.bomData);
    } catch(err) {
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
  hasExternalRefs(packageInfo: object): boolean {
    return (
      Array.isArray(packageInfo['externalReferences']) &&
      packageInfo['externalReferences'].length > 0
    );
  }
}
