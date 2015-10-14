/* jslint node: true */
module.exports = function (grunt) {
  if (process.env.APPVEYOR_REPO_BRANCH !== 'master' || !process.env.APPVEYOR_REPO_TAG) {
    grunt.log.writeln('The release will only be created from a tag on the master branch.');
    return;
  }

  return {
    zip: {
      options: {
        archive: 'Exceptionless.UI.' + process.env.APPVEYOR_BUILD_VERSION + '.zip'
      },
      files: [
        {
          expand: true,
          cwd: 'dist/',
          src: ['**/*'],
          dest: './'
        }
      ]
    }
  };
};
