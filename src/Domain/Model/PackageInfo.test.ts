/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { PackageInfo } from './PackageInfo';

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

describe('isVersionInRangeOf', function(){
    let local = new PackageInfo('', '', '~1.0.0', [], [], [],'', '');
    let generated = new PackageInfo('', '', '', [], [], [],'', '');
   
    it('version with ~ or _._.x should match patch realeases', function(){
        
        generated = new PackageInfo('', '', '1.0.420', [], [], [],'', '');
        assert.isTrue(generated.isVersionInRangeOf(local));
        generated = new PackageInfo('', '', '2.0.0', [], [], [],'', '');
        assert.isFalse(generated.isVersionInRangeOf(local));
        local.version = '1.1.x';
        generated = new PackageInfo('', '', '1.1.420', [], [], [],'', '');
        assert.isTrue(generated.isVersionInRangeOf(local));
        generated = new PackageInfo('', '', '1.2.0', [], [], [],'', '');
        assert.isFalse(generated.isVersionInRangeOf(local));
    });
   
    it('version with ^ or _.x should match minor releases', function(){
        local.version = '^2.1.5';
        generated = new PackageInfo('', '', '2.69.420', [], [], [],'', '');
        assert.isTrue(generated.isVersionInRangeOf(local));
        generated = new PackageInfo('', '', '2.0.15', [], [], [],'', '');
        assert.isFalse(generated.isVersionInRangeOf(local));
        local.version = '1.x';
        generated = new PackageInfo('', '', '1.2.420', [], [], [],'', '');
        assert.isTrue(generated.isVersionInRangeOf(local));
        generated = new PackageInfo('', '', '2.0.0', [], [], [],'', '');
        assert.isFalse(generated.isVersionInRangeOf(local));
    });

    it('version with * or just x should match all', function(){
        local.version = '*';
        generated = new PackageInfo('', '', '10000000.0.420', [], [], [],'', '');
        assert.isTrue(generated.isVersionInRangeOf(local));
        local.version = 'x';
        generated = new PackageInfo('', '', '10000000.0.420', [], [], [],'', '');
        assert.isTrue(generated.isVersionInRangeOf(local));

    });
});