(function () {
  'use strict';

  angular.module('exceptionless.organization', ['restangular'])
    .factory('organizationService', ['Restangular', function (Restangular) {
      function addUser(id, email) {
        return Restangular.one('organizations', id).one('users', email).remove();
      }

      function create(name) {
        return Restangular.all('organizations').post({'name': name});
      }

      function changePlan(id, options) {
        return Restangular.one('organizations', id).customPOST(null, 'change-plan', options);
      }

      function getAll(options) {
        return Restangular.all('organizations').getList(angular.extend({}, { limit: 100 }, options));
      }

      function getById(id) {
        return Restangular.one('organizations', id).get();
      }

      function getInvoices(id, options) {
        return Restangular.one('organizations', id).all('invoices').getList(options || {});
      }

      function getPlans(id) {
        return Restangular.one('organizations', id).all('plans').getList();
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
        getById: getById,
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
