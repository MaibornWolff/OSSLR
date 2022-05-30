import { assert } from "chai";
import { CopyrightParser } from "../src/copyrightParser";

describe("removeOverheadFromCopyright", function () {
    let copyrightParser = new CopyrightParser();
    it("should remove html tags", function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright("Copyright <div> 2019 </div> Max Mustermann"),
            "Copyright 2019 Max Mustermann"
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright("<http://website.de> Hello <> World"),
            "Hello World"
        );
        assert.equal(copyrightParser.removeOverheadFromCopyright("<This should be removed>"), "");
    });

    it("should remove text enclosed by parenthesis", function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright(
                "Copyright Test Owner (test-owner@domain.com)"
            ),
            "Copyright Test Owner"
        );
        assert.equal(copyrightParser.removeOverheadFromCopyright("() Copyright"), "Copyright");
    });

    it("should preserve the (c) symbol", function () {
        assert.equal(copyrightParser.removeOverheadFromCopyright("(c) Copyright"), "(c) Copyright");
        assert.equal(
            copyrightParser.removeOverheadFromCopyright("(ccc) Copyright (C)"),
            "Copyright (C)"
        );
    });

    it("should remove all unnecessary whitespace", function () {
        assert.equal(
            copyrightParser.removeOverheadFromCopyright("  first  (c)    second   "),
            "first (c) second"
        );
        assert.equal(
            copyrightParser.removeOverheadFromCopyright("<  >  () copyright "),
            "copyright"
        );
    });
});