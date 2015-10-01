/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";

var defaultLocale: string = "fr-fr";

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
            static Parser = ($viewValue: any) => {
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
                var value: moment.Moment = moment($modelValue, Date.modelFormat);
                return (value.isValid()) ? value.format(Date.viewFormat) : undefined;
            }
        }
    }
    export module Parameter {
        export interface IScope extends angular.IScope {
            name: string; type: string; value: string; format: string; required: string;
        }
        export class Controller {
            static $inject: string[] = ["$scope", "$routeParams", "$parse", "$log"];
            constructor(
                private $scope: IScope,
                private $routeParams: angular.route.IRouteParamsService,
                private $parse: angular.IParseService,
                private $log: angular.ILogService) { }
            get name(): string { return IfBlank(this.$scope.name); }
            get value(): any {
                var value: any = undefined;
                switch (Option(this.$scope.type)) {
                    case "route": value = this.$routeParams[IfBlank(this.$scope.value, this.name)]; break;
                    case "scope": value = this.$parse(this.$scope.value)(this.$scope.$parent); break;
                    default: value = this.$scope.value; break;
                }
                if (IsBlank(value)) { return null; }
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
            }
            get isObject(): boolean { return this.$scope.format === "object"; }
            get required(): boolean { return Option(this.$scope.required) === "true"; }
        }
        export function DirectiveFactory(): angular.IDirectiveFactory {
            var factory = function ($log: angular.ILogService): angular.IDirective {
                return {
                    restrict: "E",
                    scope: <IScope> { name: "@", type: "@", value: "@", format: "@", required: "@" },
                    controller: Controller,
                    require: ["ouxParameter"],
                    link: function (
                        $scope: IScope,
                        iElement: angular.IAugmentedJQuery,
                        iAttrs: angular.IAttributes,
                        controllers: [Controller]) {
                        $log.debug(controllers[0].name);
                    }
                };
            }
            factory.$inject = ["$log"];
            return factory;
        }
    }
}

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

require(["moment", "angular", "angular-locale", "angular-route"], function (
    moment: moment.MomentStatic, angular: angular.IAngularStatic) {
    var oux: angular.IModule = angular.module("oux", ["ngRoute"]);

    oux.run(["$locale", "$log", function (
        $locale: angular.ILocaleService,
        $log: angular.ILogService) {
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