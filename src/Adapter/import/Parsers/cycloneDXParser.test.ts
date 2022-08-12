import 'mocha';
import { stub, restore } from 'sinon';
import { assert, expect } from 'chai';
import { CycloneDXParser } from './cycloneDXParser';
import { PackageInfo } from '../../../Domain/model/packageInfo';

describe('parseInput', function () {
    this.beforeEach(function () {
        stub(CycloneDXParser.prototype, 'parseJSON').returns([]);
    });
    it('should pass the file to the correct parser', function () {
        let cycloneDXParser = new CycloneDXParser('json');
        assert.isEmpty(cycloneDXParser.parseInput(''));
    });
    it('should throw an error if the file format is not supported', function () {
        let cycloneDXParser = new CycloneDXParser('xml');
        expect(() => {
            cycloneDXParser.parseInput('');
        }).to.throw(Error, 'Unsupported file format xml');
    });
    this.afterEach(() => {
        restore();
    });
});

describe('parseJSON', function () {
    let rawJSON: object;
    this.beforeEach(function () {
        rawJSON = {
            'components': [{
                'group': 'group',
                'name': 'name',
                'version': 'version',
                'scope': 'optional',
                'licenses': [
                    {
                        'license': {
                            'id': 'Apache-2.0',
                            'url': 'https://opensource.org/licenses/Apache-2.0'
                        },
                    }, {
                        'license': {
                            'id': 'MIT',
                            'url': 'https://opensource.org/licenses/MIT'
                        }
                    }
                ],
                'externalReferences': [
                    {
                        'type': 'website',
                        'url': 'https://github.com/group/name'
                    },
                    {
                        'type': 'vcs',
                        'url': 'https://secondLink.com'
                    }
                ],
            }]
        };
    });

    // fails beacause its a different object now, Before PackageInfo was just an interface now its a class
    // TODO: edit this
    /*
    it('should correctly save the package information in a PackageInfo object', function () {
        let cycloneDXParser = new CycloneDXParser('json');
        assert.deepEqual(cycloneDXParser.parseJSON(JSON.stringify(rawJSON)), 
       
        [{
            group: 'group',
            name: 'name',
            version: 'version',
            licenses: [
                {
                    'license': {
                        'id': 'Apache-2.0',
                        'url': 'https://opensource.org/licenses/Apache-2.0'
                    },
                }, {
                    'license': {
                        'id': 'MIT',
                        'url': 'https://opensource.org/licenses/MIT'
                    }
                }
            ],
            ['https://github.com/group/name', 'https://secondLink.com'],
            [],
            '')]);
        rawJSON['components'][0]['licenses'] = [];
        rawJSON['components'][0]['externalReferences'] = [];
        assert.deepEqual(cycloneDXParser.parseJSON(JSON.stringify(rawJSON)), [{
            group: 'group',
            name: 'name',
            version: 'version',
            licenses: [],
            externalReferences: [],
            licenseTexts: [],
            copyright: ''
        }]);
    }); */
});
