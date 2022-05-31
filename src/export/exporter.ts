import { PackageInfo } from '../model/packageInfo';

export interface Exporter {

    exportBom(packageInfos: PackageInfo[], format: string, originalBom: string): void;
}