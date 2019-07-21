module.exports = {
  name: 'exceptionless.app',
  preset: '../jest.config.js',
  coverageDirectory: '../coverage',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
