import {LicenseChecker} from './Domain/LicenseChecker';
import * as path from 'path';
import * as Logger from './Logging/Logging' ;
import {printError, printWarning} from './Logging/ErrorFormatter';
import yargs from 'yargs';


let args = yargs(process.argv.slice(2)).options({
    bomPath: {type: 'string', alias: 'p', default: ''},
    defaultsPath: {type: 'string', alias: 'd', default: ''}
}).parseSync();

Logger.initializeLogger();
if (args.bomPath === '') {
    printError(
        'Error: Path to bom.json not specified. Specify using --bomPath=PATH/TO/YOUR/BOM.JSON.'
    );
    Logger.addToLog('Path to bom.json not specified. Specify using --bomPath=PATH/TO/YOUR/BOM.JSON.', 'Error');
    process.exit(1);
}
if (args.defaultsPath === '') {
    printWarning(
        'Warning: Argument DEFAULT_VALUES has not been specified. Can be specified using --defaultsPath=PATH/TO/YOUR/DEFAULTS.JSON.'
    );
    Logger.addToLog('Argument DEFAULT_VALUES has not been specified. Can be specified using --defaultsPath=PATH/TO/YOUR/DEFAULTS.JSON.', 'Warning');
}

let licenseChecker = new LicenseChecker();
// Sets parser mode and passes input file
await licenseChecker.init('cycloneDX', args.bomPath, args.defaultsPath, path.join('out', 'missingValues.json'));
// Extracts relevant Package data from the given JSON file
licenseChecker.retrievePackageInfos();
// Downloads data (currently licenses and README files) from given source link and tries to extract copyright notice
await licenseChecker.extractCopyrightForAllPackages();
console.log('Done!');
// Retrieves local package data that has been created manually, if available
licenseChecker.retrieveLocalData();
// Combines missingValues.json and retrieved values from bom.json
licenseChecker.combine();
// Creates output directory
licenseChecker.createOutputDir();
// Exports bomFile and also exports packages with missing values to missingValues.json
licenseChecker.exportJSON();
// Exports said copyright and license data into a pdf
licenseChecker.exportPDF();
