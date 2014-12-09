(function () {
  'use strict';

  angular.module('exceptionless.user', ['restangular'])
    .factory('userService', ['Restangular', function (Restangular) {
      function getCurrentUser() {
        return Restangular.one('users', 'me').get();
      }

      function getById(id) {
        return Restangular.one('users', id).get();
      }

      function getByOrganizationId(id, options) {
        return Restangular.one('organizations', id).all('users').getList(options || {});
      }

      function resendVerificationEmail(id) {
        return Restangular.one('users', id).one('resend-verification-email').get();
      }

      function update(id, project) {
        return Restangular.one('users', id).patch(project);
      }

      function updateEmailAddress(id, email) {
        return Restangular.one('users', id).one('email-address', email).post();
      }

      function verifyEmailAddress(token) {
        return Restangular.one('users', 'verify-email-address').one(token).get();
      }

      var service = {
        getCurrentUser: getCurrentUser,
        getById: getById,
        getByOrganizationId: getByOrganizationId,
        resendVerificationEmail: resendVerificationEmail,
        update: update,
        updateEmailAddress: updateEmailAddress,
        verifyEmailAddress: verifyEmailAddress
      };

      return service;
    }]);
}());
