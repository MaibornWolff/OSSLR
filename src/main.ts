import { LicenseChecker } from './Domain/licenseChecker';


main();

async function main() {
    try {
        let args = process.argv.slice(2);
        let bomPath;
        let bomManualPath; // Path to the manually created file.
        switch(args.length) {
            case 1:
                bomPath = args[0];
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
        licenseChecker.initParser('cycloneDX', bomPath);
        // Extracts relevant Package data from the given JSON file  
        licenseChecker.retrievePackageInfos();
        // Downloads data (currently lincenses and README files) from given source link
        await licenseChecker.downloadPackageData();
        // Parses that data for copyright (searches for copyright with RegEx)
        licenseChecker.parseCopyright();
        // Exports said copyright data into a pdf
        licenseChecker.export();
        // Creates a file with all packagesInfos which are missing important values
        licenseChecker.exportMissingObjects()
    } catch (err) {
        console.log(err);
        return;
    }
}


