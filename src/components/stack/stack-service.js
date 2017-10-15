(function () {
  'use strict';

  angular.module('exceptionless.stack', [
    'restangular',

    'exceptionless.filter'
  ])
  .factory('stackService', function (filterService, Restangular) {
    function addLink(id, url) {
      return Restangular.one('stacks', id).one('add-link').customPOST(url, undefined, undefined, {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });
    }

    function disableNotifications(id) {
      return Restangular.one('stacks', id).one('notifications').remove();
    }

    function enableNotifications(id) {
      return Restangular.one('stacks', id).one('notifications').post();
    }

    function getAll(options) {
      var mergedOptions = filterService.apply(options);
      var organization = filterService.getOrganizationId();
      if (organization) {
        return Restangular.one('organizations', organization).all('stacks').getList(mergedOptions);
      }

      var project = filterService.getProjectId();
      if (project) {
        return Restangular.one('projects', project).all('stacks').getList(mergedOptions);
      }

      return Restangular.all('stacks').getList(mergedOptions);
    }

    function getById(id) {
      return Restangular.one('stacks', id).get();
    }

    function getFrequent(options) {
      var mergedOptions = filterService.apply(options);
      var organization = filterService.getOrganizationId();
      if (organization) {
        return Restangular.one('organizations', organization).one('stacks').all('frequent').getList(mergedOptions);
      }

      var project = filterService.getProjectId();
      if (project) {
        return Restangular.one('projects', project).one('stacks').all('frequent').getList(mergedOptions);
      }

      return Restangular.one('stacks').all('frequent').getList(mergedOptions);
    }

    function getUsers(options) {
      var mergedOptions = filterService.apply(options);
      var organization = filterService.getOrganizationId();
      if (organization) {
        return Restangular.one('organizations', organization).one('stacks').all('users').getList(mergedOptions);
      }

      var project = filterService.getProjectId();
      if (project) {
        return Restangular.one('projects', project).one('stacks').all('users').getList(mergedOptions);
      }

      return Restangular.one('stacks').all('users').getList(mergedOptions);
    }

    function getNew(options) {
      var mergedOptions = filterService.apply(options);
      var organization = filterService.getOrganizationId();
      if (organization) {
        return Restangular.one('organizations', organization).one('stacks').all('new').getList(mergedOptions);
      }

      var project = filterService.getProjectId();
      if (project) {
        return Restangular.one('projects', project).one('stacks').all('new').getList(mergedOptions);
      }

      return Restangular.one('stacks').all('new').getList(mergedOptions);
    }

    function markCritical(id) {
      return Restangular.one('stacks', id).one('mark-critical').post();
    }

    function markNotCritical(id) {
      return Restangular.one('stacks', id).one('mark-critical').remove();
    }

    function markFixed(id, version) {
      return Restangular.one('stacks', id).post('mark-fixed', null, { version: version });
    }

    function markNotFixed(id) {
      return Restangular.one('stacks', id).one('mark-fixed').remove();
    }

    function markHidden(id) {
      return Restangular.one('stacks', id).one('mark-hidden').post();
    }

    function markNotHidden(id) {
      return Restangular.one('stacks', id).one('mark-hidden').remove();
    }

    function promote(id) {
      return Restangular.one('stacks', id).one('promote').post();
    }

    function remove(id) {
      return Restangular.one('stacks', id).remove();
    }

    function removeLink(id, url) {
      return Restangular.one('stacks', id).one('remove-link').customPOST(url, undefined, undefined, {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });
    }

    var service = {
      addLink: addLink,
      disableNotifications: disableNotifications,
      enableNotifications: enableNotifications,
      getAll: getAll,
      getById: getById,
      getFrequent: getFrequent,
      getUsers: getUsers,
      getNew: getNew,
      markCritical: markCritical,
      markNotCritical: markNotCritical,
      markFixed: markFixed,
      markNotFixed: markNotFixed,
      markHidden: markHidden,
      markNotHidden: markNotHidden,
      promote: promote,
      remove: remove,
      removeLink: removeLink
    };

    return service;
  });
}());
