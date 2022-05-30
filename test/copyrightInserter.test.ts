/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import {
  CopyrightInserter
} from '../src/copyrightInserter';
import { PackageInfo } from '../src/packageInfo';


// describe("insertCopyrightIntoBom", function () {
//   let packageInfo = {
//     licenses: [
//       {
//         license: {
//           id: "MIT",
//           url: "https://opensource.org/licenses/MIT",
//         },
//       },
//     ],
//   };
//   it("should add an entry containing the copyright notice into the bom", function () {
//     assert.equal(
//       insertCopyrightIntoBom(packageInfo, "Copyright notice")["licenses"][0][
//       "license"
//       ]["copyright"],
//       "Copyright notice"
//     );
//   });
// });

// describe('parseCopyright', function () {
//   let copyrightInserter: CopyrightInserter;
//   let packageInfo: PackageInfo;
//   this.beforeEach(function () {
//     copyrightInserter = new CopyrightInserter();
//     packageInfo = {
//       group: 'group',
//       name: 'name',
//       version: 'version',
//       copyright: [],
//       externalReferences: [],
//       licenses: [
//         {
//           "license": {
//             "id": "MIT",
//             "url": "https://opensource.org/licenses/MIT"
//           }
//         }
//       ],
//       licenseTexts: []
//     };
//   });
//   it('should', function () {
//     copyrightInserter.retrievePackageInfos
//   });
// });

describe('hasLicense', function () {
  let copyrightInserter: CopyrightInserter;
  let packageInfo: PackageInfo;
  beforeEach(function () {
    copyrightInserter = new CopyrightInserter();
    packageInfo = {
      group: 'group',
      name: 'name',
      version: 'version',
      copyright: [],
      externalReferences: [],
      licenses: [
        {
          'license': {
            'id': 'MIT',
            'url': 'https://opensource.org/licenses/MIT'
          }
        }
      ],
      licenseTexts: []
    };
  });
  it('should return whether license information are available for the given package', function () {
    assert.isTrue(copyrightInserter.hasLicense(packageInfo));
    packageInfo.licenses = [];
    assert.isFalse(copyrightInserter.hasLicense(packageInfo));
  });
});

describe('hasExternalReferences', function () {
  let copyrightInserter;
  let packageInfo: PackageInfo;
  beforeEach(function () {
    copyrightInserter = new CopyrightInserter();
    packageInfo = {
      group: 'group',
      name: 'name',
      version: 'version',
      copyright: [],
      externalReferences: [
        'https://github.com/readme',
        'git+https://github.com/plugins.git'
      ],
      licenses: [],
      licenseTexts: []
    };
  });

  it('should return whether external references are available for the given package', function () {
    assert.isTrue(copyrightInserter.hasExternalRefs(packageInfo));
    packageInfo['externalReferences'] = [];
    assert.isFalse(copyrightInserter.hasExternalRefs(packageInfo));
  });
});
