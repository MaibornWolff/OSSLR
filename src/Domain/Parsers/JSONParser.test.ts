import "mocha";
import { stub, restore } from "sinon";
import { assert, expect } from "chai";
import { JSONParser } from "./JSONParser";
import { PackageInfo } from "../Model/PackageInfo";

describe('insertCopyrightIntoBom', function(){
    let parser = new JSONParser();
    let pkg1 = new PackageInfo('', '', '', [], [], [],'', 'Copyright (c)');
    let pkg2 =  new PackageInfo('', '', '', [], [], [],'', 'Very nice Copyright (c)');
    let pkg3 =  new PackageInfo('', '', '', [], [], [],'', '');
    let bomJohnson =  {"components": [
        {
            "group": "",
            "name": "",
            "version": "",
            "description": "",
            "scope": "",
            "hashes": [
              {
                "alg": "",
                "content": ""
              }
            ],
            "licenses": [
              {
                "license": {
                  "id": "",
                  "url": ""
                }
              }
            ],
            "purl": "",
            "externalReferences": [
              {
                "type": "",
                "url": ""
              },
              {
                "type": "",
                "url": ""
              }
            ],
            "type": "",
            "bom-ref": "",
            "copyright": "Copyright (c)"
          },
          {
            "group": "",
            "name": "",
            "version": "",
            "description": "",
            "scope": "",
            "hashes": [
              {
                "alg": "",
                "content": ""
              }
            ],
            "licenses": [
              {
                "license": {
                  "id": "",
                  "url": ""
                }
              }
            ],
            "purl": "",
            "externalReferences": [
              {
                "type": "",
                "url": ""
              },
              {
                "type": "",
                "url": ""
              }
            ],
            "type": "",
            "bom-ref": "",
            "copyright": "Very nice Copyright (c)"
          },
          {
            "group": "",
            "name": "",
            "version": "",
            "description": "",
            "scope": "",
            "hashes": [
              {
                "alg": "",
                "content": ""
              }
            ],
            "licenses": [
              {
                "license": {
                  "id": "",
                  "url": ""
                }
              }
            ],
            "purl": "",
            "externalReferences": [
              {
                "type": "",
                "url": ""
              },
              {
                "type": "",
                "url": ""
              }
            ],
            "type": "",
            "bom-ref": ""
          }
    ]}
    let noCPbom = {"components": [
        {
            "group": "",
            "name": "",
            "version": "",
            "description": "",
            "scope": "",
            "hashes": [
              {
                "alg": "",
                "content": ""
              }
            ],
            "licenses": [
              {
                "license": {
                  "id": "",
                  "url": ""
                }
              }
            ],
            "purl": "",
            "externalReferences": [
              {
                "type": "",
                "url": ""
              },
              {
                "type": "",
                "url": ""
              }
            ],
            "type": "",
            "bom-ref": ""
          },
          {
            "group": "",
            "name": "",
            "version": "",
            "description": "",
            "scope": "",
            "hashes": [
              {
                "alg": "",
                "content": ""
              }
            ],
            "licenses": [
              {
                "license": {
                  "id": "",
                  "url": ""
                }
              }
            ],
            "purl": "",
            "externalReferences": [
              {
                "type": "",
                "url": ""
              },
              {
                "type": "",
                "url": ""
              }
            ],
            "type": "",
            "bom-ref": ""
          },
          {
            "group": "",
            "name": "",
            "version": "",
            "description": "",
            "scope": "",
            "hashes": [
              {
                "alg": "",
                "content": ""
              }
            ],
            "licenses": [
              {
                "license": {
                  "id": "",
                  "url": ""
                }
              }
            ],
            "purl": "",
            "externalReferences": [
              {
                "type": "",
                "url": ""
              },
              {
                "type": "",
                "url": ""
              }
            ],
            "type": "",
            "bom-ref": ""
          }
    ]}
    it("should correctly insert copyright into BOM file", function () {
        assert.deepEqual(parser.insertCopyrightIntoBom([pkg1, pkg2, pkg3], noCPbom), bomJohnson )
    })
    
})


describe('exportMissingValues', function() {
    let parser = new JSONParser()
    it("Parse packageinfos into array of package components in JSON format", function(){
        let pkg = new PackageInfo("ampproject","remapping", "2.2.0", [], [], [], "", "");
        let license = {id: "Apache-2.0", url: "https://opensource.org/licenses/Apache-2.0"}
        pkg.licenses.push(license);
        let missingValues = {
            "components": [
                {
                    "group": "ampproject",
                    "name": "remapping",
                    "version":"2.2.0",
                    "licenses": [
                        {
                            "license": {
                                "id": "Apache-2.0",
                                "url": "https://opensource.org/licenses/Apache-2.0"
                            }
                        }
                    ],
                    "copyright": ""
                }
            ]
        };

        assert.deepEqual(parser.exportMissingValues([pkg]), JSON.stringify(missingValues, null, 4));

    } )
})

