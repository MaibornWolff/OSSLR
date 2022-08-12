import 'mocha';
import { stub, restore } from 'sinon';
import { assert } from 'chai';
import { Downloader } from './downloader';
import { GithubClient } from '../import/githubClient';
import { Logger } from '../../Logger/logging';

/*
describe('downloadLicense', function () {
    let downloader: Downloader;
    this.beforeEach(function () {
        downloader = new Downloader();
        stub(Downloader.prototype, 'downloadLicenseFromExternalWebsite').returns('license');
        stub(Downloader.prototype, 'downloadLicenseFromGithub').returns('Github License');
    });
    it('should pass the url to the correct downloader', async function () {
        let res = await Downloader.downloadLicenseAndREADME('github.com', null);
        assert.equal(res, 'Github License');
        res = await Downloader.downloadLicenseAndREADME('website.com', null);
        assert.equal(res, 'license');
    });
    this.afterEach(() => {
        restore();
    });
});


describe('downloadLicenseFromGithub', function () {
    let downloader: Downloader;
    this.beforeEach(function () {
        downloader = new Downloader();
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
        stub(Downloader.prototype, 'makeGetRequest').callsFake(function (url: string) {
            return url;
        });
    });
    this.afterEach(() => {
        restore();
    });
    it('should download the license files if it exists in the given repo', async function () {
        let res = await downloader.downloadLicenseFromGithub('github.com/test/repo', new Logger());
        assert.equal(res, 'license url');
        res = await downloader.downloadLicenseFromGithub('github.com/test/repo', new Logger());
        assert.equal(res, 'license.md url');
    });
});

*/