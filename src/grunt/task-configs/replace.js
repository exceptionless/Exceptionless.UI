/* jslint node: true */
module.exports = {
  main: {
    options: {
      patterns: [
        {
          match: 'version',
          replacement: process.env.APPVEYOR_BUILD_VERSION || '2.0.0'
        }
      ]
    },
    files: [
      {
        expand: true,
        flatten: true,
        src: ['dist/app.*.js'],
        dest: 'dist/'
      }
    ]
  }
};
