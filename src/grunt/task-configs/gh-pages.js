/* jslint node: true */
module.exports = {
  options: {
    base: 'dist',
    branch: 'master',
    message: 'Build ' + process.env.APPVEYOR_BUILD_NUMBER || '[unknown]',
    repo: process.env.BUILD_REPO_URL,
    silent: true,
    user: {
      name: 'AppVeyor CI',
      email: 'builds@exceptionless.io'
    }
  },
  src: '**/*'
};
