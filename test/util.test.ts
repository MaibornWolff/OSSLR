/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { generatePackageName, generateLogMessage, filterRepoInfoFromURL } from '../src/model/util';
import { PackageInfo } from '../src/model/packageInfo';

describe('generatePackageName', function () {
    let packageInfo: PackageInfo = {
        group: '',
        name: '',
        version: '',
        copyright: '',
        externalReferences: [],
        licenses: [],
        licenseTexts: []
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
    let packageInfo: PackageInfo = {
        group: '',
        name: '',
        version: '',
        copyright: '',
        externalReferences: [],
        licenses: [],
        licenseTexts: []
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

describe('filterRepoInfoFromURL', function () {
    it('should correctly extract the user and repository from the given url', function () {
        assert.equal(filterRepoInfoFromURL('github.com/user/repo')[0], 'user');
        assert.equal(filterRepoInfoFromURL('github.com/user/repo')[1], 'repo');
        assert.equal(filterRepoInfoFromURL('http://www.github.com/user-name/repo.name')[0], 'user-name');
        assert.equal(filterRepoInfoFromURL('http://www.github.com/user-name/repo.name')[1], 'repo.name');
    });
    it('should remove subdirectories and fragments', function () {
        assert.equal(filterRepoInfoFromURL('github.com/user/repo/sub/directory.git')[0], 'user');
        assert.equal(filterRepoInfoFromURL('github.com/user/repo/sub/directory.git')[1], 'repo');
        assert.equal(filterRepoInfoFromURL('github.com/user/repo/sub#readme')[0], 'user');
        assert.equal(filterRepoInfoFromURL('github.com/user/repo/sub#readme')[1], 'repo');
    });
});
