(function () {
  'use strict';

  angular.module('exceptionless.admin', ['restangular'])
    .factory('adminService', ['Restangular', function (Restangular) {
      function changePlan(id, options) {
        return Restangular.one('admin', id).customPOST(null, 'change-plan', options);
      }

      var service = {
        changePlan: changePlan
      };

      return service;
    }]);
}());
