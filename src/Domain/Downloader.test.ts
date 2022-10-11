/* eslint-disable @typescript-eslint/no-explicit-any */
import 'mocha';
import {stub, restore} from 'sinon';
import {assert} from 'chai';
import {Downloader} from './Downloader';
import {GithubClient} from '../Adapter/Import/GithubClient';
import * as Logger from '../Logging/Logging';
import {HTTPClient} from '../Adapter/Import/HTTPClient';


describe('downloadLicenseFromGithub', function () {
    let downloader: Downloader;
    this.beforeEach(function () {
        Logger.initializeSilentLogger();
        downloader = new Downloader();
        let downloadRepoStub = stub(GithubClient.prototype, 'downloadRepo');
        let httpStub = stub(HTTPClient.prototype, 'makeGetRequest');

        httpStub.onCall(0).returns(
            new Promise<string>((resolve) => {
                let value = 'license';
                resolve(value);
            }));

        httpStub.onCall(2).returns(
            new Promise<string>((resolve) => {
                let value = 'license';
                resolve(value);
            }));

        httpStub.onCall(1).returns(
            new Promise<string>((resolve) => {
                let value = 'readme';
                resolve(value);
            }));

        httpStub.onCall(3).returns(
            new Promise<string>((resolve) => {
                let value = 'readme';
                resolve(value);
            }));

        downloadRepoStub.onCall(0).returns(
            new Promise<any>((resolve) => {
                let value: any = [
                    {
                        'name': 'license',
                        'download_url': 'license url'
                    },
                    {
                        'name': 'readme',
                        'download_url': 'readme.md'
                    }

                ];
                resolve(value);
            })
        );

        downloadRepoStub.onCall(1).returns(
            new Promise<any>((resolve) => {
                let value: any = [
                    {
                        'name': 'license.md',
                        'download_url': 'license.md url'
                    },
                    {
                        'name': 'readme.md',
                        'download_url': 'readme.md'
                    }
                ];
                resolve(value);
            })
        );

    });


    this.afterEach(() => {
        restore();
    });
    it('should download the license files if it exists in the given repo', async function () {
        let res = await downloader.downloadDataFromGithub('github.com/test/repo');
        assert.deepEqual(res, ['license', 'readme']);
        res = await downloader.downloadDataFromGithub('github.com/test/repo');
        assert.deepEqual(res, ['license', 'readme']);
    });
});
