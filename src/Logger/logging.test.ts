/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { PackageInfo } from '../Domain/model/packageInfo';
import * as Logger from './logging';


describe('generateLogMessage', function () {
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
