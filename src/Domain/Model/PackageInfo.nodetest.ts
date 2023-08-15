import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {PackageInfo} from './PackageInfo';

describe('toString', function () {
    const packageInfo = new PackageInfo('', '', '', [], [], '', '');
    beforeEach(function () {
        packageInfo.group = '';
        packageInfo.name = '';
        packageInfo.version = '';
        packageInfo.licenses = [];
        packageInfo.externalReferences = [];
        packageInfo.copyright = '';
    });
    describe('should return unnamed when no name and group are available', ()=>{
        it('with version', ()=>{
            assert.equal(packageInfo.toString(), 'unnamed');
        });
        it('without version', ()=>{
            packageInfo.version = '1.0';
            assert.equal(packageInfo.toString(), 'unnamed-1.0');
        });        
    });

    describe('should return a name shaped group-name-version, if available', function () {
        it('group, name and version', ()=>{
            packageInfo.group = 'group';
            packageInfo.name = 'name';
            packageInfo.version = '1.0';
            assert.equal(packageInfo.toString(), 'group-name-1.0');
        });

        it('group empty string, name and version', ()=>{
            packageInfo.group = '';
            packageInfo.name = 'name';
            packageInfo.version = '1.0';
            assert.equal(packageInfo.toString(), 'name-1.0');
        });
        
        it('only name', ()=>{
            packageInfo.group = '';
            packageInfo.name = 'name';
            packageInfo.version = '';
            assert.equal(packageInfo.toString(), 'name');
        });
        

        it('group and name', ()=>{
            packageInfo.group = 'group';
            packageInfo.name = 'name';
            packageInfo.version = '';
            assert.equal(packageInfo.toString(), 'group-name');
        });
    });
});

describe('isVersionInRangeOf', function () {
    const local = new PackageInfo('', '', '~1.0.0', [], [], '', '');
    let generated = new PackageInfo('', '', '', [], [], '', '');

    describe('version with ~ or _._.x should match patch realeases', () => {
        it('1.0.420 is in range of ~1.0.0', ()=>{
            const local = new PackageInfo('', '', '~1.0.0', [], [], '', '');
            const compare = new PackageInfo('', '', '1.0.420', [], [], '', '');
            assert.ok(compare.isVersionInRangeOf(local));
        });
    
        it('2.0.0 is not range of ~1.0.0', ()=>{
            const local = new PackageInfo('', '', '~1.0.0', [], [], '', '');
            const compare = new PackageInfo('', '', '2.0.0', [], [], '', '');
            assert.ok(!compare.isVersionInRangeOf(local));
        });
    
        it('1.1.420 is in range of 1.1.x', ()=>{
            const local = new PackageInfo('', '', '1.1.x', [], [], '', '');
            const compare = new PackageInfo('', '', '1.1.420', [], [], '', '');
            assert.ok(compare.isVersionInRangeOf(local));
        });
    
        it('1.2.0 is not range of 1.1.x', ()=>{
            const local = new PackageInfo('', '', '1.1.x', [], [], '', '');
            const compare = new PackageInfo('', '', '1.2.0', [], [], '', '');
            assert.ok(!compare.isVersionInRangeOf(local));
        });    
    });


    describe('version with ^ or _.x should match minor releases', ()=>{
        it('2.69.420 is in range of ^2.1.5', ()=>{
            const local = new PackageInfo('', '', '^2.1.5', [], [], '', '');
            const compare = new PackageInfo('', '', '2.69.420', [], [], '', '');
            assert.ok(compare.isVersionInRangeOf(local));
        });
        it('2.0.15 is not in range of ^2.1.5', ()=>{
            const local = new PackageInfo('', '', '^2.1.5', [], [], '', '');
            const compare = new PackageInfo('', '', '2.0.15', [], [], '', '');
            assert.ok(!compare.isVersionInRangeOf(local));
        }); 

        it('1.2.420 is in range of 1.x', ()=>{
            const local = new PackageInfo('', '', '1.x', [], [], '', '');
            const compare = new PackageInfo('', '', '1.2.420', [], [], '', '');
            assert.ok(compare.isVersionInRangeOf(local));
        }); 

        it('2.0.0 is not in range of 1.x', ()=>{
            const local = new PackageInfo('', '', '1.x', [], [], '', '');
            const compare = new PackageInfo('', '', '2.0.0.', [], [], '', '');
            assert.ok(!compare.isVersionInRangeOf(local));
        }); 



    });

    describe('version with * or just x should match all', () => {
        it('10000000.0.420 is in range of *', ()=>{
            const local = new PackageInfo('', '', '*', [], [], '', '');
            const compare = new PackageInfo('', '', '10000000.0.420', [], [], '', '');
            assert.ok(compare.isVersionInRangeOf(local));
        });
        it('10000000.0.420 is in range of x', ()=>{
            const local = new PackageInfo('', '', 'x', [], [], '', '');
            const compare = new PackageInfo('', '', '10000000.0.420', [], [], '', '');
            assert.ok(compare.isVersionInRangeOf(local));
        });

    });
});