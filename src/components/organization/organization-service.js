(function () {
  'use strict';

  angular.module('exceptionless.organization', ['restangular'])
    .factory('organizationService', ['$cacheFactory', '$rootScope', 'Restangular', function ($cacheFactory, $rootScope, Restangular) {
      var _cache = $cacheFactory('http:organization');
      $rootScope.$on('cache:clear', _cache.removeAll);
      $rootScope.$on('cache:clear-organization', _cache.removeAll);
      $rootScope.$on('auth:logout', _cache.removeAll);
      $rootScope.$on('OrganizationChanged', _cache.removeAll);
      $rootScope.$on('ProjectChanged', _cache.removeAll);

      $rootScope.$on('StackChanged', function($event, data) {
        if (data.added) {
          _cache.removeAll();
        }
      });

      var _cachedRestangular = Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setDefaultHttpFields({ cache: _cache });
      });

      function addUser(id, email) {
        return Restangular.one('organizations', id).one('users', email).post();
      }

      function create(name) {
        return Restangular.all('organizations').post({'name': name});
      }

      function changePlan(id, options) {
        return Restangular.one('organizations', id).customPOST(null, 'change-plan', options);
      }

      function getAll(options, useCache) {
        if (useCache === undefined || useCache) {
          return _cachedRestangular.all('organizations').getList(options || {});
        }

        return Restangular.all('organizations').getList(options || {});
      }

      function getAllFreemium() {
        function onSuccess(response) {
          return response.data.plain().filter(function(o) {
            return o && !o.has_premium_features;
          });
        }

        function onFailure() {
          return [];
        }

        return getAll().then(onSuccess, onFailure);
      }

      function getPremiumFilter() {
        return getAllFreemium().then(function (organizations) {
          return '-organization:' + organizations.map(function(o) {
            return o.id;
          }).join(' -organization:');
        });
      }

      function getById(id, useCache) {
        if (useCache === undefined || useCache) {
          return _cachedRestangular.one('organizations', id).get();
        }

        return Restangular.one('organizations', id).get();
      }

      function getInvoice(id) {
        return Restangular.one('organizations', 'invoice').one(id).get();
      }

      function getInvoices(id, options) {
        return Restangular.one('organizations', id).all('invoices').getList(options || {});
      }

      function getPlans(id) {
        return _cachedRestangular.one('organizations', id).all('plans').getList();
      }

      function isNameAvailable(name) {
        return Restangular.one('organizations', 'check-name').one(name).get();
      }

      function remove(id) {
        return Restangular.one('organizations', id).remove();
      }

      function removeUser(id, email) {
        return Restangular.one('organizations', id).one('users', email).remove();
      }

      function update(id, organization) {
        return Restangular.one('organizations', id).patch(organization);
      }

      var service = {
        addUser: addUser,
        create: create,
        changePlan: changePlan,
        getAll: getAll,
        getAllFreemium: getAllFreemium,
        getPremiumFilter: getPremiumFilter,
        getById: getById,
        getInvoice: getInvoice,
        getInvoices: getInvoices,
        getPlans: getPlans,
        isNameAvailable: isNameAvailable,
        remove: remove,
        removeUser: removeUser,
        update: update
      };
      return service;
    }]);
}());
