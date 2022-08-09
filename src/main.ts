import { LicenseChecker } from './Domain/licenseChecker';


main();

async function main() {
    try {
        let args = process.argv.slice(2);
        if (args.length != 1){
            console.log("One argument is required: the path to the input JSON file.");
            return;
        }
        let bomPath = args[0];
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
    } catch (err) {
        console.log(err);
        return;
    }
}


