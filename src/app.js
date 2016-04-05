(function () {
  'use strict';

  angular.module('app', [
    'angular-filters',
    'angular-loading-bar',
    'angular-locker',
    'angular-intercom',
    'angular-rickshaw',
    'angular-stripe',
    'cfp.hotkeys',
    'checklist-model',
    'debounce',
    'ngAnimate',
    'restangular',
    'satellizer',
    'ui.bootstrap',
    'ui.gravatar',
    'ui.router',
    'xeditable',

    'dialogs.main',
    'dialogs.default-translations',

    'exceptionless',
    'exceptionless.auth',
    'exceptionless.auto-active',
    'exceptionless.billing',
    'exceptionless.date-filter',
    'exceptionless.event',
    'exceptionless.events',
    'exceptionless.filter',
    'exceptionless.intercom',
    'exceptionless.loading-bar',
    'exceptionless.notification',
    'exceptionless.organization',
    'exceptionless.organization-notifications',
    'exceptionless.project',
    'exceptionless.project-filter',
    'exceptionless.rate-limit',
    'exceptionless.refresh',
    'exceptionless.release-notification',
    'exceptionless.search-filter',
    'exceptionless.signalr',
    'exceptionless.stack',
    'exceptionless.stacks',
    'exceptionless.stat',
    'exceptionless.state',
    'exceptionless.ui-nav',
    'exceptionless.ui-scroll',
    'exceptionless.ui-shift',
    'exceptionless.ui-toggle-class',
    'exceptionless.user',
    'app.account',
    'app.admin',
    'app.auth',
    'app.config',
    'app.event',
    'app.organization',
    'app.payment',
    'app.project',
    'app.session',
    'app.stack',
    'app.status'
  ])
  .config(['$locationProvider', '$stateProvider', '$uiViewScrollProvider', '$urlRouterProvider', 'dialogsProvider', 'gravatarServiceProvider', 'RestangularProvider', 'BASE_URL', 'EXCEPTIONLESS_API_KEY', '$ExceptionlessClient', 'stripeProvider', 'STRIPE_PUBLISHABLE_KEY', 'USE_HTML5_MODE', function ($locationProvider, $stateProvider, $uiViewScrollProvider, $urlRouterProvider, dialogsProvider, gravatarServiceProvider, RestangularProvider, BASE_URL, EXCEPTIONLESS_API_KEY, $ExceptionlessClient, stripeProvider, STRIPE_PUBLISHABLE_KEY, USE_HTML5_MODE) {
    if (EXCEPTIONLESS_API_KEY) {
      var config = $ExceptionlessClient.config;
      config.apiKey = EXCEPTIONLESS_API_KEY;
      config.serverUrl = BASE_URL;
      config.defaultTags.push('UI');
      config.setVersion('@@version');
      config.useReferenceIds();
      config.useSessions();
    }

    $locationProvider.html5Mode({
      enabled: (typeof USE_HTML5_MODE === 'boolean' && USE_HTML5_MODE) || USE_HTML5_MODE === 'true',
      requireBase: false
    });

    $uiViewScrollProvider.useAnchorScroll();

    dialogsProvider.setSize('md');

    gravatarServiceProvider.defaults = {
      'default': 'mm'
    };

    RestangularProvider.setBaseUrl(BASE_URL + '/api/v2');
    RestangularProvider.setFullResponse(true);
    //RestangularProvider.setDefaultHttpFields({ timeout: 10 * 1000 });

    if (!!STRIPE_PUBLISHABLE_KEY) {
      stripeProvider.setPublishableKey(STRIPE_PUBLISHABLE_KEY);
    }

    $stateProvider.state('app', {
      abstract: true,
      templateUrl: 'app/app.tpl.html',
      controller: 'App',
      controllerAs: 'appVm',
      data: {
        requireAuthentication: true
      }
    });

    var routes = [
      { key: 'dashboard', title: 'Dashboard', controller: 'app.Dashboard' },
      { key: 'frequent', title: 'Most Frequent', controller: 'app.Frequent' },
      { key: 'new', title: 'New', controller: 'app.New' },
      { key: 'recent', title: 'Most Recent', controller: 'app.Recent' },
      { key: 'users', title: 'Most Users', controller: 'app.Users' }
    ];

    routes.forEach(function(route) {
      $stateProvider.state('app.' + route.key, {
        title: route.title,
        url: '/' + route.key,
        controller: route.controller,
        controllerAs: 'vm',
        templateUrl: 'app/' + route.key + '.tpl.html',
        onEnter: ['filterService', function (filterService) {
          filterService.setOrganizationId(null, true);
          filterService.setProjectId(null, true);
        }]
      });

      $stateProvider.state('app.project-' + route.key, {
        title: route.title,
        url: '/project/{projectId:[0-9a-fA-F]{24}}/' + route.key,
        controller: route.controller,
        controllerAs: 'vm',
        templateUrl: 'app/' + route.key +'.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setProjectId($stateParams.projectId, true);
        }],
        resolve: {
          project: ['$stateParams', 'projectService', function($stateParams, projectService) {
            return projectService.getById($stateParams.projectId, true);
          }]
        }
      });

      $stateProvider.state('app.project-type-'+ route.key, {
        title: route.title,
        url: '/project/{projectId:[0-9a-fA-F]{24}}/:type/'+ route.key,
        controller: route.controller,
        controllerAs: 'vm',
        templateUrl: 'app/' + route.key + '.tpl.html',
        onEnter: ['$state', '$stateParams', 'filterService', function ($state, $stateParams, filterService) {
          if ($stateParams.type === 'session') {
            return $state.go('app.session-project-dashboard', $stateParams);
          }

          filterService.setProjectId($stateParams.projectId, true);
          filterService.setEventType($stateParams.type, true);
        }],
        onExit: ['filterService', function (filterService) {
          filterService.setEventType(null, true);
        }],
        resolve: {
          project: ['$stateParams', 'projectService', function($stateParams, projectService) {
            return projectService.getById($stateParams.projectId, true);
          }]
        }
      });

      $stateProvider.state('app.organization-' + route.key, {
        title: route.title,
        url: '/organization/{organizationId:[0-9a-fA-F]{24}}/' + route.key,
        controller: route.controller,
        controllerAs: 'vm',
        templateUrl: 'app/'+ route.key + '.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setOrganizationId($stateParams.organizationId, true);
          filterService.setEventType(null, true);
        }],
        resolve: {
          project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
            return organizationService.getById($stateParams.organizationId, true);
          }]
        }
      });

      $stateProvider.state('app.organization-type-' + route.key, {
        title: route.title,
        url: '/organization/{organizationId:[0-9a-fA-F]{24}}/:type/' + route.key,
        controller: route.controller,
        controllerAs: 'vm',
        templateUrl: 'app/' + route.key + '.tpl.html',
        onEnter: ['$state', '$stateParams', 'filterService', function ($state, $stateParams, filterService) {
          if ($stateParams.type === 'session') {
            return $state.go('app.session-organization-dashboard', $stateParams);
          }

          filterService.setOrganizationId($stateParams.organizationId, true);
          filterService.setEventType($stateParams.type, true);
        }],
        onExit: ['filterService', function (filterService) {
          filterService.setEventType(null, true);
        }],
        resolve: {
          project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
            return organizationService.getById($stateParams.organizationId, true);
          }]
        }
      });

      $stateProvider.state('app.type-' + route.key, {
        title: route.title,
        url: '/type/:type/' + route.key,
        controller: route.controller,
        controllerAs: 'vm',
        templateUrl: 'app/' + route.key + '.tpl.html',
        onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
          filterService.setOrganizationId(null, true);
          filterService.setProjectId(null, true);
          filterService.setEventType($stateParams.type, true);
        }],
        onExit: ['filterService', function (filterService) {
          filterService.setEventType(null, true);
        }]
      });
    });

    var onEnter = ['authService', '$location', '$state', '$timeout', function (authService, $location, $state, $timeout) {
      if ($location.search().code){
        return;
      }

      return $timeout(function () {
        if (authService.isAuthenticated()) {
          $state.transitionTo('app.type-dashboard', {type: 'error'});
        } else {
          $state.transitionTo('auth.login');
        }
      });
    }];

    $stateProvider.state('loading', {
      url: '',
      template: null,
      onEnter: onEnter
    });

    $stateProvider.state('loading-slash', {
      url: '/',
      template: null,
      onEnter: onEnter
    });

    $stateProvider.state('otherwise', {
      url: '*path',
      templateUrl: 'app/not-found.tpl.html',
      onEnter: ['$stateParams', function ($stateParams) {
        $ExceptionlessClient.createNotFound($stateParams.path)
          .setProperty('$stateParams', $stateParams)
          .submit();
      }]
    });
  }])
  .run(['$http', '$rootScope', '$state', 'authService', 'editableOptions', '$location', 'rateLimitService', 'Restangular', 'stateService', 'USE_SSL', '$window', function($http, $rootScope, $state, authService, editableOptions, $location, rateLimitService, Restangular, stateService, USE_SSL, $window) {
    if ($window.top.location.hostname !== $window.self.location.hostname){
      $window.top.location.href = $window.self.location.href;
    }

    if (((typeof USE_SSL === 'boolean' && USE_SSL) || USE_SSL === 'true') && $location.protocol() !== 'https') {
      $window.location.href = $location.absUrl().replace('http', 'https');
    }

    editableOptions.theme = 'bs3';
    Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
      function handleError(response) {
        if ($state.current.name !== 'status' && (response.status === 0 || response.status === 503)) {
          stateService.save(['auth.', 'status']);
          $state.go('status', { redirect: true });
          return true;
        }

        if (response.status === 401) {
          stateService.save(['auth.']);
          $state.go('auth.login');
          return true;
        }

        if (response.status === 409) {
          return true;
        }

        return false;
      }

      rateLimitService.updateFromResponseHeader(response);

      // Lets retry as long as we are not on the status page.
      if ($state.current.name !== 'status' && (response.status === 0 || response.status === 503)) {
        // No request interceptors will be called on the retry.
        $http(response.config).then(responseHandler, function (response) {
          if (!handleError(response)) {
            deferred.reject(response);
          }
        });

        return false;
      }

      return !handleError(response);
    });

    $rootScope.page = {
      setTitle: function(title) {
        if (title) {
          this.title = title + ' - Exceptionless';
        } else {
          this.title = 'Exceptionless';
        }
      }
    };

    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if (!toState || !toState.data || !toState.data.requireAuthentication)
        return;

      if (!authService.isAuthenticated()) {
        event.preventDefault();
        stateService.save(['auth.']);
        $state.transitionTo('auth.login');
      }

      $rootScope.page.setTitle(toState.title);
    });
  }]);
}());
