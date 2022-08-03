import 'mocha';
import { stub, restore } from 'sinon';
import { assert } from 'chai';
import { LicenseDownloader } from './licenseDownloader';
import { GithubClient } from './githubClient';
import { Logger } from '../../Logger/logging';

describe('downloadLicense', function () {
    let licenseDownloader: LicenseDownloader;
    this.beforeEach(function () {
        licenseDownloader = new LicenseDownloader();
        stub(LicenseDownloader.prototype, 'downloadLicenseFromExternalWebsite').returns('license');
        stub(LicenseDownloader.prototype, 'downloadLicenseFromGithub').returns('Github License');
    });
    it('should pass the url to the correct downloader', async function () {
        let res = await licenseDownloader.downloadLicense('github.com', null);
        assert.equal(res, 'Github License');
        res = await licenseDownloader.downloadLicense('website.com', null);
        assert.equal(res, 'license');
    });
    this.afterEach(() => {
        restore();
    });
});


describe('downloadLicenseFromGithub', function () {
    let licenseDownloader: LicenseDownloader;
    this.beforeEach(function () {
        licenseDownloader = new LicenseDownloader();
        let downloadRepoStub = stub(GithubClient.prototype, 'downloadRepo');
        downloadRepoStub.onCall(0).returns({
            'data': [
                {
                    'name': 'readme',
                    'download_url': 'readme.md'
                },
                {
                    'name': 'license',
                    'download_url': 'license url'
                }
            ]
        });
        downloadRepoStub.onCall(1).returns({
            'data': [
                {
                    'name': 'readme.md',
                    'download_url': 'readme.md'
                },
                {
                    'name': 'license.md',
                    'download_url': 'license.md url'
                }
            ]
        });
        stub(LicenseDownloader.prototype, 'makeGetRequest').callsFake(function (url: string) {
            return url;
        });
    });
    this.afterEach(() => {
        restore();
    });
    it('should download the license files if it exists in the given repo', async function () {
        let res = await licenseDownloader.downloadLicenseFromGithub('github.com/test/repo', Logger.getInstance());
        assert.equal(res, 'license url');
        res = await licenseDownloader.downloadLicenseFromGithub('github.com/test/repo', Logger.getInstance());
        assert.equal(res, 'license.md url');
    });
});