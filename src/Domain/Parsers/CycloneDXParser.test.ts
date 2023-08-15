import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import {CycloneDXParser} from './CycloneDXParser';
import {PackageInfo} from '../Model/PackageInfo';
import {License} from '../Model/License';
import {CycloneDX} from '../Model/CycloneDX';

describe('parseCycloneDX', function () {
    let rawJSON: CycloneDX;
    beforeEach(function () {

        rawJSON = {
            bomFormat: '',
            specVersion: '',
            version: 0,
            components: [
                {
                    group: 'group',
                    name: 'name',
                    version: 'version',
                    scope: 'optional',
                    licenses: [
                        {
                            license: {
                                id: 'Apache-2.0',
                                url: 'https://opensource.org/licenses/Apache-2.0'
                            }
                        },
                        {
                            license: {
                                id: 'MIT',
                                url: 'https://opensource.org/licenses/MIT',
                            }
                        }
                    ],
                    externalReferences: [
                        {
                            type: 'website',
                            url: 'https://github.com/group/name',
                        },
                        {
                            type: 'vcs',
                            url: 'https://secondLink.com',
                        },
                    ],
                },
            ]
        };
    });
// NOTE: the properties licenseTexts, readme and copyright are set after parseJSON call
    it('should correctly save the package information in a PackageInfo object', function () {
        const parser = new CycloneDXParser('json');
        const license1: License = {
            id: 'Apache-2.0',
            url: 'https://opensource.org/licenses/Apache-2.0',
        };
        const license2: License = {
            id: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        };

        assert.deepEqual(parser.parseCycloneDX(rawJSON), [
            new PackageInfo(
                'group',
                'name',
                'version',
                [license1, license2],
                ['https://github.com/group/name', 'https://secondLink.com'],
                '',
                ''
            ),
        ]);
    });
});


describe('extractLicensesFromPkg', function () {
    it('should correctly extract licenses of type License from a Bom JSON object', function () {
        const parser = new CycloneDXParser('json');
        const rawJSON = [
            {
                license: {
                    id: 'MIT',
                    url: 'https://opensource.org/licenses/MIT',
                },
            },
            {
                license: {
                    id: 'MIT',
                    url: 'https://opensource.org/licenses/MIT',
                },
            },
            {
                license: {
                    id: 'Apache-2.0',
                    url: 'https://opensource.org/licenses/Apache-2.0',
                },
            },
        ];
        assert.deepEqual(parser.extractLicensesFromPkg(rawJSON), [
            {id: 'MIT', url: 'https://opensource.org/licenses/MIT'},
            {id: 'MIT', url: 'https://opensource.org/licenses/MIT'},
            {id: 'Apache-2.0', url: 'https://opensource.org/licenses/Apache-2.0'},
        ]);
    });
});
