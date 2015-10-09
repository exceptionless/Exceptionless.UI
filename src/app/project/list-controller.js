(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.List', ['projectService', function (projectService) {
      var vm = this;
      vm.projects = {
        get: projectService.getAll,
        options: {
          limit: 10,
          mode: 'statistics'
        }
      };
    }
    ]);
}());
