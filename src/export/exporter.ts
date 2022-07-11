import { PackageInfo } from '../model/packageInfo';

export interface Exporter {

    export(packageInfos: PackageInfo[], format?: string, originalBom?: string): void;
}