import { PackageInfo } from "../model/packageInfo";

export interface Exporter {

    exportbom(packageInfos: PackageInfo[], format: string, originalBom: string): void;
}