/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";
var moment = require("moment");
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
    var Locale;
    (function (Locale) {
        var Service = (function () {
            function Service($window) {
                var _this = this;
                this.$window = $window;
                this.formatDate = function ($modelValue) {
                    var m = moment(String($modelValue).trim().substr(0, 10), "YYYY-MM-DD");
                    if (!m.isValid()) {
                        return;
                    }
                    return m.format(_this.dateFormat.moment);
                };
                this.parseDate = function ($viewValue) {
                    var m = moment(String($viewValue).trim(), _this.dateFormat.moment);
                    if (!m.isValid()) {
                        return;
                    }
                    return m.format("YYYY-MM-DD");
                };
                this.formatNumber = function ($modelValue, dp) {
                    if (dp === void 0) { dp = 2; }
                    if (IsBlank($modelValue) || isNaN(Number($modelValue))) {
                        return undefined;
                    }
                    var split = String(Number($modelValue).toFixed(dp)).split(".", 2);
                    split[0] = split[0]
                        .replace(/[^0-9-]/g, "")
                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                        .replace(/,/g, _this.numberFormat.groupSeparator);
                    if (split[1]) {
                        split[1] = split[1].replace(/[^0-9-]/g, "");
                    }
                    return split.join(_this.numberFormat.decimalSeparator);
                };
                this.parseNumber = function ($viewValue, dp) {
                    if (dp === void 0) { dp = 2; }
                    if (IsBlank($viewValue)) {
                        return undefined;
                    }
                    var split = String($viewValue).split(_this.numberFormat.decimalSeparator, 2);
                    split[0] = split[0].replace(new RegExp(_this.numberFormat.groupSeparator, "g"), ",");
                    if (!/^((?:[+-])?(?:\d{1,3}(?:\,?\d{3})*))$/g.test(split[0])) {
                        return undefined;
                    }
                    if (/[^0-9]/g.test(split[1])) {
                        return undefined;
                    }
                    split[0] = split[0].replace(/,/g, "");
                    return Number(split.join(".")).toFixed(dp);
                };
            }
            Object.defineProperty(Service.prototype, "localeId", {
                get: function () { return IfBlank(this.$window.localStorage.getItem("localeId"), "gb"); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Service.prototype, "dateFormat", {
                get: function () {
                    switch (this.localeId) {
                        case "us": return { angular: "MM/dd/yyyy", moment: "MM/DD/YYYY" };
                        default: return { angular: "dd/MM/yyyy", moment: "DD/MM/YYYY" };
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Service.prototype, "numberFormat", {
                get: function () {
                    switch (this.localeId) {
                        case "eu": return { groupSeparator: "\u00a0", decimalSeparator: "," };
                        default: return { groupSeparator: ",", decimalSeparator: "." };
                    }
                },
                enumerable: true,
                configurable: true
            });
            Service.$inject = ["$window"];
            return Service;
        })();
        Locale.Service = Service;
    })(Locale = OUX.Locale || (OUX.Locale = {}));
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
    var Context;
    (function (Context) {
        var Controller = (function () {
            function Controller($scope, $routeParams, $parse, $window, $log) {
                var _this = this;
                this.$scope = $scope;
                this.$routeParams = $routeParams;
                this.$parse = $parse;
                this.$window = $window;
                this.$log = $log;
                this.procedures = {};
                this.addProcedure = function (procedure) {
                    _this.procedures[procedure.alias] = procedure;
                    _this.$log.debug("OUX procedure \"" + procedure.alias + "\" added to context");
                };
                this.removeProcedure = function (procedure) {
                    delete _this.procedures[procedure.alias];
                    _this.$log.debug("OUX procedure \"" + procedure.alias + "\" removed from context");
                };
                this.parameterValue = function (parameter) {
                    var value = undefined;
                    switch (parameter.type) {
                        case "route":
                            value = _this.$routeParams[parameter.value];
                            break;
                        case "scope":
                            value = _this.$parse(parameter.value)(_this.$scope);
                            break;
                        default:
                            value = parameter.value;
                            break;
                    }
                    if (IsBlank(value)) {
                        return null;
                    }
                    switch (parameter.format) {
                        case "date":
                            value = Convert.Date.Parser(Convert.Date.Formatter(value));
                            break;
                        case "object":
                            value = angular.fromJson(angular.toJson(value));
                            break;
                        default: value = String(value);
                    }
                    return IfBlank(value, null);
                };
                this.execute = function (alias) {
                    var procedure = _this.procedures[alias], data = {
                        token: IfBlank(_this.$window.localStorage.getItem("token")),
                        procedure: { name: procedure.name, parameters: [] }
                    };
                    angular.forEach(procedure.parameters, function (parameter) {
                        data.procedure.parameters.push({
                            name: parameter.name,
                            value: _this.parameterValue(parameter),
                            isObject: parameter.format === "object"
                        });
                    });
                    _this.$log.debug("OUX execute procedure \"" + procedure.alias + "\"");
                    _this.$log.debug(data);
                };
                $log.debug("OUX context instantiated on page \"" + $window.location + "\"");
            }
            Controller.$inject = ["$scope", "$routeParams", "$parse", "$window", "$log"];
            return Controller;
        })();
        Context.Controller = Controller;
        function DirectiveFactory() {
            var factory = function ($log) {
                return { restrict: "E", scope: false, controller: Controller, controllerAs: "oux" };
            };
            factory.$inject = ["$log"];
            return factory;
        }
        Context.DirectiveFactory = DirectiveFactory;
    })(Context = OUX.Context || (OUX.Context = {}));
    var Procedure;
    (function (Procedure) {
        var Controller = (function () {
            function Controller($scope, $routeParams, $log) {
                var _this = this;
                this.$scope = $scope;
                this.$log = $log;
                this.parameters = {};
                this.addParameter = function (parameter) {
                    _this.parameters[parameter.name] = parameter;
                    _this.$log.debug("OUX parameter \"" + parameter.name + "\" added to procedure \"" + _this.alias + "\"");
                };
                this.removeParameter = function (parameter) {
                    delete _this.parameters[parameter.name];
                    _this.$log.debug("OUX parameter \"" + parameter.name + "\" removed from procedure \"" + _this.alias + "\"");
                };
                if (Option($scope.routeParams) === "true") {
                    angular.forEach($routeParams, function (value, key) {
                        _this.addParameter(new Parameter.Controller(angular.extend($scope.$new(true), { name: key, type: "route" })));
                    });
                }
            }
            Object.defineProperty(Controller.prototype, "name", {
                get: function () { return IfBlank(this.$scope.name); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "alias", {
                get: function () { return IfBlank(this.$scope.alias, this.name); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "run", {
                get: function () { return Option(this.$scope.run, "manual", ["once", "auto"]); },
                enumerable: true,
                configurable: true
            });
            Controller.$inject = ["$scope", "$routeParams", "$log"];
            return Controller;
        })();
        Procedure.Controller = Controller;
        function Directive() {
            return {
                restrict: "E",
                scope: { name: "@", alias: "@", run: "@", routeParams: "@" },
                controller: Controller,
                require: ["^^oux", "ouxProcedure"],
                link: {
                    pre: function ($scope, iElement, iAttrs, controllers) {
                        controllers[0].addProcedure(controllers[1]);
                        $scope.$on("$destroy", function () { controllers[0].removeProcedure(controllers[1]); });
                    },
                    post: function ($scope, iElement, iAttrs, controllers) {
                        if (controllers[1].run !== "manual") {
                            controllers[0].execute(controllers[1].alias);
                        }
                        if (controllers[1].run === "auto") {
                            $scope.$watchCollection(function () { return controllers[1].parameters; }, function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    controllers[0].execute(controllers[1].alias);
                                }
                            });
                        }
                    }
                }
            };
        }
        Procedure.Directive = Directive;
    })(Procedure = OUX.Procedure || (OUX.Procedure = {}));
    var Parameter;
    (function (Parameter) {
        var Controller = (function () {
            function Controller($scope) {
                this.$scope = $scope;
            }
            Object.defineProperty(Controller.prototype, "name", {
                get: function () { return IfBlank(this.$scope.name); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "type", {
                get: function () { return Option(this.$scope.type, "value", ["route", "scope"]); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "value", {
                get: function () { return IfBlank(this.$scope.value, (this.type === "route") ? this.name : undefined); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "format", {
                get: function () { return Option(this.$scope.format); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "required", {
                get: function () { return Option(this.$scope.required) === "true"; },
                enumerable: true,
                configurable: true
            });
            Controller.$inject = ["$scope"];
            return Controller;
        })();
        Parameter.Controller = Controller;
        function Directive() {
            return {
                restrict: "E",
                scope: { name: "@", type: "@", value: "@", format: "@", required: "@" },
                controller: Controller,
                require: ["^^oux", "^^ouxProcedure", "ouxParameter"],
                link: {
                    pre: function ($scope, iElement, iAttrs, controllers) {
                        controllers[1].addParameter(controllers[2]);
                        $scope.$on("$destroy", function () { controllers[1].removeParameter(controllers[2]); });
                    },
                    post: function ($scope, iElement, iAttrs, controllers) {
                        if (controllers[1].run === "auto") {
                            $scope.$watch(function () { return controllers[0].parameterValue(controllers[2]); }, function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    controllers[0].execute(controllers[1].alias);
                                }
                            });
                        }
                    }
                }
            };
        }
        Parameter.Directive = Directive;
    })(Parameter = OUX.Parameter || (OUX.Parameter = {}));
    var Form;
    (function (Form) {
        var Controller = (function () {
            function Controller($scope, $route) {
                var _this = this;
                this.$scope = $scope;
                this.$route = $route;
                this.load = undefined;
                this.save = undefined;
                this.delete = undefined;
                this.undo = function () { _this.$route.reload(); };
            }
            Object.defineProperty(Controller.prototype, "loadable", {
                get: function () { return !IsBlank(this.$scope.load); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "loadProcName", {
                get: function () { return this.$scope.load.split(" as ", 2)[0]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "loadProcAlias", {
                get: function () { return this.$scope.load.split(" as ", 2)[1] || this.loadProcName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "editable", {
                get: function () { return !IsBlank(this.$scope.save); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "saveProcName", {
                get: function () { return this.$scope.save.split(" as ", 2)[0]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "saveProcAlias", {
                get: function () { return this.$scope.save.split(" as ", 2)[1] || this.saveProcName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "deletable", {
                get: function () { return !IsBlank(this.$scope.delete); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "deleteProcName", {
                get: function () { return this.$scope.delete.split(" as ", 2)[0]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "deleteProcAlias", {
                get: function () { return this.$scope.delete.split(" as ", 2)[1] || this.deleteProcName; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "heading", {
                get: function () { return IfBlank(this.$scope.heading); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "dirty", {
                get: function () { return this.$scope.form.$dirty; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "invalid", {
                get: function () { return this.$scope.form.$invalid; },
                enumerable: true,
                configurable: true
            });
            Controller.$inject = ["$scope", "$route"];
            return Controller;
        })();
        Form.Controller = Controller;
        function DirectiveFactory() {
            var factory = function Directive($injector) {
                return {
                    restrict: "E",
                    templateUrl: "ouxForm.html",
                    transclude: true,
                    scope: { heading: "@", load: "@", save: "@", delete: "@" },
                    controller: Controller,
                    controllerAs: "ouxForm",
                    require: ["^^oux", "ouxForm"],
                    link: {
                        pre: function ($scope, iElement, iAttrs, controllers) {
                            function checkProcedureExists(namingExpression) {
                                var s = namingExpression.split(" as ", 2), name = s[0], alias = (s.length > 1) ? s[1] : s[0];
                                if (angular.isUndefined(controllers[0].procedures[alias])) {
                                    controllers[0].addProcedure($injector.instantiate(Procedure.Controller, {
                                        $scope: angular.extend($scope.$new(true), { name: name, alias: alias, routeParams: "true" })
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
                        post: function ($scope, iElement, iAttrs, controllers) { controllers[1].load(); }
                    }
                };
            };
            factory.$inject = ["$injector"];
            return factory;
        }
        Form.DirectiveFactory = DirectiveFactory;
    })(Form = OUX.Form || (OUX.Form = {}));
    var Input;
    (function (Input) {
        var Controller = (function () {
            function Controller($scope, $locale, $filter) {
                this.$scope = $scope;
                this.$locale = $locale;
                this.$filter = $filter;
                this.isOpen = false;
            }
            Object.defineProperty(Controller.prototype, "label", {
                get: function () { return this.$scope.label; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "format", {
                get: function () { return Option(this.$scope.format); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "datePickerFormat", {
                get: function () {
                    if (this.format !== "date") {
                        return undefined;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "model", {
                get: function () {
                    // if (IsBlank(this.$scope.ngModel)) { return undefined; }
                    // if (this.format === "date") { return moment(this.$scope.ngModel.trim().substr(0, 10), "YYYY-MM-DD").toDate(); }
                    return this.$scope.ngModel;
                },
                set: function (value) { this.$scope.ngModel = value; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "inputType", {
                get: function () {
                    switch (this.format) {
                        case "email": return "email";
                        case "url": return "url";
                        default: return "text";
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "required", {
                get: function () {
                    if (angular.isUndefined(this.$scope.required)) {
                        return false;
                    }
                    return Option(this.$scope.required, "true") !== "false";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Controller.prototype, "hasAddons", {
                get: function () {
                    switch (this.format) {
                        case "date":
                        case "email":
                        case "url": return true;
                        default: return false;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Controller.$inject = ["$scope", "$locale", "$filter"];
            return Controller;
        })();
        Input.Controller = Controller;
        function Directive() {
            return {
                restrict: "E",
                templateUrl: "ouxInput.html",
                scope: { label: "@", ngModel: "=", format: "@", required: "@", save: "@" },
                controller: Controller,
                controllerAs: "ouxInput",
                require: ["^^ouxForm", "ouxInput"],
                link: {
                    pre: function ($scope, iElement, iAttrs, controllers) {
                        Object.defineProperty(controllers[1], "invalid", {
                            get: function () { return controllers[0].dirty && $scope.form.$invalid; }
                        });
                        if (angular.isDefined(iAttrs.save)) {
                            Object.defineProperty(controllers[1], "save", {
                                get: function () { return IfBlank(iAttrs.save, iAttrs.ngModel.split(".").pop()); }
                            });
                        }
                    }
                }
            };
        }
        Input.Directive = Directive;
    })(Input = OUX.Input || (OUX.Input = {}));
    var Save;
    (function (Save) {
        function Directive() {
            return {
                restrict: "A",
                require: ["^^oux", "^^ouxForm", "ngModel"],
                link: {
                    pre: function ($scope, iElement, iAttrs, controllers) {
                        var procedure = controllers[0].procedures[controllers[1].saveProcAlias], parameterName = IfBlank(iAttrs.ouxSave, String(iAttrs.ngModel).split(".").pop()), parameterScope = angular.extend($scope.$new(), {
                            name: parameterName,
                            type: "value",
                            required: String(angular.isDefined(iAttrs.required))
                        });
                        Object.defineProperty(parameterScope, "value", { get: function () { return controllers[2].$modelValue; } });
                        var parameter = new Parameter.Controller(parameterScope);
                        procedure.addParameter(parameter);
                        $scope.$on("$destroy", function () { procedure.removeParameter(parameter); });
                    }
                }
            };
        }
        Save.Directive = Directive;
    })(Save = OUX.Save || (OUX.Save = {}));
    var Format;
    (function (Format) {
        function DirectiveFactory() {
            var factory = function (ouxLocale, $filter) {
                return {
                    restrict: "A",
                    require: "ngModel",
                    link: function ($scope, iElement, iAttrs, controller) {
                        var format = Option(iAttrs.ouxFormat);
                        switch (format) {
                            case "date":
                                if (IsBlank(iAttrs.placeholder)) {
                                    iAttrs.$set("placeholder", angular.lowercase(ouxLocale.dateFormat.moment));
                                }
                                /*
                                controller.$formatters.push(function ($modelValue: any) {
                                    var date: moment.Moment = moment(String($modelValue).trim().substr(0, 10), "YYYY-MM-DD");
                                    if (!date.isValid()) { return undefined; }
                                    return date.format("L");
                                });
                                */
                                controller.$parsers.push(function ($viewValue) {
                                    return $viewValue;
                                    var date = moment($viewValue.trim(), moment.localeData().longDateFormat("L"));
                                    if (!date.isValid()) {
                                        return undefined;
                                    }
                                    if (date.format("L") !== $viewValue.trim()) {
                                        return undefined;
                                    }
                                    return date.format("YYYY-MM-DD");
                                });
                                break;
                            case "integer":
                                if (IsBlank(iAttrs.placeholder)) {
                                    iAttrs.$set("placeholder", $filter("number")(9999, 0)
                                        .replace(new RegExp("9", "g"), "#"));
                                }
                                controller.$formatters.push(function ($modelValue) {
                                    return ouxLocale.formatNumber($modelValue, 0);
                                });
                                controller.$parsers.push(function ($viewValue) {
                                    return ouxLocale.parseNumber($viewValue, 0);
                                });
                                break;
                            case "decimal":
                                if (IsBlank(iAttrs.placeholder)) {
                                    iAttrs.$set("placeholder", $filter("number")(9999.99, 2)
                                        .replace(new RegExp("9", "g"), "#"));
                                }
                                controller.$formatters.push(function ($modelValue) {
                                    return ouxLocale.formatNumber($modelValue, 2);
                                });
                                controller.$parsers.push(function ($viewValue) {
                                    return ouxLocale.parseNumber($viewValue, 2);
                                });
                                break;
                            default:
                                switch (format) {
                                    case "email":
                                        if (IsBlank(iAttrs.placeholder)) {
                                            iAttrs.$set("placeholder", "somebody@somewhere.com");
                                        }
                                        break;
                                    case "url":
                                        if (IsBlank(iAttrs.placeholder)) {
                                            iAttrs.$set("placeholder", "http://www.somewhere.com");
                                        }
                                        break;
                                }
                                controller.$formatters.push(function ($modelValue) { return IfBlank($modelValue); });
                                controller.$parsers.push(function ($viewValue) { return IfBlank($viewValue); });
                                break;
                        }
                    }
                };
            };
            factory.$inject = ["ouxLocale", "$filter"];
            return factory;
        }
        Format.DirectiveFactory = DirectiveFactory;
    })(Format = OUX.Format || (OUX.Format = {}));
})(OUX || (OUX = {}));
var oux = angular.module("oux", ["ngRoute", "ui.bootstrap"]);
oux.service("ouxLocale", OUX.Locale.Service);
oux.run(["$locale", "$log", "ouxLocale", function ($locale, $log, ouxLocale) {
        moment.locale($locale.id);
        $log.info({
            locale: $locale.id,
            dateFormat: moment.localeData().longDateFormat("L"),
            currencySymbol: $locale.NUMBER_FORMATS.CURRENCY_SYM,
            decimalSeparator: $locale.NUMBER_FORMATS.DECIMAL_SEP,
            groupSeparator: $locale.NUMBER_FORMATS.GROUP_SEP,
            ouxLocale: angular.toJson(ouxLocale.dateFormat)
        });
        $log.debug(ouxLocale.formatNumber("-123456789.855"));
    }]);
oux.directive("oux", OUX.Context.DirectiveFactory());
oux.directive("ouxProcedure", OUX.Procedure.Directive);
oux.directive("ouxParameter", OUX.Parameter.Directive);
oux.directive("ouxForm", OUX.Form.DirectiveFactory());
oux.directive("ouxInput", OUX.Input.Directive);
oux.directive("ouxSave", OUX.Save.Directive);
oux.directive("ouxFormat", OUX.Format.DirectiveFactory());
//# sourceMappingURL=oux-core.js.map