/* eslint-disable no-undef */
import 'mocha';
import { assert } from 'chai';
import { removeOverheadFromCopyright } from '../src/copyright.js';

describe('removeOverheadFromCopyright', function() {
    it('should remove html tags', function() {
        assert.equal(removeOverheadFromCopyright('Copyright <div> 2019 </div> Max Mustermann'), 'Copyright 2019 Max Mustermann');
        assert.equal(removeOverheadFromCopyright('<http://website.de> Hello <> World'), 'Hello World');
        assert.equal(removeOverheadFromCopyright('<This should be removed>'), '');
    });

    it('should remove text enclosed by paranthesis', function() {
        assert.equal(removeOverheadFromCopyright('Copyright Test Owner (test-owner@domain.com)'), 'Copyright Test Owner');
        assert.equal(removeOverheadFromCopyright('() Copyright'), 'Copyright');
    });

    it('should preserve the (c) symbol', function() {
        assert.equal(removeOverheadFromCopyright('(c) Copyright'), '(c) Copyright');
        assert.equal(removeOverheadFromCopyright('(ccc) Copyright (C)'), 'Copyright (C)');
    });
    
    it('should remove all unneccesary whitespaces', function() {
        assert.equal(removeOverheadFromCopyright('  first  (c)    second   '), 'first (c) second');
        assert.equal(removeOverheadFromCopyright('<  >  () copyright '), 'copyright');
    });
});