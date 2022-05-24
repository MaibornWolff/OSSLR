"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
require("mocha");
const chai_1 = require("chai");
const copyright_1 = require("../src/copyright");
describe('removeOverheadFromCopyright', function () {
    it('should remove html tags', function () {
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('Copyright <div> 2019 </div> Max Mustermann'), 'Copyright 2019 Max Mustermann');
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('<http://website.de> Hello <> World'), 'Hello World');
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('<This should be removed>'), '');
    });
    it('should remove text enclosed by parenthesis', function () {
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('Copyright Test Owner (test-owner@domain.com)'), 'Copyright Test Owner');
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('() Copyright'), 'Copyright');
    });
    it('should preserve the (c) symbol', function () {
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('(c) Copyright'), '(c) Copyright');
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('(ccc) Copyright (C)'), 'Copyright (C)');
    });
    it('should remove all unnecessary whitespace', function () {
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('  first  (c)    second   '), 'first (c) second');
        chai_1.assert.equal((0, copyright_1.removeOverheadFromCopyright)('<  >  () copyright '), 'copyright');
    });
});
describe('insertCopyrightIntoBom', function () {
    let packageInfo = {
        'licenses': [
            {
                'license': {
                    'id': 'MIT',
                    'url': 'https://opensource.org/licenses/MIT'
                }
            }
        ]
    };
    it('should add an entry containing the copyright notice into the bom', function () {
        chai_1.assert.equal((0, copyright_1.insertCopyrightIntoBom)(packageInfo, 'Copyright notice')['licenses'][0]['license']['copyright'], 'Copyright notice');
    });
});
describe('hasLicense', function () {
    let packageInfo = {
        'licenses': [
            {
                'license': {
                    'id': 'MIT',
                    'url': 'https://opensource.org/licenses/MIT'
                }
            }
        ]
    };
    it('should return whether license information are available for the given package', function () {
        chai_1.assert.isTrue((0, copyright_1.hasLicense)(packageInfo));
        packageInfo['licenses'] = [];
        chai_1.assert.isFalse((0, copyright_1.hasLicense)(packageInfo));
    });
});
describe('hasExternalReferences', function () {
    let packageInfo = {
        'externalReferences': [
            {
                'type': 'website',
                'url': 'https://github.com/readme'
            },
            {
                'type': 'vcs',
                'url': 'git+https://github.com/plugins.git'
            }
        ],
    };
    it('should return whether external references are available for the given package', function () {
        chai_1.assert.isTrue((0, copyright_1.hasExternalRefs)(packageInfo));
        packageInfo['externalReferences'] = [];
        chai_1.assert.isFalse((0, copyright_1.hasExternalRefs)(packageInfo));
    });
});
describe('filterRepoInfoFromURL', function () {
    it('should correctly extract the user and repository from the given url', function () {
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('github.com/user/repo')[0], 'user');
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('github.com/user/repo')[1], 'repo');
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('http://www.github.com/user-name/repo.name')[0], 'user-name');
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('http://www.github.com/user-name/repo.name')[1], 'repo.name');
    });
    it('should remove subdirectories and fragments', function () {
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('github.com/user/repo/sub/directory.git')[0], 'user');
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('github.com/user/repo/sub/directory.git')[1], 'repo');
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('github.com/user/repo/sub#readme')[0], 'user');
        chai_1.assert.equal((0, copyright_1.filterRepoInfoFromURL)('github.com/user/repo/sub#readme')[1], 'repo');
    });
});
