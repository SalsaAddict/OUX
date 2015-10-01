/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";
var defaultLocale = "fr-fr";
var OUX;
(function (OUX) {
    "use strict";
    function IsBlank(expression) {
        if (expression === undefined) {
            return true;
        }
        if (expression === null) {
            return true;
        }
        if (expression === NaN) {
            return true;
        }
        if (expression === {}) {
            return true;
        }
        if (expression === []) {
            return true;
        }
        if (String(expression).trim().length === 0) {
            return true;
        }
        return false;
    }
    OUX.IsBlank = IsBlank;
    function IfBlank(expression, defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        return (IsBlank(expression)) ? defaultValue : expression;
    }
    OUX.IfBlank = IfBlank;
    function Option(value, defaultValue, allowedValues) {
        if (defaultValue === void 0) { defaultValue = ""; }
        if (allowedValues === void 0) { allowedValues = []; }
        var option = angular.lowercase(String(value)).trim();
        if (allowedValues.length > 0) {
            var found = false;
            angular.forEach(allowedValues, function (allowedValue) {
                if (angular.lowercase(allowedValue).trim() === option) {
                    found = true;
                }
            });
            if (!found) {
                option = undefined;
            }
        }
        return IfBlank(option, angular.lowercase(defaultValue).trim());
    }
    OUX.Option = Option;
    var Convert;
    (function (Convert) {
        var Date = (function () {
            function Date() {
            }
            Object.defineProperty(Date, "viewFormat", {
                get: function () { return moment.localeData().longDateFormat("L"); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Date, "modelFormat", {
                get: function () { return "YYYY-MM-DD"; },
                enumerable: true,
                configurable: true
            });
            Date.Parser = function ($viewValue) {
                var value = undefined;
                switch (Option($viewValue)) {
                    case "today":
                        value = moment();
                        break;
                    case "yesterday":
                        value = moment().subtract(1, "days");
                        break;
                    case "tomorrow":
                        value = moment().add(1, "days");
                        break;
                    default:
                        value = moment($viewValue, Date.viewFormat);
                        break;
                }
                return (value.isValid()) ? value.format(Date.modelFormat) : undefined;
            };
            Date.Formatter = function ($modelValue) {
                var value = moment($modelValue, Date.modelFormat);
                return (value.isValid()) ? value.format(Date.viewFormat) : undefined;
            };
            return Date;
        })();
        Convert.Date = Date;
    })(Convert = OUX.Convert || (OUX.Convert = {}));
    var Parameter;
    (function (Parameter) {
        var Controller = (function () {
            function Controller($scope, $routeParams, $parse, $log) {
                this.$scope = $scope;
                this.$routeParams = $routeParams;
                this.$parse = $parse;
                this.$log = $log;
            }
            Object.defineProperty(Controller.prototype, "name", {
                get: function () { return IfBlank(this.$scope.name); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "value", {
                get: function () {
                    var value = undefined;
                    switch (Option(this.$scope.type)) {
                        case "route":
                            value = this.$routeParams[IfBlank(this.$scope.value, this.name)];
                            break;
                        case "scope":
                            value = this.$parse(this.$scope.value)(this.$scope.$parent);
                            break;
                        default:
                            value = this.$scope.value;
                            break;
                    }
                    if (IsBlank(value)) {
                        return null;
                    }
                    switch (Option(this.$scope.format)) {
                        case "date":
                            value = OUX.Convert.Date.Parser(OUX.Convert.Date.Formatter(value));
                            break;
                        case "object":
                            value = angular.fromJson(angular.toJson(value));
                            break;
                        default: value = String(value);
                    }
                    return IfBlank(value, null);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "isObject", {
                get: function () { return this.$scope.format === "object"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "required", {
                get: function () { return Option(this.$scope.required) === "true"; },
                enumerable: true,
                configurable: true
            });
            Controller.$inject = ["$scope", "$routeParams", "$parse", "$log"];
            return Controller;
        })();
        Parameter.Controller = Controller;
        function DirectiveFactory() {
            var factory = function ($log) {
                return {
                    restrict: "E",
                    scope: { name: "@", type: "@", value: "@", format: "@", required: "@" },
                    controller: Controller,
                    require: ["ouxParameter"],
                    link: function ($scope, iElement, iAttrs, controllers) {
                        $log.debug(controllers[0].name);
                    }
                };
            };
            factory.$inject = ["$log"];
            return factory;
        }
        Parameter.DirectiveFactory = DirectiveFactory;
    })(Parameter = OUX.Parameter || (OUX.Parameter = {}));
})(OUX || (OUX = {}));
require.config({
    baseUrl: "scripts",
    paths: {
        "angular": "angular.min",
        "angular-locale": "i18n/angular-locale_" + OUX.IfBlank(localStorage.getItem("locale"), defaultLocale),
        "angular-route": "angular-route.min",
        "moment": "moment-with-locales.min"
    },
    shim: {
        "angular": { exports: "angular" },
        "angular-locale": { deps: ["angular"] },
        "angular-route": { deps: ["angular", "angular-locale"] }
    }
});
require(["moment", "angular", "angular-locale", "angular-route"], function (moment, angular) {
    var oux = angular.module("oux", ["ngRoute"]);
    oux.run(["$locale", "$log", function ($locale, $log) {
            moment.locale($locale.id);
            $log.info({
                locale: $locale.id,
                momentDateFormat: moment.localeData().longDateFormat("L"),
                angularDateFormat: $locale.DATETIME_FORMATS.shortDate,
                currencySymbol: $locale.NUMBER_FORMATS.CURRENCY_SYM,
                decimalSeparator: $locale.NUMBER_FORMATS.DECIMAL_SEP,
                groupSeparator: $locale.NUMBER_FORMATS.GROUP_SEP
            });
        }]);
    oux.directive("ouxParameter", OUX.Parameter.DirectiveFactory());
    angular.element(document).ready(function () {
        angular.bootstrap(document, ["oux"]);
    });
});
//# sourceMappingURL=oux.js.map