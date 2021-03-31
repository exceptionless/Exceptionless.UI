# Exceptionless.UI

[![Build](https://github.com/exceptionless/Exceptionless.UI/workflows/Build/badge.svg)](https://github.com/exceptionless/Exceptionless.UI/actions)
[![Discord](https://img.shields.io/discord/715744504891703319)](https://discord.gg/6HxgFCx)
[![Donate](https://img.shields.io/badge/donorbox-donate-blue.svg)](https://donorbox.org/exceptionless?recurring=true)

Exceptionless User Interface

## Using Exceptionless

Refer to the [Exceptionless documentation](https://exceptionless.com/docs/getting-started/).

## Hosting Options

We provide very reasonably priced hosting at [Exceptionless](https://exceptionless.com). By using our hosted service, you are supporting the project and helping it get better! We also provide set up and support services.

If you would rather host Exceptionless yourself, you will need to follow the [self hosting documentation](https://exceptionless.com/docs/self-hosting/).

## Contributing

_In appreciation for anyone who submits a non-trivial pull request, we will give you a free [Exceptionless](https://exceptionless.io) paid plan for a year. After your pull request is accepted, simply send an email to team@exceptionless.io with the name of your organization and we will upgrade you to a paid plan._

Please read the [contributing document](https://github.com/exceptionless/Exceptionless/blob/master/CONTRIBUTING.md) and follow the steps below to start configuring your Exceptionless development environment.

1. You will need to clone this repo.
2. Change into the `src` directory: `cd src`.
3. Install [grunt](https://gruntjs.com/) and the development dependencies using [npm](https://www.npmjs.com/).

   ```javascript
   npm install
   ```

4. Download the JavaScript dependencies by running the following [bower](https://bower.io/) command.

   ```javascript
   npx bower install
   ```

5. Start a web server and view it on [`http://ex-ui.localtest.me:5100`](http://ex-ui.localtest.me:5100) by running the following grunt command.

   ```javascript
   npx grunt serve
   ```

## Thanks

Thanks to all the people who have contributed!

[![contributors](https://contributors-img.web.app/image?repo=exceptionless/exceptionless.ui)](https://github.com/exceptionless/exceptionless.ui/graphs/contributors)
