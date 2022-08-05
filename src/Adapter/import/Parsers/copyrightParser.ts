import { Logger } from '../../../Logger/logging';

export class CopyrightParser {
    /**
 * Extracts copyright notice from license file or website.
 * @param {string} license Content of a license file or website potentially containing copyright notice.
 * @param {Logger} logger The logger instance.  
 * @returns {string} Extracted copyright notice. Empty string if no matches found.
 */
    extractCopyright(license: string, logger: Logger): string {
        const regExps = [
            new RegExp('(©|\\(c\\))? ?copyright (©|\\(c\\))? ?[0-9]+.*', 'i'),
            new RegExp('(©|\\(c\\)) copyright.*', 'i'),
            new RegExp('copyright (©|\\(c\\)).*', 'i'),
            new RegExp('copyright [0-9]+.*', 'i')
        ];
        for (let i in regExps) {
            if (license.match(regExps[i])) {
                return regExps[i].exec(license)[0];
            }
        }
        if (license.match(new RegExp('copyright.*', 'i'))) {
            logger.addToLog(new RegExp('copyright.*', 'i').exec(license)[0], 'Debug');
        }
        return '';
    }

    /**
     * Removes html tags and other artifacts not filtered out
     * by the regex from the copyright string.
     * @param {string} copyright The original extracted copyright notice.
     * @returns {string} The updated copyright notice.
     */
    removeOverheadFromCopyright(copyright: string): string {
        // remove everything in brackets except the (c)
        let matches = copyright.match(/\([^)]*\)|<[^>]*>/g);
        for (let i in matches) {
            if (matches[i].toLowerCase() != '(c)') {
                copyright = copyright.replace(matches[i], '');
            }
        }
        // remove URLs. Inspired by: https://urlregex.com/
        matches = copyright.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
        for (let i in matches) {
            copyright = copyright.replace(matches[i], '');
        }
        // remove everything after special characters
        copyright = copyright.replace(/[^A-za-z0-9\-\. ()©].*/, '');
        // remove unnecessary whitespace
        return copyright.replace(/\s\s+/g, ' ').trim();
    }
}



