/* eslint-disable no-undef */
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import {restore} from 'sinon';
import {LicenseChecker} from './LicenseChecker';
import {PackageInfo} from './Model/PackageInfo';

describe('parseCopyright', function () {
    let licenseChecker: LicenseChecker;
    beforeEach(function () {
        licenseChecker = new LicenseChecker();
    });
    afterEach(() => {
        restore();
    });
    it('should insert the extracted copyright in the PackageInfo object', function () {
        const copyright = licenseChecker.parseCopyright('Copyright (C) 2019');
        assert.deepEqual(copyright, 'Copyright (C) 2019');
    });
});

describe('hasLicense', function () {
    let licenseChecker: LicenseChecker;
    const packageInfo = new PackageInfo('', '', '', [], [], '', '');
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
        packageInfo.copyright = '';
    });
    it('should return whether license information are available for the given package', function () {
        assert.ok(licenseChecker.hasLicense(packageInfo));
        packageInfo.licenses = [];
        assert.ok(!licenseChecker.hasLicense(packageInfo));
    });
});

describe('hasExternalReferences', function () {
    let licenseChecker: LicenseChecker;
    const packageInfo = new PackageInfo('', '', '', [], [], '', '');
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
        packageInfo.copyright = '';
    });

    it('should return whether external references are available for the given package', function () {
        assert.ok(licenseChecker.hasExternalRefs(packageInfo));
        packageInfo['externalReferences'] = [];
        assert.ok(!licenseChecker.hasExternalRefs(packageInfo));
    });
});


describe('LicenseChecker', function () {
    let licenseChecker: LicenseChecker;
    const pkg1 = new PackageInfo('group', 'name', '1.2.3', [], [], '', '');

    beforeEach(function () {
        licenseChecker = new LicenseChecker();
        licenseChecker.packageInfos = [];
    });

    it('combine the local and generated package, if groups, names and versions match', function () {
        const pkg2 = new PackageInfo('group', 'name', '~1.2.3', [], [], '', 'copyright');
        const combinedPkg = new PackageInfo('group', 'name', '1.2.3', [], [], '', 'copyright');
        licenseChecker.packageInfos.push(pkg1);
        licenseChecker.localData.push(pkg2);
        licenseChecker.combine();
        assert.deepEqual(licenseChecker.packageInfos, [combinedPkg]);
    });

    it('combine the local and generated package, if groups, names and versions do not match add to packageinfos', function () {
        const pkg3 = new PackageInfo('group', 'name2', '1.2.3', [], [], '', 'copyright');
        licenseChecker.packageInfos.push(pkg1);
        licenseChecker.localData.push(pkg3);
        licenseChecker.combine();
        assert.deepEqual(licenseChecker.packageInfos, [pkg1]);
        assert.deepEqual(licenseChecker.toBeAppended, [pkg3]); // List that will be appended later on
    });

});
