/* global process */
/* jslint node: true */
var fs = require('fs');
var md5 = require('md5');
var replace = require("replace");

function updateAppConfig() {
    var baseURL = process.env.Exceptionless_BaseURL ? process.env.Exceptionless_BaseURL : 'http://localhost:5001';
    var exceptionlessApiKey = process.env.Exceptionless_ApiKey ? process.env.Exceptionless_ApiKey : '';
    var exceptionlessServerUrl = process.env.Exceptionless_ServerUrl ? process.env.Exceptionless_ServerUrl : '';
    var facebookAppId = process.env.Exceptionless_FacebookAppId ? process.env.Exceptionless_FacebookAppId : '';
    var gitHubAppId = process.env.Exceptionless_GitHubAppId ? process.env.Exceptionless_GitHubAppId : '';
    var googleAppId = process.env.Exceptionless_GoogleAppId ? process.env.Exceptionless_GoogleAppId : '';
    var intercomId = process.env.Exceptionless_IntercomAppId ? process.env.Exceptionless_IntercomAppId : '';
    var liveAppId = process.env.Exceptionless_MicrosoftAppId ? process.env.Exceptionless_MicrosoftAppId : '';
    var slackAppId = process.env.Exceptionless_SlackAppId ? process.env.Exceptionless_SlackAppId : '';
    var stripePubKey = process.env.Exceptionless_StripePublishableApiKey ? process.env.Exceptionless_StripePublishableApiKey : '';
    var notificationMessage = process.env.Exceptionless_Message ? process.env.Exceptionless_Message : '';
    var useHTML5Mode = process.env.Exceptionless_HTML5Mode ? process.env.Exceptionless_HTML5Mode === 'true' : false;
    var useSSL = process.env.Exceptionless_EnableSSL ? process.env.Exceptionless_EnableSSL === 'true' : false;
    var enableAccountCreation = process.env.Exceptionless_EnableAccountCreation ? process.env.Exceptionless_EnableAccountCreation === 'true' : true;
    var appveyorVersionNo = process.env.APPVEYOR_BUILD_VERSION ? process.env.APPVEYOR_BUILD_VERSION + '' : '2.0.0';

    var content = [
        'var environment = {',
        '    BASE_URL: "' + baseURL + '",',
        '    EXCEPTIONLESS_API_KEY: "' + exceptionlessApiKey + '",',
        '    EXCEPTIONLESS_SERVER_URL: "' + exceptionlessServerUrl + '",',
        '    FACEBOOK_APPID: "' + facebookAppId + '",',
        '    GITHUB_APPID: "' + gitHubAppId + '",',
        '    GOOGLE_APPID: "' + googleAppId + '",',
        '    INTERCOM_APPID: "' + intercomId + '",',
        '    LIVE_APPID: "' + liveAppId + '",',
        '    SLACK_APPID: "' + slackAppId + '",',
        '    STRIPE_PUBLISHABLE_KEY: "' + stripePubKey + '",',
        '    SYSTEM_NOTIFICATION_MESSAGE: "' + notificationMessage + '",',
        '    USE_HTML5_MODE: ' + useHTML5Mode + ',',
        '    USE_SSL: ' + useSSL + ',',
        '    APPVEYOR_BUILD_VERSION: ' + appveyorVersionNo + ',',
        '    ENABLE_ACCOUNT_CREATION: ' + enableAccountCreation + '};',
        ';'
    ].join('\n');

    var hash = md5(content);
// todo: use cache buster in name
    var configFile = "app-config." + hash + ".js";

    fs.writeFile('../../../../' + configFile, content, function (err) {
        if (err)
            throw err;

        console.log('Config generated.');
    });

    replace({
        regex: '"app-config.js"',
        replacement: configFile,
        paths: ['../../../../index.html'],
        recursive: false,
        silent: false
    });
}

function installGoogleTagManager() {
    var googleTagManagerId = process.env.Exceptionless_GoogleTagManagerId ? process.env.Exceptionless_GoogleTagManagerId : '';
    var content = [
        '<noscript><iframe src="//www.googletagmanager.com/ns.html?id=' + googleTagManagerId + '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>',
        "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],",
        "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);",
        "})(window,document,'script','dataLayer','" + googleTagManagerId + "');</script>"
    ].join('');

    if (!googleTagManagerId) {
        content = '';
    }

    replace({
        regex: '<google-tag-manager><\/google-tag-manager>',
        replacement: content,
        paths: ['../../../../index.html'],
        recursive: false,
        silent: false
    });
}

updateAppConfig();
installGoogleTagManager();
