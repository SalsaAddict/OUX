/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";
var defaultLocale = "fr-fr", templatePath = "oux/oux-bootstrap.min", appPath = "oux/app.min", debug = true;
require.config({
    baseUrl: "scripts",
    paths: {
        "angular": "angular.min",
        "angular-locale": "i18n/angular-locale_" + (localStorage.getItem("locale") || defaultLocale),
        "angular-route": "angular-route.min",
        "angular-ui-bootstrap": "angular-ui/ui-bootstrap-tpls.min",
        "moment": "moment-with-locales.min",
        "oux-core": "oux/oux-core.min",
        "templates": templatePath,
        "app": appPath
    },
    shim: {
        "angular": { exports: "angular" },
        "angular-locale": { deps: ["angular"] },
        "angular-route": { deps: ["angular", "angular-locale"] },
        "angular-ui-bootstrap": { deps: ["angular", "angular-locale"] }
    }
});
require(["angular", "oux-core", "app"], function (angular, oux, app) {
    oux.config(["$logProvider", function ($logProvider) { $logProvider.debugEnabled(debug); }]);
    oux.run(["$log", function ($log) { $log.debug("OUX core running"); }]);
    app.config(["$logProvider", function ($logProvider) { $logProvider.debugEnabled(debug); }]);
    app.run(["$log", function ($log) { $log.debug("OUX application \"" + app.name + "\" running"); }]);
    angular.element(document).ready(function () { angular.bootstrap(document, [app.name]); });
});
//# sourceMappingURL=oux.js.map