import * as path from 'path';
import { CopyrightInserter } from './Adapter/import/copyrightInserter';

main();

async function main() {
    let bomPath = path.join('out', 'bom.json');

    try {
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


