/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
define(["oux-core"], function (oux) {
    oux.run(["$templateCache", "$log", function ($templateCache, $log) {
            $templateCache.put("ouxForm.html", "<form name=\"form\" class=\"form-horizontal\">" +
                "<div class=\"panel panel-default form-horizontal oux-form\">" +
                "<div class=\"panel-heading\"><h4><b>{{ouxForm.heading}}</b>" +
                "<span ng-show=\"ouxForm.dirty && ouxForm.invalid\"> <i class=\"fa fa-exclamation-triangle text-danger\"></i></span>" +
                "</h4></div> " +
                "<div class=\"panel-body \"><fieldset ng-disabled=\"!ouxForm.editable\" ng-transclude></fieldset></div>" +
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
                "</div></form>");
            $templateCache.put("ouxInput.html", "<div class=\"form-group\" ng-form=\"form\" ng-class=\"{'has-error': ouxInput.invalid}\">" +
                "<label class=\"control-label col-sm-3\">{{ouxInput.label}}</label>" +
                "<div class=\"col-sm-9\"><div ng-class=\"{'input-group': ouxInput.hasAddons}\">" +
                "<input type=\"{{ouxInput.inputType}}\" class=\"form-control\" ng-model=\"ouxInput.model\" ng-required=\"ouxInput.required\" " +
                "ng-attr-oux-format=\"{{ouxInput.format}}\" ng-attr-oux-save=\"{{ouxInput.save}}\" " +
                "ng-attr-uib-datepicker-popup=\"{{ouxInput.datePickerFormat}}\" ng-attr-is-open=\"ouxInput.isOpen\" />" +
                "<span class=\"input-group-btn\" ng-if=\"ouxInput.format === 'email'\">" +
                "<a class=\"btn btn-default\" ng-href=\"mailto:{{ouxInput.model}}\" ng-disabled=\"ouxInput.invalid\" title=\"Send Email\">" +
                "<i class=\"fa fa-envelope-o\"></i></a></span>" +
                "<span class=\"input-group-btn\" ng-if=\"ouxInput.format === 'url'\">" +
                "<a class=\"btn btn-default\" ng-href=\"{{ouxInput.model}}\" target=\"_blank\" ng-disabled=\"ouxInput.invalid\"" +
                "title=\"Visit Website\"><i class=\"fa fa-globe\"></i></a></span>" +
                "<span class=\"input-group-btn\" ng-if=\"ouxInput.format === 'date'\">" +
                "<button type=\"button\" class=\"btn btn-default\" ng-click=\"ouxInput.isOpen = !ouxInput.isOpen\">" +
                "<i class=\"fa fa-calendar\"></i>" +
                "</button>" +
                "</div></div>" +
                "</div>");
            $log.debug("OUX bootstrap templates loaded");
        }]);
});
//# sourceMappingURL=oux-bootstrap.js.map