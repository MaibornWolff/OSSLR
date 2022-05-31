import 'mocha';
import { assert } from 'chai';
import { GithubClient } from '../../src/model/githubClient';

describe('filterRepoInfoFromURL', function () {
    let githubClient: GithubClient;
    this.beforeEach(function () {
        githubClient = new GithubClient();
    });

    it('should correctly extract the user and repository from the given url', function () {
        assert.equal(githubClient.filterRepoInfoFromURL('github.com/user/repo')[0], 'user');
        assert.equal(githubClient.filterRepoInfoFromURL('github.com/user/repo')[1], 'repo');
        assert.equal(githubClient.filterRepoInfoFromURL('http://www.github.com/user-name/repo.name')[0], 'user-name');
        assert.equal(githubClient.filterRepoInfoFromURL('http://www.github.com/user-name/repo.name')[1], 'repo.name');
    });
    it('should remove subdirectories and fragments', function () {
        assert.equal(githubClient.filterRepoInfoFromURL('github.com/user/repo/sub/directory.git')[0], 'user');
        assert.equal(githubClient.filterRepoInfoFromURL('github.com/user/repo/sub/directory.git')[1], 'repo');
        assert.equal(githubClient.filterRepoInfoFromURL('github.com/user/repo/sub#readme')[0], 'user');
        assert.equal(githubClient.filterRepoInfoFromURL('github.com/user/repo/sub#readme')[1], 'repo');
    });
});
