(function() {
    'use strict';
    angular
        .module("exceptionless.translate", [
            'pascalprecht.translate'
        ])
        .factory("translateService", function($translate) {
            var T = {
                T: function(key) {
                    if (key) {
                        return $translate.instant(key);
                    }
                    return key;
                }
            };
            return T;
        });
}());