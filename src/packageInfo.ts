/**
 * Data structure storing information about individual packages extracted from the bom file.
 */
export interface PackageInfo {
  group: string;
  name: string;
  version: string;
  licenses: object[];
  externalReferences: string[];
  licenseTexts: string[];
}
