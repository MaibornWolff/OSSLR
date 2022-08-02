/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { PackageInfo } from './packageInfo';

describe('generatePackageName', function () {
    let packageInfo = new PackageInfo('', '', '', [], [], [], '');
    this.beforeEach(function () {
        packageInfo.group = '';
        packageInfo.name = '';
        packageInfo.version = '';
        packageInfo.licenses = [];
        packageInfo.externalReferences = [];
        packageInfo.licenseTexts = [];
        packageInfo.copyright = '';
    });
    it('should return unnamed when no name and group are available', function () {
        assert.equal(packageInfo.generatePackageName(), 'unnamed');
        packageInfo.version = '1.0';
        assert.equal(packageInfo.generatePackageName(), 'unnamed-1.0');
    });
    it('should return a name shaped group-name-version, if available', function () {
        packageInfo.group = 'group';
        packageInfo.name = 'name';
        packageInfo.version = '1.0';
        assert.equal(packageInfo.generatePackageName(), 'group-name-1.0');
        packageInfo.group = '';
        assert.equal(packageInfo.generatePackageName(), 'name-1.0');
        packageInfo.version = '';
        assert.equal(packageInfo.generatePackageName(), 'name');
        packageInfo.group = 'group';
        assert.equal(packageInfo.generatePackageName(), 'group-name');
    });
});

describe('generateLogMessage', function () {
    let packageInfo = new PackageInfo('', '', '', [], [], [], '');
    this.beforeEach(function () {
        packageInfo.group = '';
        packageInfo.name = '';
        packageInfo.version = '';
        packageInfo.licenses = [];
        packageInfo.externalReferences = [];
        packageInfo.licenseTexts = [];
        packageInfo.copyright = '';
    });
    it('should generate appropriate log message for the license level', function () {
        assert.equal(packageInfo.generateLogMessage('License'), 'No License found for: unnamed');
    });

    it('should generate appropriate log message for the extRefs level', function () {
        assert.equal(packageInfo.generateLogMessage('ExtRefs'), 'No external references found for: unnamed');
    });

    it('should generate appropriate log message for the copyright level', function () {
        assert.equal(packageInfo.generateLogMessage('Copyright'), 'Unable to extract copyright notice for: unnamed');
    });

    it('should return empty string if a different level is passed', function () {
        assert.equal(packageInfo.generateLogMessage('Error'), '');
    });
});
