/// <reference path="../typings/requirejs/require.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
"use strict";

var app: angular.IModule = angular.module("Advent", ["ngRoute", "oux"]);

app.config(["$routeProvider", function ($routeProvider: angular.route.IRouteProvider) {
    $routeProvider
        .when("/home/:IncidentId?/:ClaimantId?/:ClaimId?", { templateUrl: "views/home.html" })
        .otherwise({ redirectTo: "/home" });
}]);