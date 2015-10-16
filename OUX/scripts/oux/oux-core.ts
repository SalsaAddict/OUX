/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";

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
    export module Context {
        export interface IDataParameter { name: string; value: any; isObject: boolean; }
        export interface IData { token: string; procedure: { name: string; parameters: IDataParameter[]; } }
        export class Controller {
            static $inject: string[] = ["$scope", "$routeParams", "$parse", "$window", "$log"];
            constructor(
                private $scope: angular.IScope,
                private $routeParams: angular.route.IRouteParamsService,
                private $parse: angular.IParseService,
                private $window: angular.IWindowService,
                private $log: angular.ILogService) {
                $log.debug("OUX context instantiated on page \"" + $window.location + "\"");
            }
            public procedures: { [alias: string]: Procedure.Controller; } = {}
            public addProcedure = (procedure: Procedure.Controller) => {
                this.procedures[procedure.alias] = procedure;
                this.$log.debug("OUX procedure \"" + procedure.alias + "\" added to context");
            }
            public removeProcedure = (procedure: Procedure.Controller) => {
                delete this.procedures[procedure.alias];
                this.$log.debug("OUX procedure \"" + procedure.alias + "\" removed from context");
            }
            public parameterValue = (parameter: Parameter.Controller) => {
                var value: any = undefined;
                switch (parameter.type) {
                    case "route": value = this.$routeParams[parameter.value]; break;
                    case "scope": value = this.$parse(parameter.value)(this.$scope); break;
                    default: value = parameter.value; break;
                }
                if (IsBlank(value)) { return null; }
                switch (parameter.format) {
                    case "date": value = Convert.Date.Parser(Convert.Date.Formatter(value)); break;
                    case "object": value = angular.fromJson(angular.toJson(value)); break;
                    default: value = String(value);
                }
                return IfBlank(value, null);
            }
            public execute = (alias: string) => {
                var procedure: Procedure.Controller = this.procedures[alias],
                    data: IData = {
                        token: IfBlank(this.$window.localStorage.getItem("token")),
                        procedure: { name: procedure.name, parameters: [] }
                    };
                angular.forEach(procedure.parameters, (parameter: Parameter.Controller) => {
                    data.procedure.parameters.push({
                        name: parameter.name,
                        value: this.parameterValue(parameter),
                        isObject: parameter.format === "object"
                    });
                });
                this.$log.debug("OUX execute procedure \"" + procedure.alias + "\"");
                this.$log.debug(data);
            }
        }
        export function DirectiveFactory(): angular.IDirectiveFactory {
            var factory = function ($log: angular.ILogService): angular.IDirective {
                return { restrict: "E", scope: false, controller: Controller, controllerAs: "oux" };
            };
            factory.$inject = ["$log"];
            return factory;
        }
    }
    export module Procedure {
        export interface IScope extends angular.IScope {
            name: string; alias: string; run: string; routeParams: string;
        }
        export class Controller {
            static $inject: string[] = ["$scope", "$routeParams", "$log"];
            public parameters: { [name: string]: Parameter.Controller; } = {};
            public addParameter = (parameter: Parameter.Controller) => {
                this.parameters[parameter.name] = parameter;
                this.$log.debug("OUX parameter \"" + parameter.name + "\" added to procedure \"" + this.alias + "\"");
            }
            public removeParameter = (parameter: Parameter.Controller) => {
                delete this.parameters[parameter.name];
                this.$log.debug("OUX parameter \"" + parameter.name + "\" removed from procedure \"" + this.alias + "\"");
            }
            constructor(
                private $scope: IScope,
                $routeParams: angular.route.IRouteParamsService,
                private $log: angular.ILogService) {
                if (Option($scope.routeParams) === "true") {
                    angular.forEach($routeParams, (value: string, key: string) => {
                        this.addParameter(new Parameter.Controller(<Parameter.IScope>
                            angular.extend($scope.$new(true), { name: key, type: "route" })));
                    });
                }
            }
            get name(): string { return IfBlank(this.$scope.name); }
            get alias(): string { return IfBlank(this.$scope.alias, this.name); }
            get run(): string { return Option(this.$scope.run, "manual", ["once", "auto"]); }
        }
        export function Directive(): angular.IDirective {
            return {
                restrict: "E",
                scope: <IScope> { name: "@", alias: "@", run: "@", routeParams: "@" },
                controller: Controller,
                require: ["^^oux", "ouxProcedure"],
                link: {
                    pre: function (
                        $scope: IScope,
                        iElement: angular.IAugmentedJQuery,
                        iAttrs: angular.IAttributes,
                        controllers: [Context.Controller, Controller]) {
                        controllers[0].addProcedure(controllers[1]);
                        $scope.$on("$destroy", function () { controllers[0].removeProcedure(controllers[1]); });
                    },
                    post: function (
                        $scope: IScope,
                        iElement: angular.IAugmentedJQuery,
                        iAttrs: angular.IAttributes,
                        controllers: [Context.Controller, Controller]) {
                        if (controllers[1].run !== "manual") { controllers[0].execute(controllers[1].alias); }
                        if (controllers[1].run === "auto") {
                            $scope.$watchCollection(function () { return controllers[1].parameters; },
                                function (newValue: any, oldValue: any) {
                                    if (newValue !== oldValue) { controllers[0].execute(controllers[1].alias); }
                                });
                        }
                    }
                }
            };
        }
    }
    export module Parameter {
        export interface IScope extends angular.IScope {
            name: string; type: string; value: string; format: string; required: string;
        }
        export class Controller {
            static $inject: string[] = ["$scope"];
            constructor(private $scope: IScope) { }
            get name(): string { return IfBlank(this.$scope.name); }
            get type(): string { return Option(this.$scope.type, "value", ["route", "scope"]); }
            get value(): string { return IfBlank(this.$scope.value, (this.type === "route") ? this.name : undefined); }
            get format(): string { return Option(this.$scope.format); }
            get required(): boolean { return Option(this.$scope.required) === "true"; }
        }
        export function Directive(): angular.IDirective {
            return {
                restrict: "E",
                scope: <IScope> { name: "@", type: "@", value: "@", format: "@", required: "@" },
                controller: Controller,
                require: ["^^oux", "^^ouxProcedure", "ouxParameter"],
                link: {
                    pre: function (
                        $scope: IScope,
                        iElement: angular.IAugmentedJQuery,
                        iAttrs: angular.IAttributes,
                        controllers: [Context.Controller, Procedure.Controller, Controller]) {
                        controllers[1].addParameter(controllers[2]);
                        $scope.$on("$destroy", function () { controllers[1].removeParameter(controllers[2]); });
                    },
                    post: function (
                        $scope: IScope,
                        iElement: angular.IAugmentedJQuery,
                        iAttrs: angular.IAttributes,
                        controllers: [Context.Controller, Procedure.Controller, Controller]) {
                        if (controllers[1].run === "auto") {
                            $scope.$watch(function () { return controllers[0].parameterValue(controllers[2]); },
                                function (newValue: any, oldValue: any) {
                                    if (newValue !== oldValue) { controllers[0].execute(controllers[1].alias); }
                                });
                        }
                    }
                }
            };
        }
    }
    export module Form {
        export interface IScope extends angular.IScope {
            heading: string;
            load: string; save: string; delete: string;
            form: angular.IFormController
        }
        export class Controller {
            static $inject: string[] = ["$scope", "$route"];
            constructor(private $scope: IScope, private $route: angular.route.IRouteService) { }
            get loadable(): boolean { return !IsBlank(this.$scope.load); }
            get loadProcName(): string { return this.$scope.load.split(" as ", 2)[0]; }
            get loadProcAlias(): string { return this.$scope.load.split(" as ", 2)[1] || this.loadProcName; }
            public load: Function = undefined;
            get editable(): boolean { return !IsBlank(this.$scope.save); }
            get saveProcName(): string { return this.$scope.save.split(" as ", 2)[0]; }
            get saveProcAlias(): string { return this.$scope.save.split(" as ", 2)[1] || this.saveProcName; }
            public save: Function = undefined;
            get deletable(): boolean { return !IsBlank(this.$scope.delete); }
            get deleteProcName(): string { return this.$scope.delete.split(" as ", 2)[0]; }
            get deleteProcAlias(): string { return this.$scope.delete.split(" as ", 2)[1] || this.deleteProcName; }
            public delete: Function = undefined;
            public undo = () => { this.$route.reload(); }
            get heading(): string { return IfBlank(this.$scope.heading); }
            get dirty(): boolean { return this.$scope.form.$dirty; }
            get invalid(): boolean { return this.$scope.form.$invalid; }
        }
        export function DirectiveFactory(): angular.IDirectiveFactory {
            var factory = function Directive($injector: angular.auto.IInjectorService): angular.IDirective {
                return {
                    restrict: "E",
                    templateUrl: "ouxForm.html",
                    transclude: true,
                    scope: <IScope> { heading: "@", load: "@", save: "@", delete: "@" },
                    controller: Controller,
                    controllerAs: "ouxForm",
                    require: ["^^oux", "ouxForm"],
                    link: {
                        pre: function (
                            $scope: IScope,
                            iElement: angular.IAugmentedJQuery,
                            iAttrs: angular.IAttributes,
                            controllers: [Context.Controller, Controller]) {
                            function checkProcedureExists(namingExpression: string) {
                                var s: string[] = namingExpression.split(" as ", 2),
                                    name: string = s[0], alias: string = (s.length > 1) ? s[1] : s[0];
                                if (angular.isUndefined(controllers[0].procedures[alias])) {
                                    controllers[0].addProcedure(<Procedure.Controller>
                                        $injector.instantiate(Procedure.Controller, {
                                            $scope: angular.extend($scope.$new(true),
                                                { name: name, alias: alias, routeParams: "true" })
                                        }));
                                }
                            }
                            if (controllers[1].loadable) {
                                checkProcedureExists($scope.load);
                                controllers[1].load = function () { controllers[0].execute(controllers[1].loadProcAlias); };
                            }
                            if (controllers[1].editable) {
                                checkProcedureExists($scope.save);
                                controllers[1].save = function () { controllers[0].execute(controllers[1].saveProcAlias); };
                            }
                            if (controllers[1].deletable) {
                                checkProcedureExists($scope.delete);
                                controllers[1].delete = function () { controllers[0].execute(controllers[1].deleteProcAlias); };
                            }
                        },
                        post: function (
                            $scope: IScope,
                            iElement: angular.IAugmentedJQuery,
                            iAttrs: angular.IAttributes,
                            controllers: [Context.Controller, Controller]) {
                            controllers[1].load();
                        }
                    }
                };
            };
            factory.$inject = ["$injector"];
            return factory;
        }
    }
    export module Input {
        export interface IScope extends angular.IScope {
            label: string;
            ngModel: string;
            format: string;
            required: string;
            form: angular.IFormController
        }
        export class Controller {
            static $inject: string[] = ["$scope"];
            constructor(private $scope: IScope) { }
            get label(): string { return this.$scope.label; }
            get model(): string { return this.$scope.ngModel; }
            set model(value: string) { this.$scope.ngModel = value; }
            get format(): string { return Option(this.$scope.format); }
            get inputType(): string {
                switch (this.format) {
                    case "email": return "email";
                    case "url": return "url";
                    default: return "text";
                }
            }
            get hasAddons(): boolean {
                switch (this.format) {
                    case "email": case "url": return true;
                    default: return false;
                }
            }
            get required(): boolean { return Option(this.$scope.required) === "true"; }
        }
        export function Directive(): angular.IDirective {
            return {
                restrict: "E",
                templateUrl: "ouxInput.html",
                scope: <IScope> { label: "@", ngModel: "=", format: "@", required: "@" },
                controller: Controller,
                controllerAs: "ouxInput",
                require: ["^^ouxForm", "ouxInput"],
                link: function (
                    $scope: IScope,
                    iElement: angular.IAugmentedJQuery,
                    iAttrs: angular.IAttributes,
                    controllers: [Form.Controller, Controller]) {
                    Object.defineProperty(controllers[1], "invalid", {
                        get: function () { return controllers[0].dirty && $scope.form.$invalid; }
                    });
                }
            };
        }
    }
    export module Save {
        export interface IAttributes extends angular.IAttributes { ouxSave: string; ngModel: string; required: string; }
        export function Directive(): angular.IDirective {
            return {
                restrict: "A",
                require: ["^^oux", "^^ouxForm", "ngModel"],
                link: function (
                    $scope: angular.IScope,
                    iElement: angular.IAugmentedJQuery,
                    iAttrs: IAttributes,
                    controllers: [OUX.Context.Controller, OUX.Form.Controller, angular.INgModelController]) {
                    var procedure: Procedure.Controller = controllers[0].procedures[controllers[1].saveProcAlias],
                        parameterName: string = IfBlank(iAttrs.ouxSave, String(iAttrs.ngModel).split(".").pop()),
                        parameterScope: Parameter.IScope = <Parameter.IScope> angular.extend($scope.$new(), {
                            name: parameterName,
                            type: "value",
                            required: String(angular.isDefined(iAttrs.required))
                        });
                    Object.defineProperty(parameterScope, "value", { get: function () { return controllers[2].$modelValue; } });
                    var parameter: Parameter.Controller = new Parameter.Controller(parameterScope);
                    procedure.addParameter(parameter);
                    $scope.$on("$destroy", function () { procedure.removeParameter(parameter); });
                }
            };
        }
    }
    export module Format {
        export interface IAttributes extends angular.IAttributes { ouxFormat: string; placeholder: string; }
        export function DirectiveFactory(): angular.IDirectiveFactory {
            var factory = function (
                $locale: angular.ILocaleService,
                $filter: angular.IFilterService): angular.IDirective {
                return {
                    restrict: "A",
                    require: "ngModel",
                    link: function (
                        $scope: angular.IScope,
                        iElement: angular.IAugmentedJQuery,
                        iAttrs: IAttributes,
                        controller: angular.INgModelController) {
                        var format: string = Option(iAttrs.ouxFormat);
                        switch (format) {
                            case "email":
                                if (IsBlank(iAttrs.placeholder)) { iAttrs.$set("placeholder", "somebody@somewhere.com"); }
                                break;
                            case "url":
                                if (IsBlank(iAttrs.placeholder)) { iAttrs.$set("placeholder", "http://www.domain.com"); }
                                break;
                            case "integer":
                                if (IsBlank(iAttrs.placeholder)) {
                                    iAttrs.$set("placeholder", $filter("number")(9999, 0)
                                        .replace(new RegExp("9", "g"), "#"));
                                }
                                controller.$formatters.push(function ($modelValue: any) {
                                    if (isNaN(Number(String($modelValue)))) { return undefined; }
                                    return $filter("number")(parseInt(String($modelValue), 10), 0);
                                });
                                controller.$parsers.push(function ($viewValue: string) {
                                    if (IsBlank($viewValue)) { return undefined; }
                                    var value: string = $viewValue.replace(new RegExp($locale.NUMBER_FORMATS.GROUP_SEP, "g"), "");
                                    if (isNaN(Number(value))) { return undefined; }
                                    return parseInt(value, 10);
                                });
                                break;
                            case "decimal":
                                if (IsBlank(iAttrs.placeholder)) {
                                    iAttrs.$set("placeholder", $filter("number")(9999.99, 2)
                                        .replace(new RegExp("9", "g"), "#"));
                                }
                                controller.$formatters.push(function ($modelValue: any) {
                                    if (isNaN(Number(String($modelValue)))) { return undefined; }
                                    return $filter("number")(parseFloat(String($modelValue)), 2);
                                });
                                controller.$parsers.push(function ($viewValue: string) {
                                    if (IsBlank($viewValue)) { return undefined; }
                                    var segments: string[] = $viewValue.trim().split($locale.NUMBER_FORMATS.DECIMAL_SEP);
                                    if (segments.length > 2) { return undefined; }
                                    segments[0] = segments[0].replace(new RegExp($locale.NUMBER_FORMATS.GROUP_SEP, "g"), "");
                                    if (segments.length === 2) { segments[1] = segments[1].replace(new RegExp(" ", "g"), "#"); }
                                    if (isNaN(Number(segments[0])) || isNaN(Number(segments[1] || 0))) { return undefined; }
                                    return parseFloat(segments.join("."));
                                });
                                break;
                            default:
                                controller.$parsers.push(function ($viewValue: string) { return IfBlank($viewValue); });
                                break;
                        }
                    }
                };
            };
            factory.$inject = ["$locale", "$filter"];
            return factory;
        }
    }
}

define(["moment", "angular", "angular-locale", "angular-route", "angular-ui-bootstrap"], function (
    moment: moment.MomentStatic, angular: angular.IAngularStatic) {

    var oux: angular.IModule = angular.module("oux", ["ngRoute", "ui.bootstrap"]);

    oux.run(["$locale", "$log", function (
        $locale: angular.ILocaleService,
        $log: angular.ILogService) {
        moment.locale($locale.id);
        $log.info({
            locale: $locale.id,
            dateFormat: moment.localeData().longDateFormat("L"),
            currencySymbol: $locale.NUMBER_FORMATS.CURRENCY_SYM,
            decimalSeparator: $locale.NUMBER_FORMATS.DECIMAL_SEP,
            groupSeparator: $locale.NUMBER_FORMATS.GROUP_SEP
        });
    }]);

    oux.directive("oux", OUX.Context.DirectiveFactory());
    oux.directive("ouxProcedure", OUX.Procedure.Directive);
    oux.directive("ouxParameter", OUX.Parameter.Directive);
    oux.directive("ouxForm", OUX.Form.DirectiveFactory());
    oux.directive("ouxInput", OUX.Input.Directive);
    oux.directive("ouxSave", OUX.Save.Directive);
    oux.directive("ouxFormat", OUX.Format.DirectiveFactory());

    return oux;

});