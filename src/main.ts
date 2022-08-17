import { LicenseChecker } from './Domain/licenseChecker';
import * as path from 'path';


main();

async function main() {
    try {
        let args = process.argv.slice(2);
        let bomPath;
        let bomManualPath = path.join('out', 'missingValues.json'); // deafault path
        switch(args.length) {
            case 1:
                bomPath = args[0];
                console.log("Second Argument has not been specified, packages where copyrights cannot be retrieved will be writen to out/missingValues.json by default");
              break;
            case 2:
                bomPath = args[0];
                bomManualPath = args[1];
              break;
            default:
                console.log("At least one argument is required, namely the path to the input JSON file.");
                return;
          }
        let licenseChecker = new LicenseChecker();
        // Sets parser mode and passes input file
        licenseChecker.init('cycloneDX', bomPath, bomManualPath);
        // Extracts relevant Package data from the given JSON file  
        licenseChecker.retrievePackageInfos();
        // Downloads data (currently lincenses and README files) from given source link
        await licenseChecker.downloadPackageData();
        // Parses that data for copyright (searches for copyright with RegEx)
        licenseChecker.parseCopyright();
        // Combines missingValues.json and retrieved values from bom.json
        licenseChecker.combine();
        // Creates a file with all packagesInfos which are missing important values
        licenseChecker.exportMissingObjects();
        // Exports said copyright data into a pdf
        licenseChecker.export();        
    } catch (err) {
        console.log(err);
        return;
    }
}


