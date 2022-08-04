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
        copyrightInserter.initParser('cycloneDX', bomPath);
        copyrightInserter.retrievePackageInfos();
        await copyrightInserter.downloadLicenses();
        copyrightInserter.parseCopyright();
        copyrightInserter.export();
    } catch (err) {
        console.log(err);
        return;
    }
}


