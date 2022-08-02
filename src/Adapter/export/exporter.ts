import { PackageInfo } from '../../Domain/model/packageInfo';

export interface Exporter {

    export(packageInfos: PackageInfo[], format?: string, originalBom?: string): void;
}