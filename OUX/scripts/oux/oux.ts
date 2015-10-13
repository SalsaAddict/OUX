/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";

var defaultLocale: string = "en-gb",
    templatePath: string = "oux/oux-bootstrap.min",
    appPath: string = "oux/app.min",
    debug: boolean = true;

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

require(["angular", "oux-core", "app"], function (angular: angular.IAngularStatic, oux: angular.IModule, app: angular.IModule) {
    oux.config(["$logProvider", function ($logProvider: angular.ILogProvider) { $logProvider.debugEnabled(debug); }]);
    oux.run(["$log", function ($log: angular.ILogService) { $log.debug("OUX core running"); }]);
    app.config(["$logProvider", function ($logProvider: angular.ILogProvider) { $logProvider.debugEnabled(debug); }]);
    app.run(["$log", function ($log: angular.ILogService) { $log.debug("OUX application \"" + app.name + "\" running"); }]);
    angular.element(document).ready(function () { angular.bootstrap(document, [app.name]); });
});
