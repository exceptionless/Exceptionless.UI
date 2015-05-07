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
    'app.stack',
    'app.status'
  ])
  .config(['$locationProvider', '$stateProvider', '$uiViewScrollProvider', '$urlRouterProvider', 'dialogsProvider', 'gravatarServiceProvider', 'RestangularProvider', 'BASE_URL', 'EXCEPTIONLESS_API_KEY', '$ExceptionlessClient', 'stripeProvider', 'STRIPE_PUBLISHABLE_KEY', 'USE_HTML5_MODE', function ($locationProvider, $stateProvider, $uiViewScrollProvider, $urlRouterProvider, dialogsProvider, gravatarServiceProvider, RestangularProvider, BASE_URL, EXCEPTIONLESS_API_KEY, $ExceptionlessClient, stripeProvider, STRIPE_PUBLISHABLE_KEY, USE_HTML5_MODE) {
    $ExceptionlessClient.config.apiKey = EXCEPTIONLESS_API_KEY;
    $ExceptionlessClient.config.serverUrl = BASE_URL.substring(0, BASE_URL.indexOf('/api/'));

    $locationProvider.html5Mode({
      enabled: (typeof USE_HTML5_MODE === 'boolean' && USE_HTML5_MODE) || USE_HTML5_MODE === 'true',
      requireBase: false
    });

    $uiViewScrollProvider.useAnchorScroll();

    dialogsProvider.setSize('md');

    gravatarServiceProvider.defaults = {
      'default': 'mm'
    };

    RestangularProvider.setBaseUrl(BASE_URL);
    RestangularProvider.setFullResponse(true);
    //RestangularProvider.setDefaultHttpFields({ timeout: 10 * 1000 });

    if (!!STRIPE_PUBLISHABLE_KEY) {
      stripeProvider.setPublishableKey(STRIPE_PUBLISHABLE_KEY);
    }

    $urlRouterProvider.when('', '/type/error/dashboard');
    $urlRouterProvider.when('/', '/type/error/dashboard');

    $stateProvider.state('app', {
      abstract: true,
      templateUrl: 'app/app.tpl.html',
      controller: 'App',
      controllerAs: 'appVm'
    });

    $stateProvider.state('app.dashboard', {
      url: '/dashboard',
      controller: 'app.Dashboard',
      controllerAs: 'vm',
      templateUrl: 'app/dashboard.tpl.html',
      onEnter: ['filterService', function (filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
      }]
    });

    $stateProvider.state('app.project-dashboard', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/dashboard',
      controller: 'app.Dashboard',
      controllerAs: 'vm',
      templateUrl: 'app/dashboard.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setProjectId($stateParams.projectId, true);
      }],
      resolve: {
        project: ['$stateParams', 'projectService', function($stateParams, projectService) {
          return projectService.getById($stateParams.projectId, true);
        }]
      }
    });

    $stateProvider.state('app.project-type-dashboard', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/:type/dashboard',
      controller: 'app.Dashboard',
      controllerAs: 'vm',
      templateUrl: 'app/dashboard.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.organization-dashboard', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/dashboard',
      controller: 'app.Dashboard',
      controllerAs: 'vm',
      templateUrl: 'app/dashboard.tpl.html',
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

    $stateProvider.state('app.organization-type-dashboard', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/:type/dashboard',
      controller: 'app.Dashboard',
      controllerAs: 'vm',
      templateUrl: 'app/dashboard.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.type-dashboard', {
      url: '/type/:type/dashboard',
      controller: 'app.Dashboard',
      controllerAs: 'vm',
      templateUrl: 'app/dashboard.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
        filterService.setEventType($stateParams.type, true);
      }],
      onExit: ['filterService', function (filterService) {
        filterService.setEventType(null, true);
      }]
    });

    $stateProvider.state('app.frequent', {
      url: '/frequent',
      controller: 'app.Frequent',
      controllerAs: 'vm',
      templateUrl: 'app/frequent.tpl.html',
      onEnter: ['filterService', function (filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
      }]
    });

    $stateProvider.state('app.project-frequent', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/frequent',
      controller: 'app.Frequent',
      controllerAs: 'vm',
      templateUrl: 'app/frequent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setProjectId($stateParams.projectId, true);
      }],
      resolve: {
        project: ['$stateParams', 'projectService', function($stateParams, projectService) {
          return projectService.getById($stateParams.projectId, true);
        }]
      }
    });

    $stateProvider.state('app.project-type-frequent', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/:type/frequent',
      controller: 'app.Frequent',
      controllerAs: 'vm',
      templateUrl: 'app/frequent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.organization-frequent', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/frequent',
      controller: 'app.Frequent',
      controllerAs: 'vm',
      templateUrl: 'app/frequent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId($stateParams.organizationId, true);
      }],
      resolve: {
        project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
          return organizationService.getById($stateParams.organizationId, true);
        }]
      }
    });

    $stateProvider.state('app.organization-type-frequent', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/:type/frequent',
      controller: 'app.Frequent',
      controllerAs: 'vm',
      templateUrl: 'app/frequent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.type-frequent', {
      url: '/type/:type/frequent',
      controller: 'app.Frequent',
      controllerAs: 'vm',
      templateUrl: 'app/frequent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
        filterService.setEventType($stateParams.type, true);
      }],
      onExit: ['filterService', function (filterService) {
        filterService.setEventType(null, true);
      }]
    });

    $stateProvider.state('app.new', {
      url: '/new',
      controller: 'app.New',
      controllerAs: 'vm',
      templateUrl: 'app/new.tpl.html',
      onEnter: ['filterService', function (filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
      }]
    });

    $stateProvider.state('app.project-new', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/new',
      controller: 'app.New',
      controllerAs: 'vm',
      templateUrl: 'app/new.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setProjectId($stateParams.projectId, true);
      }],
      resolve: {
        project: ['$stateParams', 'projectService', function($stateParams, projectService) {
          return projectService.getById($stateParams.projectId, true);
        }]
      }
    });

    $stateProvider.state('app.project-type-new', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/:type/new',
      controller: 'app.New',
      controllerAs: 'vm',
      templateUrl: 'app/new.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.organization-new', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/new',
      controller: 'app.New',
      controllerAs: 'vm',
      templateUrl: 'app/new.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId($stateParams.organizationId, true);
      }],
      resolve: {
        project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
          return organizationService.getById($stateParams.organizationId, true);
        }]
      }
    });

    $stateProvider.state('app.organization-type-new', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/:type/new',
      controller: 'app.New',
      controllerAs: 'vm',
      templateUrl: 'app/new.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.type-new', {
      url: '/type/:type/new',
      controller: 'app.New',
      controllerAs: 'vm',
      templateUrl: 'app/new.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
        filterService.setEventType($stateParams.type, true);
      }],
      onExit: ['filterService', function (filterService) {
        filterService.setEventType(null, true);
      }]
    });

    $stateProvider.state('app.recent', {
      url: '/recent',
      controller: 'app.Recent',
      controllerAs: 'vm',
      templateUrl: 'app/recent.tpl.html',
      onEnter: ['filterService', function (filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
      }]
    });

    $stateProvider.state('app.project-recent', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/recent',
      controller: 'app.Recent',
      controllerAs: 'vm',
      templateUrl: 'app/recent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setProjectId($stateParams.projectId, true);
      }],
      resolve: {
        project: ['$stateParams', 'projectService', function($stateParams, projectService) {
          return projectService.getById($stateParams.projectId, true);
        }]
      }
    });

    $stateProvider.state('app.project-type-recent', {
      url: '/project/{projectId:[0-9a-fA-F]{24}}/:type/recent',
      controller: 'app.Recent',
      controllerAs: 'vm',
      templateUrl: 'app/recent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.organization-recent', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/recent',
      controller: 'app.Recent',
      controllerAs: 'vm',
      templateUrl: 'app/recent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId($stateParams.organizationId, true);
      }],
      resolve: {
        project: ['$stateParams', 'organizationService', function($stateParams, organizationService) {
          return organizationService.getById($stateParams.organizationId, true);
        }]
      }
    });

    $stateProvider.state('app.organization-type-recent', {
      url: '/organization/{organizationId:[0-9a-fA-F]{24}}/:type/recent',
      controller: 'app.Recent',
      controllerAs: 'vm',
      templateUrl: 'app/recent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
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

    $stateProvider.state('app.type-recent', {
      url: '/type/:type/recent',
      controller: 'app.Recent',
      controllerAs: 'vm',
      templateUrl: 'app/recent.tpl.html',
      onEnter: ['$stateParams', 'filterService', function ($stateParams, filterService) {
        filterService.setOrganizationId(null, true);
        filterService.setProjectId(null, true);
        filterService.setEventType($stateParams.type, true);
      }],
      onExit: ['filterService', function (filterService) {
        filterService.setEventType(null, true);
      }]
    });

    $stateProvider.state("otherwise", {
      url: "*path",
      templateUrl: 'app/not-found.tpl.html',
      onEnter: ['$stateParams', function ($stateParams) {
        $ExceptionlessClient.createNotFound($stateParams.path)
          .setProperty('$stateParams', $stateParams)
          .submit();
      }]
    });
  }])
  .run(['$http', '$state', 'editableOptions', '$location', 'rateLimitService', 'Restangular', 'stateService', 'USE_SSL', '$window', function($http, $state, editableOptions, $location, rateLimitService, Restangular, stateService, USE_SSL, $window) {
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

        if(response.status === 401) {
          stateService.save(['auth.']);
          $state.go('auth.login');
          return true;
        }

        if(response.status === 409) {
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
  }]);
}());
