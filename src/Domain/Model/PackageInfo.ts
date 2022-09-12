import { License } from './License';
import * as Logger from '../../Logger/Logging';

export class PackageInfo {
  group: string;
  name: string;
  version: string;
  licenses: License[];
  externalReferences: string[];
  licenseTexts: string[] = [];
  readme = '';
  copyright: string;

  constructor(
    group: string,
    name: string,
    version: string,
    licenses: License[],
    externalReferences: string[],
    licenseTexts: string[],
    readme: string,
    copyright: string
  ) {
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
    return fileName.charAt(fileName.length - 1) == '-'
      ? fileName.substring(0, fileName.length - 1)
      : fileName;
  }
  /**
   * Checks wether Packages are equal in terms of name and group.
   * @returns {boolean}
   */
  samePackage(local: PackageInfo): boolean {
    return local.name === this.name && local.group === this.group;
  }

  /**
   * Checks wether this PackageInfo is in the version range of the local PackageInfo.
   * @param {PackageInfo} local is a PackageInfo stems from the default values that have been given by the user.
   * @returns {boolean}
   */
  isVersionInRangeOf(local: PackageInfo) : boolean{
    // this <=> generated
    // local <=> input file
    // 1.x and ^1.0.0 last two numbers variable
    // 1.0.x and ~1.0.0 last number variable
    if(local.version === '*' || local.version === 'x') return true;
    let arr1 = local.version.split('.');
    let arr2 = this.version.split('.');
    if(!arr1 || arr1.length < 2) {
      Logger.addToLog('Invalid version format for this local package: ' + local.toString(), 'Error');
      
      return false;
    } else if(!arr2 || arr2.length < 2){
      Logger.addToLog('Invalid version format for this generated package: ' + this.toString(), 'Error');
      return false;
    }
    if(arr1[arr1.length - 1] === 'x'){
      if(arr1.length == 2){
        return this.equal(arr1[0], arr2[0]);
      } else if(arr1.length == 3){
        return this.equal(arr1[0], arr2[0]) && this.equal(arr1[1], arr2[1]);
      }
    }
    const firstCh = arr1[0].charAt(0);
    arr1[0] = arr1[0].replace(/\~|\^/i, '');
    if (firstCh =='^'){
      // if first digit equal and 
      if(this.equal(arr1[0], arr2[0]) && this.equal(arr1[1], arr2[1]))
        return this.smallerEq(arr1[2], arr2[2]);
      else if (this.equal(arr1[0], arr2[0]) && this.smaller(arr1[1], arr2[1]))
        return true;
    } else if(firstCh =='~'){
      return this.equal(arr1[0], arr2[0]) && this.equal(arr1[1], arr2[1]) && this.smallerEq(arr1[2], arr2[2]);
    }
    return local.version === this.version;
  }

  // Helper funtions to compare version strings
  private smallerEq(a: string, b: string): boolean{
    return parseInt(a, 10) <= parseInt(b, 10);
  } 

  private smaller(a: string, b: string): boolean{
    return parseInt(a, 10) < parseInt(b, 10);
  } 

  private equal(a: string, b: string): boolean{
    return parseInt(a, 10) == parseInt(b, 10);
  } 
}
