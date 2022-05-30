import "mocha";
import { stub } from "sinon";
import { assert, expect } from "chai";
import { CycloneDXParser } from "../src/cycloneDXParser";

// describe('parseInput', function () {
//     it('should pass the file to the correct parser', function () {
//         stub(CycloneDXParser.prototype, 'parseJSON').returns([]);

//         let cycloneDXParser = new CycloneDXParser('json');
//         assert.isEmpty(cycloneDXParser.parseInput(''));
//     });
//     it('should throw an error if the file format is not supported', function () {
//         let cycloneDXParser = new CycloneDXParser('xml');
//         expect(() => {
//             cycloneDXParser.parseInput('');
//         }).to.throw(Error, 'Unsupported file format xml');
//     });
// });

describe('parseJSON', function () {
    it('should correctly save the package information in a PackageInfo object', function () {
        let rawJSON = {
            "components": [{
                "group": "group",
                "name": "name",
                "version": "version",
                "scope": "optional",
                "licenses": [
                    {
                        "license": {
                            "id": "Apache-2.0",
                            "url": "https://opensource.org/licenses/Apache-2.0"
                        },
                    }, {
                        "license": {
                            "id": "MIT",
                            "url": "https://opensource.org/licenses/MIT"
                        }
                    }
                ],
                "externalReferences": [
                    {
                        "type": "website",
                        "url": "https://github.com/group/name"
                    },
                    {
                        "type": "vcs",
                        "url": "https://secondLink.com"
                    }
                ],
            }]
        };
        let cycloneDXParser = new CycloneDXParser('json');
        expect(cycloneDXParser.parseJSON(JSON.stringify(rawJSON))).to.eql([{
            group: 'group',
            name: 'name',
            version: 'version',
            licenses: [
                {
                    "license": {
                        "id": "Apache-2.0",
                        "url": "https://opensource.org/licenses/Apache-2.0"
                    },
                }, {
                    "license": {
                        "id": "MIT",
                        "url": "https://opensource.org/licenses/MIT"
                    }
                }
            ],
            externalReferences: ["https://github.com/group/name", "https://secondLink.com"],
            licenseTexts: [],
            copyright: []
        }]);
        rawJSON['components'][0]['licenses'] = [];
        rawJSON['components'][0]['externalReferences'] = [];
        expect(cycloneDXParser.parseJSON(JSON.stringify(rawJSON))).to.eql([{
            group: 'group',
            name: 'name',
            version: 'version',
            licenses: [],
            externalReferences: [],
            licenseTexts: [],
            copyright: []
        }]);
    });
});