/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";

var defaultLocale: string = "fr-fr",
    appPath: string = "oux/app.min",
    debug: boolean = true;

module OUX {
    "use strict";
    export function IsBlank(expression: any): boolean {
        if (expression === undefined) { return true; }
        if (expression === null) { return true; }
        if (expression === NaN) { return true; }
        if (expression === {}) { return true; }
        if (expression === []) { return true; }
        if (String(expression).trim().length === 0) { return true; }
        return false;
    }
    export function IfBlank(expression: any, defaultValue: any = undefined): any {
        return (IsBlank(expression)) ? defaultValue : expression;
    }
    export function Option(value: any, defaultValue: string = "", allowedValues: string[] = []): string {
        var option: string = angular.lowercase(String(value)).trim();
        if (allowedValues.length > 0) {
            var found: boolean = false;
            angular.forEach(allowedValues, (allowedValue: string) => {
                if (angular.lowercase(allowedValue).trim() === option) { found = true; }
            });
            if (!found) { option = undefined; }
        }
        return IfBlank(option, angular.lowercase(defaultValue).trim());
    }
    export module Convert {
        export interface IAttributes extends angular.IAttributes { ouxFormat: string; }
        export class Date {
            static get viewFormat(): string { return moment.localeData().longDateFormat("L"); }
            static get modelFormat(): string { return "YYYY-MM-DD"; }
            static Parser = ($viewValue: string) => {
                var value: moment.Moment = undefined;
                switch (Option($viewValue)) {
                    case "today": value = moment(); break;
                    case "yesterday": value = moment().subtract(1, "days"); break;
                    case "tomorrow": value = moment().add(1, "days"); break;
                    default:
                        value = moment($viewValue, Date.viewFormat);
                        break;
                }
                return (value.isValid()) ? value.format(Date.modelFormat) : undefined;
            }
            static Formatter = ($modelValue: any) => {
                var value: moment.Moment = moment(String($modelValue).substr(0, 10), Date.modelFormat);
                return (value.isValid()) ? value.format(Date.viewFormat) : undefined;
            }
        }
    }
}

require.config({
    baseUrl: "scripts",
    paths: {
        "angular": "angular.min",
        "angular-locale": "i18n/angular-locale_" + OUX.IfBlank(localStorage.getItem("locale"), defaultLocale),
        "angular-route": "angular-route.min",
        "moment": "moment-with-locales.min",
        "app": appPath
    },
    shim: {
        "angular": { exports: "angular" },
        "angular-locale": { deps: ["angular"] },
        "angular-route": { deps: ["angular", "angular-locale"] },
        "app": { deps: ["angular", "angular-locale", "angular-route", "oux"], exports: "app" }
    }
});

define("oux", ["moment", "angular", "angular-locale", "angular-route"], function (
    moment: moment.MomentStatic, angular: angular.IAngularStatic) {

    var oux: angular.IModule = angular.module("oux", ["ngRoute"]);

    oux.config(["$logProvider", function ($logProvider: angular.ILogProvider) { $logProvider.debugEnabled(debug); }]);

    oux.run(["$locale", "$log", function (
        $locale: angular.ILocaleService,
        $log: angular.ILogService) {
        moment.locale($locale.id);
        $log.debug("OUX core running!");
        $log.info({
            locale: $locale.id,
            momentDateFormat: moment.localeData().longDateFormat("L"),
            angularDateFormat: $locale.DATETIME_FORMATS.shortDate,
            currencySymbol: $locale.NUMBER_FORMATS.CURRENCY_SYM,
            decimalSeparator: $locale.NUMBER_FORMATS.DECIMAL_SEP,
            groupSeparator: $locale.NUMBER_FORMATS.GROUP_SEP
        });
    }]);

});

require(["angular", "app"], function (angular: angular.IAngularStatic, app: angular.IModule) {
    app.config(["$logProvider", function ($logProvider: angular.ILogProvider) { $logProvider.debugEnabled(debug); }]);
    app.run(["$log", function ($log: angular.ILogService) { $log.debug("OUX application \"" + app.name + "\" running!"); }]);
    angular.element(document).ready(function () { angular.bootstrap(document, [app.name]); });
});

