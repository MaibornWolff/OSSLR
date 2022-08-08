import { License } from './license';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');

export class PackageInfo {
  group: string;
  name: string;
  version: string;
  licenses: License[];
  externalReferences: string[];
  licenseTexts: string[];
  readme: string;
  copyright: string;

  constructor(group: string, name: string, version: string, licenses: License[], externalReferences: string[], licenseTexts: string[], readme:string, copyright: string) {
    this.group = group;
    this.name = name;
    this.version = version;
    this.licenses = licenses;
    this.externalReferences = externalReferences;
    this.licenseTexts = licenseTexts;
    this.readme = readme;
    this.copyright = copyright;
  }

  /**
   * Generates a name/string representation for the given package in the form: "group-name-version".
   * @returns {string} The generated name for the package.
   */
  toString(): string {
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
}