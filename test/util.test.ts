/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { generatePackageName, generateLogMessage } from '../src/util';

describe('generatePackageName', function () {
    let packageInfo = {
        'group': '',
        'name': '',
        'version': ''
    };

    it('should return unnamed when no name and group are available', function () {
        assert.equal(generatePackageName(packageInfo), 'unnamed');
        packageInfo.version = '1.0';
        assert.equal(generatePackageName(packageInfo), 'unnamed-1.0');
    });

    it('should return a name shaped group-name-version, if available', function () {
        packageInfo.group = 'group';
        packageInfo.name = 'name';
        packageInfo.version = '1.0';
        assert.equal(generatePackageName(packageInfo), 'group-name-1.0');
        packageInfo.group = '';
        assert.equal(generatePackageName(packageInfo), 'name-1.0');
        packageInfo.version = '';
        assert.equal(generatePackageName(packageInfo), 'name');
        packageInfo.group = 'group';
        assert.equal(generatePackageName(packageInfo), 'group-name');
    });
});

describe('generateLogMessage', function () {
    let packageInfo = {
        'group': '',
        'name': '',
        'version': ''
    };

    it('should generate appropriate log message for the license level', function () {
        assert.equal(generateLogMessage(packageInfo, 'License'), 'No License found for: unnamed');
    });

    it('should generate appropriate log message for the extRefs level', function () {
        assert.equal(generateLogMessage(packageInfo, 'ExtRefs'), 'No external references found for: unnamed');
    });

    it('should generate appropriate log message for the copyright level', function () {
        assert.equal(generateLogMessage(packageInfo, 'Copyright'), 'Unable to extract copyright notice for: unnamed');
    });

    it('should return empty string if a different level is passed', function () {
        assert.equal(generateLogMessage(packageInfo, 'Error'), '');
    });
});