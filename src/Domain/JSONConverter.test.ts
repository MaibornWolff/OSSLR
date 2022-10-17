import 'mocha';
import {assert} from 'chai';
import {JSONConverter} from './JSONConverter';
import {PackageInfo} from './Model/PackageInfo';
import {CycloneDX} from './Model/CycloneDX';


describe('parsePkgInfo', function () {
    let jsonParser = new JSONConverter();
    let json = {
        components: [{
            group: 'ampproject',
            name: 'remapping',
            version: '2.2.1',
            licenses: [
                {
                    license: {
                        id: 'Apache-2.0',
                        url: 'https://opensource.org/licenses/Apache-2.0'
                    }
                }
            ],
            copyright: ''
        }]
    };
    let licenses = [{id: 'Apache-2.0', url: 'https://opensource.org/licenses/Apache-2.0'}];
    let packageInfo = new PackageInfo('ampproject', 'remapping', '2.2.1', licenses, [], [], '', '');
    it('should parse packageinfo to json correctly', function () {
        assert.deepEqual(jsonParser.parsePkgInfo([packageInfo]), json);
    });
});

describe('insertCopyrightIntoBom', function () {
    let parser = new JSONConverter();
    let pkg1 = new PackageInfo('', '', '', [], [], [], '', 'Copyright (c)');
    let pkg2 = new PackageInfo('', '', '', [], [], [], '', 'Very nice Copyright (c)');
    let pkg3 = new PackageInfo('', '', '', [], [], [], '', '');
    let bomJohnson: CycloneDX;
    bomJohnson = {
        specVersion: '',
        version: 0,
        bomFormat: 'CycloneDX',
        components: [
            {
                copyright: 'Copyright (c)'
            },
            {
                copyright: 'Very nice Copyright (c)'
            },
            {}
        ]
    };
    let noCPbom: CycloneDX = {
        specVersion: '',
        version: 0,
        bomFormat: 'CycloneDX',
        components: [
            {},
            {},
            {}
        ]
    };
    it('should correctly insert copyright into BOM file', function () {
        assert.deepEqual(parser.insertCopyrightIntoBom([pkg1, pkg2, pkg3], noCPbom), bomJohnson);
    });

});
