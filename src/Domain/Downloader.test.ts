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
        const downloadRepoStub = stub(GithubClient.prototype, 'downloadRepo');
        const httpStub = stub(HTTPClient.prototype, 'makeGetRequest');

        httpStub.onCall(0).returns(
            new Promise<string>((resolve) => {
                const value = 'license';
                resolve(value);
            }));

        httpStub.onCall(2).returns(
            new Promise<string>((resolve) => {
                const value = 'license';
                resolve(value);
            }));

        httpStub.onCall(1).returns(
            new Promise<string>((resolve) => {
                const value = 'readme';
                resolve(value);
            }));

        httpStub.onCall(3).returns(
            new Promise<string>((resolve) => {
                const value = 'readme';
                resolve(value);
            }));

        downloadRepoStub.onCall(0).returns(
            new Promise<any>((resolve) => {
                const value: any = [
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
                const value: any = [
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

describe('filterRepoInfoFromURL', function () {
    let downloader: Downloader;
    this.beforeEach(function () {
        downloader = new Downloader();
    });
    it('should correctly extract the user and repository from the given url', function () {
        const arr = ['github.com/user/repo', 'github.com/user/repo/sub/directory.git', 'github.com/user/repo/sub#readme'];
        for (let i = 0; i < arr.length; i++) {
            assert.deepEqual(downloader.filterRepoInfoFromURL(arr[i]), ['user', 'repo']);
        }
        assert.deepEqual(downloader.filterRepoInfoFromURL('http://www.github.com/user-name/repo.name'), ['user-name', 'repo.name']);
    });
});