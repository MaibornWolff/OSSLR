/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { PackageInfo } from './packageInfo';

describe('toString', function () {
    let packageInfo = new PackageInfo('', '', '', [], [], [],'', '');
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
        assert.equal(packageInfo.toString(), 'unnamed');
        packageInfo.version = '1.0';
        assert.equal(packageInfo.toString(), 'unnamed-1.0');
    });
    it('should return a name shaped group-name-version, if available', function () {
        packageInfo.group = 'group';
        packageInfo.name = 'name';
        packageInfo.version = '1.0';
        assert.equal(packageInfo.toString(), 'group-name-1.0');
        packageInfo.group = '';
        assert.equal(packageInfo.toString(), 'name-1.0');
        packageInfo.version = '';
        assert.equal(packageInfo.toString(), 'name');
        packageInfo.group = 'group';
        assert.equal(packageInfo.toString(), 'group-name');
    });
});