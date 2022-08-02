/**
 * Data structure storing information about individual packages extracted from the bom file.
*/
export class PackageInfo {
  group: string;
  name: string;
  version: string;
  licenses: object[];
  externalReferences: string[];
  licenseTexts: string[];
  copyright: string;

  constructor(
    group: string, 
    name: string,
    version: string,
    licenses: object[],
    externalReferences: string[],
    licenseTexts: string[],
    copyright: string
    ){
      this.group = group;
      this.name = name;
      this.version = version;
      this.licenses = licenses;
      this.externalReferences = externalReferences;
      this.licenseTexts = licenseTexts;
      this.copyright = copyright;
  }

  /**
 * Generates a string representation for the given package in the form: "group-name-version".
 * @returns {string} The generated string for the package.
 */
  public toString = () : string => {
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
    if (this.version != undefined && this.version.trim() != '') {
        fileName += this.version;
    }
    return fileName.charAt(fileName.length - 1) == '-' ? fileName.substring(0, fileName.length - 1) : fileName;
  }
}
