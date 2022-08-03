import * as path from 'path';
import { CopyrightInserter } from './Adapter/import/copyrightInserter';

main();
// TODO: either take from out or pass path to bom.json 

async function main() {
    try {
        let args = process.argv.slice(2);
        if (args.length != 1){
            throw new Error("One argument is required: the path to the input JSON file.");
        }
        let bomPath = args[0];
        let copyrightInserter = new CopyrightInserter();
        copyrightInserter.initParser('cycloneDX', bomPath);
        copyrightInserter.retrievePackageInfos();
        await copyrightInserter.downloadLicenses('access-token');
        copyrightInserter.parseCopyright();
        copyrightInserter.export();
    } catch (err) {
        console.log(err);
        return;
    }
}


