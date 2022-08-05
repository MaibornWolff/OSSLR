import * as path from 'path';
import { CopyrightInserter } from './Adapter/import/copyrightInserter';


main();

async function main() {
    try {
        let args = process.argv.slice(2);
        if (args.length != 1){
            console.log("One argument is required: the path to the input JSON file.");
            return;
        }
        let bomPath = args[0];
        let copyrightInserter = new CopyrightInserter();
        // Sets parser mode and passes input file
        copyrightInserter.initParser('cycloneDX', bomPath);
        // Extracts relevant Package data from the given JSON file  
        copyrightInserter.retrievePackageInfos();
        // Downloads data (currently lincenses and README files) from given source link
        await copyrightInserter.downloadPackageData();
        // Parses that data for copyright (searches for copyright with RegEx)
        copyrightInserter.parseCopyright();
        // Exports said copyright data into a pdf
        copyrightInserter.export();
    } catch (err) {
        console.log(err);
        return;
    }
}


