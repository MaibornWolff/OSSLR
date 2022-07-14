import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');

export class PackageInfo {
  group: string;
  name: string;
  version: string;
  licenses: object[];
  externalReferences: string[];
  licenseTexts: string[];
  copyright: string;

  constructor(group: string, name: string, version: string, licenses: object[], externalReferences: string[], licenseTexts: string[], copyright: string) {
    this.group = group;
    this.name = name;
    this.version = version;
    this.licenses = licenses;
    this.externalReferences = externalReferences;
    this.licenseTexts = licenseTexts;
    this.copyright = copyright;
  }

  /**
   * Generates a name for the given package in the form: "group-name-version".
   * @returns {string} The generated name for the package.
   */
  generatePackageName(): string {
    let fileName = '';
    if (this.group.trim() != '') {
        fileName += this.group + '-';
    }
    if (this.name.trim() != '') {
        fileName += this.name + '-';
    }
    if (fileName === '') {
        fileName = 'unnamed-';
    }
    if (this.version.trim() != '') {
        fileName += this.version;
    }
    return fileName.charAt(fileName.length - 1) == '-' ? fileName.substring(0, fileName.length - 1) : fileName;
  }

  /**
   * Generates a log message from the info of the given package depending on the given level.
   * @param {string} level The level of the log message.
   * @returns {string} The message to be added to the log.
   */
  generateLogMessage(level: string): string {
    switch (level) {
        case 'License':
            return `No License found for: ${this.generatePackageName()}`;
        case 'ExtRefs':
            return `No external references found for: ${this.generatePackageName()}`;
        case 'Copyright':
            return `Unable to extract copyright notice for: ${this.generatePackageName()}`;
        default:
            return '';
    }
  }

  /**
  * Saves the given license file to the disk.
  * @param {string} license The license to be saved.
  */
  writeLicenseToDisk(license: string, fileName: string): void {
    try {
        if (!existsSync(path.join('out', 'licenses'))) {
            mkdirSync(path.join('out', 'licenses'));
        }
        writeFileSync(path.join('out', 'licenses', `${fileName}.txt`), license);
    } catch (err) {
        console.error(err);
    }
  }
}