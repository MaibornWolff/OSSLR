import {LicenseChecker} from './Domain/LicenseChecker';
import * as path from 'path';
import * as Logger from './Logger/Logging' ;
import {printError, printWarning} from './Logger/ErrorFormatter';


main();

async function main() {
    let args = process.argv.slice(2);
    let bomPath;
    let bomManualPath;
    Logger.initializeLogger();
    switch (args.length) {
        case 1:
            bomPath = args[0];
            printWarning(
                'Warning: Argument DEFAULT_VALUES has not been specified'
            );
            Logger.addToLog('Argument DEFAULT_VALUES has not been specified', 'Warning');
            break;
        case 2:
            bomPath = args[0];
            bomManualPath = args[1];
            break;
        default:
            printError(
                'Error: At least one argument is required, namely the path to the input JSON file.'
            );
            Logger.addToLog('At least one argument is required, namely the path to the input JSON file.', 'Error');
            return;
    }

    let licenseChecker = new LicenseChecker();
    // Sets parser mode and passes input file
    licenseChecker.init('cycloneDX', bomPath, bomManualPath, path.join('out', 'missingValues.json'));
    // Extracts relevant Package data from the given JSON file
    licenseChecker.retrievePackageInfos();
    // Downloads data (currently lincenses and README files) from given source link
    await licenseChecker.downloadPackageData();
    // Parses that data for copyright (searches for copyright with RegEx)
    licenseChecker.parseCopyright();
    // Retrieves local package data that has been created manually, if available
    licenseChecker.retrieveLocalData();
    // Combines missingValues.json and retrieved values from bom.json
    licenseChecker.combine();
    // Creates output directory
    licenseChecker.createOutputDir();
    // Exports Bomfile and also exports packages with missing values to missingValues.json
    licenseChecker.exportJSON();
    // Exports said copyright and license data into a pdf
    licenseChecker.exportPDF();
}
