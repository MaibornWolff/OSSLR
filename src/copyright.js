"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.filterRepoInfoFromURL = exports.hasExternalRefs = exports.hasLicense = exports.insertCopyrightIntoBom = exports.removeOverheadFromCopyright = exports.insertCopyrightInformation = void 0;
/* eslint-disable no-useless-escape */
var fs_1 = require("fs");
var cli_progress_1 = require("cli-progress");
var path = require("path");
var axios_1 = require("axios");
var util = require("./util.js");
/**
 * Main loop of the script, coordinating the download of license information, the extraction of
 * the copyright notice and the insertion of the information into the existing bom.
 * @param {object} jsonData Content of the bom.json file.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 */
function insertCopyrightInformation(jsonData, githubClient) {
    return __awaiter(this, void 0, void 0, function () {
        var progBar, _a, _b, _i, i, packageInfo, message, message, copyright, message;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Retrieving License Information...');
                    progBar = new cli_progress_1.SingleBar({}, cli_progress_1.Presets.shades_classic);
                    progBar.start(jsonData['components'].length, 0);
                    _a = [];
                    for (_b in jsonData['components'])
                        _a.push(_b);
                    _i = 0;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    i = _a[_i];
                    progBar.increment();
                    packageInfo = jsonData['components'][i];
                    if (!hasLicense(packageInfo)) {
                        message = util.generateLogMessage(packageInfo, 'License');
                        util.addToLog(message, 'License');
                        return [3 /*break*/, 3];
                    }
                    if (!hasExternalRefs(packageInfo)) {
                        message = util.generateLogMessage(packageInfo, 'ExtRefs');
                        util.addToLog(message, 'ExtRefs');
                        return [3 /*break*/, 3];
                    }
                    return [4 /*yield*/, retrieveCopyrightInformation(packageInfo, githubClient)];
                case 2:
                    copyright = _c.sent();
                    if (copyright == '') {
                        message = util.generateLogMessage(packageInfo, 'Copyright');
                        util.addToLog(message, 'Copyright');
                        return [3 /*break*/, 3];
                    }
                    copyright = removeOverheadFromCopyright(copyright);
                    packageInfo = insertCopyrightIntoBom(packageInfo, copyright);
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    progBar.stop();
                    console.log('Done!');
                    try {
                        (0, fs_1.writeFileSync)(path.join('out', 'updatedBom.json'), JSON.stringify(jsonData, null, '\t'));
                    }
                    catch (err) {
                        console.error(err);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.insertCopyrightInformation = insertCopyrightInformation;
/**
 * Removes html tags and other artifacts not filtered out
 * by the regex from the copyright string.
 * @param {string} copyright The original extracted copyright notice.
 * @returns {string} The updated copyright notice.
 */
function removeOverheadFromCopyright(copyright) {
    // remove everything in brackets except the (c)
    var re1 = /\([^)]*\)|<[^>]*>/g;
    var matches = copyright.match(re1);
    for (var i in matches) {
        if (matches[i].toLowerCase() != '(c)') {
            copyright = copyright.replace(matches[i], '');
        }
    }
    // remove unnecessary whitespace
    return copyright.replace(/\s\s+/g, ' ').trim();
}
exports.removeOverheadFromCopyright = removeOverheadFromCopyright;
/**
 * Adds a new entry containing the copyright notice to the bom.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {string} copyright The copyright notice to be inserted.
 * @returns {string} The updated json entry.
 */
function insertCopyrightIntoBom(packageInfo, copyright) {
    packageInfo['licenses'][0]['license'].copyright = copyright;
    return packageInfo;
}
exports.insertCopyrightIntoBom = insertCopyrightIntoBom;
/**
 * Extracts copyright notice from license file or website.
 * @param {string} license Content of a license file or website potentially containing copyright notice.
 * @returns {string} Extracted copyright notice. Empty string if no matches found.
 */
function extractCopyright(license) {
    var regExps = [
        new RegExp('(©|\\(c\\))? ?copyright (©|\\(c\\))? ?[0-9]+.*', 'i'),
        new RegExp('(©|\\(c\\)) copyright.*', 'i'),
        new RegExp('copyright (©|\\(c\\)).*', 'i'),
        new RegExp('copyright [0-9]+.*', 'i')
    ];
    for (var i in regExps) {
        if (license.match(regExps[i])) {
            return regExps[i].exec(license)[0];
        }
    }
    if (license.match(new RegExp('copyright.*', 'i'))) {
        util.addToLog(new RegExp('copyright.*', 'i').exec(license)[0], 'Debug');
    }
    return '';
}
/**
 * Checks whether the bom contains license information for the given package.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {boolean} Whether the packageInfo contains a license.
 */
function hasLicense(packageInfo) {
    return Array.isArray(packageInfo['licenses']) && packageInfo['licenses'].length > 0;
}
exports.hasLicense = hasLicense;
/**
 * Checks whether the bom contains external references for the given package.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @returns {boolean} Whether the packageInfo contains external references.
 */
function hasExternalRefs(packageInfo) {
    return Array.isArray(packageInfo['externalReferences']) && packageInfo['externalReferences'].length > 0;
}
exports.hasExternalRefs = hasExternalRefs;
/**
 * Downloads license information and tries to extract copyright notice from it.
 * @param {object} packageInfo Entry from bom.json containing information for one package.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 * @returns {string} The extracted copyright notice. Empty string if none was found.
 */
function retrieveCopyrightInformation(packageInfo, githubClient) {
    return __awaiter(this, void 0, void 0, function () {
        var extRefs, license, copyright, _a, _b, _i, i, url, fileName;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    extRefs = packageInfo['externalReferences'];
                    license = '';
                    copyright = '';
                    _a = [];
                    for (_b in extRefs)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    i = _a[_i];
                    url = extRefs[i]['url'];
                    if (!url.includes('github.com')) return [3 /*break*/, 3];
                    return [4 /*yield*/, downloadLicenseFromGithub(url, githubClient)];
                case 2:
                    license = _c.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, downloadLicenseFromExternalWebsite(url)];
                case 4:
                    license = _c.sent();
                    _c.label = 5;
                case 5:
                    if (license == '') {
                        return [3 /*break*/, 6];
                    }
                    try {
                        fileName = util.generatePackageName(packageInfo);
                        if (!(0, fs_1.existsSync)(path.join('out', 'licenses'))) {
                            (0, fs_1.mkdirSync)(path.join('out', 'licenses'));
                        }
                        (0, fs_1.writeFileSync)(path.join('out', 'licenses', "".concat(fileName, ".txt")), license);
                    }
                    catch (err) {
                        console.error(err);
                    }
                    copyright = extractCopyright(license);
                    if (copyright !== '') {
                        return [2 /*return*/, copyright];
                    }
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, copyright];
            }
        });
    });
}
/**
 * Downloads the content of the github repository with the given URL and
 * returns the license file if it exists.
 * @param {string} url The API-URL of the github repository.
 * @param {object} githubClient Instance of the githubClient used to communicate with github.com.
 * @returns {string} The content of the license file. Empty string if none was found.
 */
function downloadLicenseFromGithub(url, githubClient) {
    return __awaiter(this, void 0, void 0, function () {
        var repoInfo, repoOwner, repoName, license, repoContent, _a, _b, _i, i, fileName, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    repoInfo = filterRepoInfoFromURL(url);
                    repoOwner = repoInfo[0];
                    repoName = repoInfo[1];
                    license = '';
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, githubClient.rest.repos.getContent({
                            owner: repoOwner,
                            repo: repoName
                        })];
                case 2:
                    repoContent = _c.sent();
                    _a = [];
                    for (_b in repoContent['data'])
                        _a.push(_b);
                    _i = 0;
                    _c.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    i = _a[_i];
                    fileName = repoContent['data'][i]['name'];
                    if (!(fileName.toLowerCase() === 'license' || fileName.match(new RegExp('license\.[\w]*'), 'i'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, makeGetRequest(repoContent['data'][i]['download_url'])];
                case 4:
                    license = _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_1 = _c.sent();
                    if (err_1.status == '404') {
                        util.addToLog("Repository with URL ".concat(url, " not found."), 'Error');
                    }
                    else {
                        util.addToLog(err_1, 'Error');
                    }
                    return [2 /*return*/, license];
                case 8: return [2 /*return*/, license];
            }
        });
    });
}
/**
 * Downloads the website with the given URL.
 * @param {string} url The URL of the website to be downloaded.
 * @returns {string} A string containing the content of the website as html.
 */
function downloadLicenseFromExternalWebsite(url) {
    return __awaiter(this, void 0, void 0, function () {
        var err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, makeGetRequest(url)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_2 = _a.sent();
                    errorMessage = "AxiosError: ".concat(err_2.code, ".");
                    if (err_2.response) {
                        errorMessage = "Request ".concat(url, " failed with status ").concat(err_2['response']['status'], ". ").concat(err_2['response']['statusText'], ".");
                    }
                    else if (err_2.code == 'ENOTFOUND') {
                        errorMessage = "No response for the request ".concat(url, ".");
                    }
                    util.addToLog(errorMessage, 'Error');
                    return [2 /*return*/, ''];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extracts the username and repository name form a github URL.
 * @param {string} url URL to the github repository.
 * @returns {string[]} A string array containing the extracted username and repository name
 */
function filterRepoInfoFromURL(url) {
    var re = new RegExp('github.com\/([\\w\-]+)\/([\\w\-\.]+)');
    url = re.exec(url);
    var user = url[1];
    var repo = url[2].replace(new RegExp('.git$'), '');
    return [user, repo];
}
exports.filterRepoInfoFromURL = filterRepoInfoFromURL;
/**
 * Performs a GET request for the given URL.
 * @param {string} url  The URL for the request.
 * @returns {promise} Of the result of the GET request.
 */
function makeGetRequest(url) {
    return new Promise(function (resolve, reject) {
        axios_1["default"].get(url).then(function (response) {
            var result = response.data;
            resolve(result);
        }, function (error) {
            reject(error);
        });
    });
}
