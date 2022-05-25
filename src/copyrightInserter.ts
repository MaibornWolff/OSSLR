import { SingleBar, Presets } from "cli-progress";
import { CopyrightParser } from "./copyrightParser";
import { CycloneDXParser } from "./cycloneDXParser";
import { InputParser } from "./inputParser";
import { LicenseDownloader } from "./licenseDownloader";
import { Logger } from "./logging";
import { PackageInfo } from "./packageInfo";
import * as util from "./util";

export class CopyrightInserter {
  logger: Logger;
  parser: InputParser;
  packageInfos: PackageInfo[];
  bomPath: string;
  bomData: string;

  constructor(bomPath: string, bomFormat: string) {
    this.logger = new Logger();
    try {
      this.initParser(bomFormat, bomPath);
    } catch (err) {
      throw err;
    }
    this.bomPath = bomPath;
  }

  private initParser(bomFormat: string, bomPath: string) {
    let dataFormat = bomPath.split(".").pop();
    switch (bomFormat) {
      case "cycloneDX":
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
      let licenseDownloader = new LicenseDownloader(tokenUrl, this.logger);
      console.log("Retrieving License Information...");
      const progBar = new SingleBar({}, Presets.shades_classic);
      progBar.start(this.packageInfos.length, 0);
      for (let i in this.packageInfos) {
        progBar.increment();
        let packageInfo = this.packageInfos[i];
        if (!this.hasLicense(packageInfo)) {
          let message = util.generateLogMessage(packageInfo, "License");
          this.logger.addToLog(message, "License");
          continue;
        }
        if (!this.hasExternalRefs(packageInfo)) {
          let message = util.generateLogMessage(packageInfo, "ExtRefs");
          this.logger.addToLog(message, "ExtRefs");
          continue;
        }
        for (let j in packageInfo.externalReferences) {
          let url = packageInfo.externalReferences[j];
          let license = await licenseDownloader.downloadLicense(
            url,
            this.logger
          );
          if (license != "") {
            packageInfo.licenseTexts.push(license);
            util.writeLicenseToDisk(license, packageInfo);
          }
        }
      }
      progBar.stop();
      console.log("Done!");
    } catch (err) {
      throw err;
    }
  }

  parseCopyright() {
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
        this.packageInfos[i].copyright.push(copyright);
      }
    }
  }



  /**
   * Checks whether the bom contains license information for the given package.
   * @param {object} packageInfo Entry from bom.json containing information for one package.
   * @returns {boolean} Whether the packageInfo contains a license.
   */
  private hasLicense(packageInfo: object): boolean {
    return (
      Array.isArray(packageInfo["licenses"]) &&
      packageInfo["licenses"].length > 0
    );
  }

  /**
   * Checks whether the bom contains external references for the given package.
   * @param {object} packageInfo Entry from bom.json containing information for one package.
   * @returns {boolean} Whether the packageInfo contains external references.
   */
  private hasExternalRefs(packageInfo: object): boolean {
    return (
      Array.isArray(packageInfo["externalReferences"]) &&
      packageInfo["externalReferences"].length > 0
    );
  }
}
