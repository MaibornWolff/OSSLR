import { assert } from 'chai';
import { Logger } from '../../Logger/logging';
import { CopyrightParser } from './copyrightParser';

describe('extractCopyright', function () {
    let copyrightParser: CopyrightParser;
    let logger: Logger;
    this.beforeEach(function () {
        copyrightParser = new CopyrightParser();
        logger = Logger.getInstance();
    });
    it('should extract Copyright notices including (c) annotation', function () {
        assert.equal(copyrightParser.extractCopyright('Not this copyright (c) Owner Name', logger), 'copyright (c) Owner Name');
        assert.equal(copyrightParser.extractCopyright('More Text \n(C) Copyright 2020', logger), '(C) Copyright 2020');
        assert.equal(copyrightParser.extractCopyright('© Copyright', logger), '© Copyright');
    });
    it('should extract Copyright notices including a year specification', function () {
        assert.equal(copyrightParser.extractCopyright('copyright 2019-2020', logger), 'copyright 2019-2020');
        assert.equal(copyrightParser.extractCopyright('Text \nCopyright 2020 Owner', logger), 'Copyright 2020 Owner');
        assert.equal(copyrightParser.extractCopyright('Copyright © 2020', logger), 'Copyright © 2020');
    });
});

describe('removeOverheadFromCopyright', function () {
    let copyrightParser: CopyrightParser;
    this.beforeEach(function () {
        copyrightParser = new CopyrightParser();
    });
    it('should remove html tags', function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('Copyright <div> 2019 </div> Max Mustermann'),
            'Copyright 2019 Max Mustermann'
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('<http://website.de> Hello <> World'),
            'Hello World'
        );
        assert.equal(copyrightParser.removeOverheadFromCopyright('<This should be removed>'), '');
    });
    it('should remove text enclosed by parenthesis', function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright(
                'Copyright Test Owner (test-owner@domain.com)'
            ),
            'Copyright Test Owner'
        );
        assert.equal(copyrightParser.removeOverheadFromCopyright('() Copyright'), 'Copyright');
    });
    it('should preserve the (c) symbol', function () {
        assert.equal(copyrightParser.removeOverheadFromCopyright('(c) Copyright'), '(c) Copyright');
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('(ccc) Copyright (C)'),
            'Copyright (C)'
        );
    });
    it('should remove all unnecessary whitespace', function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('  first  (c)    second   '),
            'first (c) second'
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('<  >  () copyright '),
            'copyright'
        );
    });
    it('should remove all URLs', function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('copyright (C) http://www.google.com/?search=531'),
            'copyright (C)'
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('copyright www.github.com/user/repo#readme.md Owner'),
            'copyright Owner');
    });
    it('should remove everything after special characters', function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('Copyright (c) 2022 * this should be removed'),
            'Copyright (c) 2022' 
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('Copyright (c) 2022/ this should be removed'),
            'Copyright (c) 2022' 
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright('Copyright (c) 2022  $this should be removed'),
            'Copyright (c) 2022' 
        );
    });
});