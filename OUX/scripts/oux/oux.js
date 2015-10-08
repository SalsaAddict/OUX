/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";
var defaultLocale = "en-gb", templatePath = "oux/oux-bootstrap.min", appPath = "oux/app.min", debug = true;
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
                var value = moment(String($modelValue).substr(0, 10), Date.modelFormat);
                return (value.isValid()) ? value.format(Date.viewFormat) : undefined;
            };
            return Date;
        })();
        Convert.Date = Date;
    })(Convert = OUX.Convert || (OUX.Convert = {}));
})(OUX || (OUX = {}));
require.config({
    baseUrl: "scripts",
    paths: {
        "angular": "angular.min",
        "angular-locale": "i18n/angular-locale_" + OUX.IfBlank(localStorage.getItem("locale"), defaultLocale),
        "angular-route": "angular-route.min",
        "moment": "moment-with-locales.min",
        "templates": templatePath,
        "app": appPath
    },
    shim: {
        "angular": { exports: "angular" },
        "angular-locale": { deps: ["angular"] },
        "angular-route": { deps: ["angular", "angular-locale"] },
        "templates": { deps: ["oux"] },
        "app": { deps: ["angular", "angular-locale", "angular-route", "oux", "templates"], exports: "app" }
    }
});
define("oux", ["moment", "angular", "angular-locale", "angular-route"], function (moment, angular) {
    var oux = angular.module("oux", ["ngRoute"]);
    oux.config(["$logProvider", function ($logProvider) { $logProvider.debugEnabled(debug); }]);
    oux.run(["$locale", "$log", function ($locale, $log) {
            moment.locale($locale.id);
            $log.info(angular.fromJson(angular.toJson({
                locale: $locale.id,
                dateFormat: moment.localeData().longDateFormat("L"),
                currencySymbol: $locale.NUMBER_FORMATS.CURRENCY_SYM,
                decimalSeparator: $locale.NUMBER_FORMATS.DECIMAL_SEP,
                groupSeparator: $locale.NUMBER_FORMATS.GROUP_SEP
            })));
            $log.debug("OUX core running!");
        }]);
    return oux;
});
require(["angular", "app"], function (angular, app) {
    app.config(["$logProvider", function ($logProvider) { $logProvider.debugEnabled(debug); }]);
    app.run(["$log", function ($log) { $log.debug("OUX application \"" + app.name + "\" running!"); }]);
    angular.element(document).ready(function () { angular.bootstrap(document, [app.name]); });
});
//# sourceMappingURL=oux.js.map