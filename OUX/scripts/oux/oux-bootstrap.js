/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
define(["oux-core"], function (oux) {
    oux.run(["$templateCache", "$log", function ($templateCache, $log) {
            $templateCache.put("ouxForm.html", "<div class=\"panel panel-default\" ng-form=\"form\">" +
                "<div class=\"panel-heading\"><h4>{{ouxForm.heading}}" +
                "<span ng-hide=\"ouxForm.isValid\"> <i class=\"fa fa-exclamation-triangle\"></i></span>" +
                "</h4></div> " +
                "<div class=\"panel-body\" ng-transclude></div>" +
                "</div>");
            $log.debug("OUX bootstrap templates loaded");
        }]);
});
//# sourceMappingURL=oux-bootstrap.js.map