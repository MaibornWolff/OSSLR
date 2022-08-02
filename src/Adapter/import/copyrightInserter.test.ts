/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { stub, restore } from 'sinon';
import {
  CopyrightInserter
} from './copyrightInserter';
import { PackageInfo } from '../../Domain/model/packageInfo';
import { CopyrightParser } from './copyrightParser';


// describe("insertCopyrightIntoBom", function () {
//   let packageInfo = new PackageInfo(
//      '',
//      '',
//      '',
//      [
//       {
//         license: {
//           id: "MIT",
//           url: "https://opensource.org/licenses/MIT",
//         },
//       },
//     ],
//      [],
//      [],
//      '')
//   it("should add an entry containing the copyright notice into the bom", function () {
//     assert.equal(
//       packageInfo.insertCopyrightIntoBom("Copyright notice")["licenses"][0][
//       "license"
//       ]["copyright"],
//       "Copyright notice"
//     );
//   });
// });

describe('parseCopyright', function () {
  let copyrightInserter: CopyrightInserter;
  this.beforeEach(function () {
    copyrightInserter = new CopyrightInserter();
    copyrightInserter.packageInfos = [new PackageInfo('', '', '', [], [], ['Copyright (C) 2019'], '')];
    stub(CopyrightParser.prototype, 'extractCopyright').returns('Copyright (C) 2019');
    stub(CopyrightParser.prototype, 'removeOverheadFromCopyright').returns('Copyright (C) 2019');
  });
  this.afterEach(() => {
    restore();
  });
  it('should insert the extracted copyright in the PackageInfo object', function () {
    copyrightInserter.parseCopyright();
    assert.deepEqual(copyrightInserter.packageInfos,
      [new PackageInfo('', '', '', [], [], ['Copyright (C) 2019'], 'Copyright (C) 2019')]
    );
  });
});

describe('hasLicense', function () {
  let copyrightInserter: CopyrightInserter;
  let packageInfo = new PackageInfo('', '', '', [], [], [], '');
  beforeEach(function () {
    copyrightInserter = new CopyrightInserter();
    packageInfo.group = 'group';
    packageInfo.name = 'name';
    packageInfo.version = 'version';
    packageInfo.licenses = [
      {
        'id': 'MIT',
        'url': 'https://opensource.org/licenses/MIT'
      }
    ];
    packageInfo.externalReferences = [];
    packageInfo.licenseTexts = [];
    packageInfo.copyright = '';
  });
  it('should return whether license information are available for the given package', function () {
    assert.isTrue(copyrightInserter.hasLicense(packageInfo));
    packageInfo.licenses = [];
    assert.isFalse(copyrightInserter.hasLicense(packageInfo));
  });
});

describe('hasExternalReferences', function () {
  let copyrightInserter;
  let packageInfo = new PackageInfo('', '', '', [], [], [], '');
  beforeEach(function () {
    copyrightInserter = new CopyrightInserter();
    packageInfo.group = 'group';
    packageInfo.name = 'name';
    packageInfo.version = 'version';
    packageInfo.licenses = [];
    packageInfo.externalReferences = [
      'https://github.com/readme',
      'git+https://github.com/plugins.git'
    ];
    packageInfo.licenseTexts = [];
    packageInfo.copyright = '';
  });

  it('should return whether external references are available for the given package', function () {
    assert.isTrue(copyrightInserter.hasExternalRefs(packageInfo));
    packageInfo['externalReferences'] = [];
    assert.isFalse(copyrightInserter.hasExternalRefs(packageInfo));
  });
});
