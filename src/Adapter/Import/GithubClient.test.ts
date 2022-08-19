import 'mocha';
import { assert } from 'chai';
import { GithubClient } from './GithubClient';

describe('filterRepoInfoFromURL', function () {
  let githubClient: GithubClient;
  this.beforeEach(function () {
    githubClient = new GithubClient();
  });
    it('should correctly extract the user and repository from the given url', function () {
        let arr = ['github.com/user/repo', 'github.com/user/repo/sub/directory.git', 'github.com/user/repo/sub#readme'];
      for (let i = 0; i < arr.length; i++) {
        assert.deepEqual(githubClient.filterRepoInfoFromURL(arr[i]), ['user', 'repo']);
      }
      assert.deepEqual(githubClient.filterRepoInfoFromURL('http://www.github.com/user-name/repo.name'), ['user-name', 'repo.name']);  
    }); 
});