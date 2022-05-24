"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
require("mocha");
const chai_1 = require("chai");
const util_1 = require("../src/util");
describe('generatePackageName', function () {
    let packageInfo = {
        'group': '',
        'name': '',
        'version': ''
    };
    it('should return unnamed when no name and group are available', function () {
        chai_1.assert.equal((0, util_1.generatePackageName)(packageInfo), 'unnamed');
        packageInfo.version = '1.0';
        chai_1.assert.equal((0, util_1.generatePackageName)(packageInfo), 'unnamed-1.0');
    });
    it('should return a name shaped group-name-version, if available', function () {
        packageInfo.group = 'group';
        packageInfo.name = 'name';
        packageInfo.version = '1.0';
        chai_1.assert.equal((0, util_1.generatePackageName)(packageInfo), 'group-name-1.0');
        packageInfo.group = '';
        chai_1.assert.equal((0, util_1.generatePackageName)(packageInfo), 'name-1.0');
        packageInfo.version = '';
        chai_1.assert.equal((0, util_1.generatePackageName)(packageInfo), 'name');
        packageInfo.group = 'group';
        chai_1.assert.equal((0, util_1.generatePackageName)(packageInfo), 'group-name');
    });
});
describe('generateLogMessage', function () {
    let packageInfo = {
        'group': '',
        'name': '',
        'version': ''
    };
    it('should generate appropriate log message for the license level', function () {
        chai_1.assert.equal((0, util_1.generateLogMessage)(packageInfo, 'License'), 'No License found for: unnamed');
    });
    it('should generate appropriate log message for the extRefs level', function () {
        chai_1.assert.equal((0, util_1.generateLogMessage)(packageInfo, 'ExtRefs'), 'No external references found for: unnamed');
    });
    it('should generate appropriate log message for the copyright level', function () {
        chai_1.assert.equal((0, util_1.generateLogMessage)(packageInfo, 'Copyright'), 'Unable to extract copyright notice for: unnamed');
    });
    it('should return empty string if a different level is passed', function () {
        chai_1.assert.equal((0, util_1.generateLogMessage)(packageInfo, 'Error'), '');
    });
});
