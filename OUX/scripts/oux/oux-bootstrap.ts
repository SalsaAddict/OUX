/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />

define(["oux"], function (oux: angular.IModule) {
    oux.run(["$templateCache", "$log", function (
        $templateCache: angular.ITemplateCacheService,
        $log: angular.ILogService) {

        $templateCache.put("ouxForm.html",
            "<oux-procedure name=\"apiSave\" run=\"auto\" route-params=\"true\"></oux-procedure>" +
            "<div class=\"panel panel-default\" ng-form=\"form\">" +
            "<div class=\"panel-heading\"><h4>{{ouxForm.heading}}" +
            "<span ng-hide=\"ouxForm.isValid\"> <i class=\"fa fa-exclamation-triangle\"></i></span>" +
            "</h4></div> " +
            "<div class=\"panel-body\" ng-transclude></div>" +
            "</div>");

        $log.debug("OUX Bootstrap templates loaded!");

    }]);
});
 