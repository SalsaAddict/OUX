/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
define(["oux-core"], function (oux) {
    oux.run(["$templateCache", "$log", function ($templateCache, $log) {
            $templateCache.put("ouxForm.html", "<div class=\"panel panel-default form-horizontal oux-form\" ng-form=\"form\">" +
                "<div class=\"panel-heading\"><h4><b>{{ouxForm.heading}}</b>" +
                "<span ng-show=\"ouxForm.invalid\"> <i class=\"fa fa-exclamation-triangle text-danger\"></i></span>" +
                "</h4></div> " +
                "<div class=\"panel-body\" ng-transclude></div>" +
                "<div class=\"panel-footer clearfix\"><div class=\"pull-right\">" +
                "<div class=\"btn-group\" ng-if=\"!ouxForm.dirty\">" +
                "<button type=\"button\" class=\"btn btn-danger\" ng-if=\"ouxForm.deletable\" ng-click=\"ouxForm.delete()\">" +
                "<i class=\"fa fa-trash-o\"></i> Delete</button>" +
                "<button type=\"button\" class=\"btn btn-default\" ng-click=\"ouxForm.back()\">" +
                "<i class=\"fa fa-chevron-circle-left\"></i> Back</button>" +
                "</div>" +
                "<div class=\"btn-group\" ng-if=\"ouxForm.dirty\">" +
                "<button type=\"button\" class=\"btn btn-warning\" ng-click=\"ouxForm.undo()\">" +
                "<i class=\"fa fa-undo\"></i> Undo</button>" +
                "<button type=\"button\" class=\"btn\" ng-disabled=\"ouxForm.invalid\" ng-click=\"ouxForm.save()\" " +
                "ng-class=\"{'btn-primary': !ouxForm.invalid, 'btn-default': ouxForm.invalid}\">" +
                "<i class=\"fa fa-save\"></i> Save</button>" +
                "</div>" +
                "</div></div>" +
                "</div>");
            $templateCache.put("ouxInput.html", "<div class=\"form-group\" ng-form=\"form\" ng-class=\"{'has-error': ouxInput.invalid}\">" +
                "<label class=\"control-label col-sm-3\">{{ouxInput.label}}</label>" +
                "<div class=\"col-sm-9\">" +
                "<input type=\"text\" class=\"form-control\" ng-model=\"ouxInput.model\" ng-required=\"ouxInput.required\" />" +
                "</div>" +
                "</div>");
            $log.debug("OUX bootstrap templates loaded");
        }]);
});
//# sourceMappingURL=oux-bootstrap.js.map