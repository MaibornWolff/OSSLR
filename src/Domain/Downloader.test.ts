import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { stub, restore } from 'sinon';
import { Downloader } from './Downloader';
import { GithubClient } from '../Adapter/Import/GithubClient';
import {HTTPClient } from '../Adapter/Import/HTTPClient';
import {Logger} from '../Logging/Logging';

describe('downloadLicenseFromGithub', () => {
    Logger.setSilent();
    let downloader: Downloader;
    
    beforeEach(()=>{
        downloader = new Downloader();
        const downloadRepoStub = stub(GithubClient.prototype, 'downloadRepo');
        const httpStub = stub(HTTPClient.prototype, 'getWebsite');

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
            new Promise<unknown>((resolve) => {
                const value: unknown = [
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
            new Promise<unknown>((resolve) => {
                const value: unknown = [
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
    
    it('should download the license files if it exists in the given repo', async function () {
        let res = await downloader.downloadDataFromGithub('github.com/test/repo');
        assert.deepEqual(res, ['license', 'readme']);
        res = await downloader.downloadDataFromGithub('github.com/test/repo');
        assert.deepEqual(res, ['license', 'readme']);
    });

    afterEach(()=>{
        restore();
    });
});

describe('filterRepoInfoFromURL', function () {
    let downloader: Downloader;
    beforeEach(() => {
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