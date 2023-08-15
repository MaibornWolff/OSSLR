import { describe, it } from 'node:test';
import assert from 'node:assert';
import {JSONConverter} from './JSONConverter';
import {PackageInfo} from './Model/PackageInfo';
import {CycloneDX} from './Model/CycloneDX';

describe('parsePkgInfo', function () {
    const jsonParser = new JSONConverter();
    const json = {
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
    const licenses = [{id: 'Apache-2.0', url: 'https://opensource.org/licenses/Apache-2.0'}];
    const packageInfo = new PackageInfo('ampproject', 'remapping', '2.2.1', licenses, [], '', '');

    it('should parse packageinfo to json correctly', function () {
        assert.deepEqual(jsonParser.parsePkgInfo([packageInfo]), json);
    });
});

describe('insertCopyrightIntoBom', function () {
    const parser = new JSONConverter();
    const pkg1 = new PackageInfo('', '', '', [], [], '', 'Copyright (c)');
    const pkg2 = new PackageInfo('', '', '', [], [], '', 'Very nice Copyright (c)');
    const pkg3 = new PackageInfo('', '', '', [], [], '', '');
    const bomJohnson: CycloneDX = {
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
    const noCPbom: CycloneDX = {
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
