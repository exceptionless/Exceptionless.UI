/* global process */
/* jslint node: true */
var fs = require('fs');

var baseUrl = process.env.EX_BASE_URL ? process.env.EX_BASE_URL : 'http://localhost:51000/api/v2';
var exceptionlessApiKey = process.env.EX_API_KEY ? process.env.EX_API_KEY : 'Bx7JgglstPG544R34Tw9T7RlCed3OIwtYXVeyhT2';
var facebookAppId = process.env.EX_FACEBOOK_APP_ID ? process.env.EX_FACEBOOK_APP_ID : '';
var gitHubAppId = process.env.EX_GITHUB_APP_ID ? process.env.EX_GITHUB_APP_ID : '';
var googleAppId = process.env.EX_GOOGLE_APP_ID ? process.env.EX_GOOGLE_APP_ID : '';
var intercomId = process.env.EX_INTERCOM_ID ? process.env.EX_INTERCOM_ID : '';
var liveAppId = process.env.EX_LIVE_APP_ID ? process.env.EX_LIVE_APP_ID : '';
var stripePubKey = process.env.EX_STRIPE_PUB_KEY ? process.env.EX_STRIPE_PUB_KEY : '';
var notificationMessage = process.env.EX_MESSAGE ? process.env.EX_MESSAGE : '';
var useHtml5mode = process.env.EX_HTML5MODE ? process.env.EX_HTML5MODE === 'true' : false;
var useSsl = process.env.EX_USESSL ? process.env.EX_USESSL === 'true' : false;

var content = [
	'(function () {',
	'  \'use strict\';',
	'',
	'  angular.module("app.config", [])',
	'    .constant("BASE_URL", "' + baseUrl + '")',
	'    .constant("EXCEPTIONLESS_API_KEY", "' + exceptionlessApiKey + '")',
	'    .constant("FACEBOOK_APPID", "' + facebookAppId + '")',
	'    .constant("GITHUB_APPID", "' + gitHubAppId + '")',
	'    .constant("GOOGLE_APPID", "' + googleAppId + '")',
	'    .constant("INTERCOM_APPID", "' + intercomId + '")',
	'    .constant("LIVE_APPID", "' + liveAppId + '")',
	'    .constant("STRIPE_PUBLISHABLE_KEY", "' + stripePubKey + '")',
	'    .constant("SYSTEM_NOTIFICATION_MESSAGE", "' + notificationMessage + '")',
	'    .constant("USE_HTML5_MODE", ' + useHtml5mode + ')',
	'    .constant("USE_SSL", ' + useSsl + ')',
	'    .constant("VERSION", "2.0.0");',
	'}());'
].join('\n');

fs.writeFile('../../../../app.config.js', content, function (err) {
  if (err)
    throw err;
  
  console.log('Config generated.');
});

// todo: save config file with cache buster in name and update the index.html