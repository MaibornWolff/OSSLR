import 'mocha';
import {assert} from 'chai';
import {PackageInfo} from '../Model/PackageInfo';
import {PDFParser} from './PDFParser';

describe('exportMissingValues', function () {
    let parser = new PDFParser();
    it('Parse packageinfos into jsPDF format', function () {
        let pkg1 = new PackageInfo(
            'ampproject',
            'remapping',
            '2.2.0',
            [{id: 'Apache-2.0', url: 'https://opensource.org/licenses/Apache-2.0'}],
            [],
            [],
            '',
            ''
        );
        let pkg2 = new PackageInfo(
            'babel',
            'code-frame',
            '7.16.7',
            [{id: 'MIT', url: 'https://opensource.org/licenses/MIT'}],
            [],
            [],
            '',
            'Copyright (c) 2014-present Sebastian McKenzie and other contributors'
        );
        let pkg3 = new PackageInfo('', '', '', [], [], [], '', '');

        let col = ['Index', 'Group', 'Name', 'Version', 'License', 'Copyright'];
        let rows = [
            ['1', 'ampproject', 'remapping', '2.2.0', 'Apache-2.0', ''],
            ['2', 'babel', 'code-frame', '7.16.7', 'MIT', 'Copyright (c) 2014-present Sebastian McKenzie and other contributors',],
            ['3', '', '', '', '', ''],
        ];
        assert.deepEqual(parser.parse([pkg1, pkg2, pkg3]), [[col], rows]);
    });
});
