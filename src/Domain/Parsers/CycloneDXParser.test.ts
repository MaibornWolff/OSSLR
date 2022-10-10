import 'mocha';
import {stub, restore} from 'sinon';
import {assert} from 'chai';
import {CycloneDXParser} from './CycloneDXParser';
import {PackageInfo} from '../Model/PackageInfo';
import {License} from '../Model/License';

describe('parseInput', function () {
    this.beforeEach(function () {
        stub(CycloneDXParser.prototype, 'parseJSON').returns([]);
    });
    it('should pass the file to the correct parser', function () {
        let cycloneDXParser = new CycloneDXParser('json');
        assert.isEmpty(cycloneDXParser.parseInput(''));
    });
    this.afterEach(() => {
        restore();
    });
});

describe('parseJSON', function () {
    let rawJSON: object;
    this.beforeEach(function () {
        rawJSON = {
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
                                url: 'https://opensource.org/licenses/Apache-2.0',
                            },
                        },
                        {
                            license: {
                                id: 'MIT',
                                url: 'https://opensource.org/licenses/MIT',
                            },
                        },
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
            ],
        };
    });
    // NOTE: the properties licenseTexts, readme and copyright are set after parseJSON call
    it('should correctly save the package information in a PackageInfo object', function () {
        let parser = new CycloneDXParser('json');
        let license1: License = {
            id: 'Apache-2.0',
            url: 'https://opensource.org/licenses/Apache-2.0',
        };
        let license2: License = {
            id: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        };

        assert.deepEqual(parser.parseJSON(JSON.stringify(rawJSON)), [
            new PackageInfo(
                'group',
                'name',
                'version',
                [license1, license2],
                ['https://github.com/group/name', 'https://secondLink.com'],
                [],
                '',
                ''
            ),
        ]);
    });
});

describe('extractLicensesFromPkg', function () {
    it('should correctly extract licenses of type License from a Bom JSON object', function () {
        let parser = new CycloneDXParser('json');
        let rawJSON = [
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
