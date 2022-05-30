import * as path from 'path';
import { CopyrightInserter } from './model/copyrightInserter';

main();

async function main() {
    let bomPath = path.join('out', 'bom.json');
    try {
        let copyrightInserter = new CopyrightInserter();
        try {
            copyrightInserter.initParser('cycloneDX', bomPath);
        } catch (err) {
            throw err;
        }
        copyrightInserter.retrievePackageInfos();
        await copyrightInserter.downloadLicenses('access-token');
        copyrightInserter.parseCopyright();
        copyrightInserter.exportBom();
    } catch (err) {
        console.log(err);
        return;
    }
}


