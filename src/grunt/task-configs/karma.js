module.exports = function (grunt) {
    return {
        options: {
            frameworks: ['jasmine'],
            files: [  //this files data is also updated in the watch handler, if updated change there too
                'bower_components/jquery/dist/jquery.js',
                'bower_components/boostrap/dist/js/bootstrap.js',
                '<%= dom_munger.data.appjs %>',
                'bower_components/angular-mocks/angular-mocks.js',
                grunt.option('folderGlobs')('*-spec.js'),

                'components/summary/**/*.html'
            ],
            ngHtml2JsPreprocessor: {
                moduleName: "app"
            },
            preprocessors: {
                'components/summary/**/*.html': ['ng-html2js']
            },
            logLevel: 'ERROR',
            reporters: ['mocha'],
            autoWatch: false, //watching is handled by grunt-contrib-watch
            singleRun: true,
            browserNoActivityTimeout: 60000
        },
        all_tests: {
            browsers: ['PhantomJS']
        },
        during_watch: {
            browsers: ['PhantomJS']
        }
    };
};
