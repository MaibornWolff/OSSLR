import * as path from 'path';
import { CopyrightInserter } from './copyrightInserter';

main();

async function main() {
    let bomPath = path.join('out', 'bom.json');    
    try {
        let copyrightInserter = new CopyrightInserter(bomPath, 'cycloneDX');
        copyrightInserter.retrievePackageInfos();
        // for (let i in copyrightInserter.packageInfos) {
        //     console.log(copyrightInserter.packageInfos[i]);
        // }
        await copyrightInserter.downloadLicenses('access-token');
    } catch (err) {
        console.log(err);
        return;
    }
}
