/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { Logger } from '../../src/logging'
import { PackageInfo } from '../../src/model/packageInfo';

describe('toString', function () {
    let packageInfo: PackageInfo;
    this.beforeEach(function () {
        packageInfo = new PackageInfo ('', '', '', [], [], [], '')
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

describe('generateLogMessage', function () {
    let packageInfo: PackageInfo;
    this.beforeEach(function () {
        packageInfo = new PackageInfo ('', '', '', [], [], [], '')
    });
    it('should generate appropriate log message for the license level', function () {
        assert.equal(Logger.generateLogMessage(packageInfo, 'License'), 'No License found for: unnamed');
    });

    it('should generate appropriate log message for the extRefs level', function () {
        assert.equal(Logger.generateLogMessage(packageInfo, 'ExtRefs'), 'No external references found for: unnamed');
    });

    it('should generate appropriate log message for the copyright level', function () {
        assert.equal(Logger.generateLogMessage(packageInfo, 'Copyright'), 'Unable to extract copyright notice for: unnamed');
    });

    it('should return empty string if a different level is passed', function () {
        assert.equal(Logger.generateLogMessage(packageInfo, 'Error'), '');
    });
});
