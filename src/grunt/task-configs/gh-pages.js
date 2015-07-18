/* jslint node: true */
module.exports = function (grunt) {
  if (process.env.APPVEYOR_PULL_REQUEST_NUMBER) {
    grunt.log.writeln('Artifacts will not be created for pull requests.');
    return;
  }

  return {
    options: {
      base: 'dist',
      branch: process.env.APPVEYOR_REPO_BRANCH || 'master',
      message: 'Build: ' + process.env.APPVEYOR_BUILD_VERSION + ' Author: ' + process.env.APPVEYOR_REPO_COMMIT_AUTHOR + ' ' + process.env.APPVEYOR_REPO_NAME + '@' + process.env.APPVEYOR_REPO_COMMIT,
      repo: process.env.BUILD_REPO_URL,
      silent: true,
      user: {
        name: 'AppVeyor CI',
        email: 'builds@exceptionless.io'
      }
    },
    src: [ '**/*', '.deployment' ]
  };
};
