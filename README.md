# Exceptionless.UI
[![Build status](https://ci.appveyor.com/api/projects/status/18th2gqmbt86p5y0?svg=true)](https://ci.appveyor.com/project/Exceptionless/exceptionless-ui) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/exceptionless/Discuss)

Exceptionless User Interface

## Getting Started

_** NOTE: If you simply want to use Exceptionless, just go to [http://exceptionless.io](http://exceptionless.io) and signup for a free account and you will be up and running in seconds._

1. You will need to clone this repo.
2. Install [grunt](http://gruntjs.com/) and the development dependencies using [npm](https://www.npmjs.com/).
```javascript
npm install -g grunt-cli
npm install
```
3. Download the JavaScript dependencies by running the following [bower](http://bower.io/) command.
```javascript
bower install
```
4. Start a web server and view it on [`http://localhost:9001`](http://localhost:9001) by running the following grunt command.
```javascript
grunt serve
```
## Using Exceptionless

Refer to the Exceptionless documentation here: [Exceptionless Docs](http://docs.exceptionless.io)

## Hosting Options

1. We provide very reasonably priced hosting at [Exceptionless](http://exceptionless.io). By using our hosted service, you are supporting the project and helping it get better! We also provide set up and support services.
2. If you would rather host Exceptionless yourself, you will need to follow these steps:
  1. From the command prompt run `grunt build` to build the project. *You can also download a prebuilt package from our [myget feed](https://www.myget.org/feed/exceptionless/package/nuget/Exceptionless.UI)*
  2. Copy the `dist` folder to any hosting solution or cdn.
  3. Update the `app.config.js` file with your settings.

