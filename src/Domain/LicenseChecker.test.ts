/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { stub, restore } from 'sinon';
import { LicenseChecker } from './LicenseChecker';
import { PackageInfo } from './Model/PackageInfo';
import { CopyrightParser } from './Parsers/CopyrightParser';

describe('parseCopyright', function () {
  let licenseChecker: LicenseChecker;
  this.beforeEach(function () {
    licenseChecker = new LicenseChecker();
    licenseChecker.packageInfos = [
      new PackageInfo('', '', '', [], [], ['Copyright (C) 2019'], '', ''),
    ];
    stub(CopyrightParser.prototype, 'extractCopyright').returns(
      'Copyright (C) 2019'
    );
    stub(CopyrightParser.prototype, 'removeOverheadFromCopyright').returns(
      'Copyright (C) 2019'
    );
  });
  this.afterEach(() => {
    restore();
  });
  it('should insert the extracted copyright in the PackageInfo object', function () {
    licenseChecker.parseCopyright();
    assert.deepEqual(licenseChecker.packageInfos, [
      new PackageInfo(
        '',
        '',
        '',
        [],
        [],
        ['Copyright (C) 2019'],
        '',
        'Copyright (C) 2019'
      ),
    ]);
  });
});

describe('hasLicense', function () {
  let licenseChecker: LicenseChecker;
  let packageInfo = new PackageInfo('', '', '', [], [], [], '', '');
  beforeEach(function () {
    licenseChecker = new LicenseChecker();
    packageInfo.group = 'group';
    packageInfo.name = 'name';
    packageInfo.version = 'version';
    packageInfo.licenses = [
      {
        id: 'MIT',
        name: '',
        text: '',
        url: 'https://opensource.org/licenses/MIT',
      },
    ];
    packageInfo.externalReferences = [];
    packageInfo.licenseTexts = [];
    packageInfo.copyright = '';
  });
  it('should return whether license information are available for the given package', function () {
    assert.isTrue(licenseChecker.hasLicense(packageInfo));
    packageInfo.licenses = [];
    assert.isFalse(licenseChecker.hasLicense(packageInfo));
  });
});

describe('hasExternalReferences', function () {
  let licenseChecker: LicenseChecker;
  let packageInfo = new PackageInfo('', '', '', [], [], [], '', '');
  beforeEach(function () {
    licenseChecker = new LicenseChecker();
    packageInfo.group = 'group';
    packageInfo.name = 'name';
    packageInfo.version = 'version';
    packageInfo.licenses = [];
    packageInfo.externalReferences = [
      'https://github.com/readme',
      'git+https://github.com/plugins.git',
    ];
    packageInfo.licenseTexts = [];
    packageInfo.copyright = '';
  });

  it('should return whether external references are available for the given package', function () {
    assert.isTrue(licenseChecker.hasExternalRefs(packageInfo));
    packageInfo['externalReferences'] = [];
    assert.isFalse(licenseChecker.hasExternalRefs(packageInfo));
  });
});
