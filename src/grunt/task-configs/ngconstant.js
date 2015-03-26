module.exports = function (grunt) {
    /* jshint undef: false */
    return {
        main: {
            options: {
                name: 'app.config',
                space: '  ',
                wrap: '(function () {\n  "use strict";\n\n  {%= __ngModule %}\n}());',
                dest: 'dist/app.config.js',
                constants: {
                    BASE_URL: process.env.API_URL || 'http://localhost:50000/api/v2',
                    FACEBOOK_APPID: process.env.FACEBOOK_APPID || '',
                    GITHUB_APPID: process.env.GITHUB_APPID || '',
                    GOOGLE_APPID: process.env.GOOGLE_APPID || '',
                    INTERCOM_APPID: process.env.INTERCOM_APPID || '',
                    LIVE_APPID: process.env.LIVE_APPID || '0000000044132A07',
                    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
                    SYSTEM_NOTIFICATION_MESSAGE: process.env.SYSTEM_NOTIFICATION_MESSAGE || '',
                    USE_HTML5_MODE: process.env.HTML5_MODE || false,
                    USE_SSL: process.env.USE_SSL || false,
                    VERSION: process.env.APPVEYOR_BUILD_VERSION || '2.0.0'
                }
            },
            build: {}
        }
    };
};