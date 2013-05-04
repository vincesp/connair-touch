angular.module('connair', ['ngResource', 'ngCookies', 'http-auth-interceptor'])
.config(function ($routeProvider) {
  var HOME = {templateUrl: 'parts/panelSelection.html'};
  $routeProvider
  .when('/', HOME)
  .when('/login', {templateUrl: 'parts/login.html'})
  .when('/:panelTitle', {templateUrl: 'parts/panel.html', controller: 'PanelCtrl'})
  .otherwise(HOME);
})
.controller('MainCtrl', function($scope, $resource, $http, $location, $cookies) {
  var HOME_TITLE = $scope.pageTitle = 'ConnAir Remote Touch';
  var CONFIG_PATH = 'config/panel-config.json';
  function convertShy(t) {
    return t.replace(/&shy;/g, '\u00AD');
  }
  function stripShy(t) {
    return t.replace(/&shy;/g, '');
  }
  $scope.$on('event:auth-loginRequired', function() {
    $location.path('/login');
  });
  $scope.config = $resource(CONFIG_PATH).get(
    function (config) {
      var panelMap = {},
          rows = [],
          row = [];
      //prepare data for panel selection view: two panels per row
      angular.forEach(config.panels, function (panel) {
        panelMap[stripShy(panel.title)] = panel;
        panel.title = convertShy(panel.title);
        row.push(panel);
        if (row.length == 2) {
          rows.push(row);
          row = [];
        }
      });
      if (row.length) rows.push(row);
      $scope.rows = rows;
      $scope.panelMap = panelMap;
    },
    function (error) {
      $scope.configGetError = error;
    }
  );
  $scope.setTitle = function (pageTitle) {
    $scope.pageTitle = pageTitle || HOME_TITLE;
  };
  $scope.gotoPanel = function (panelTitle) {
    var cleanTitle = stripShy(panelTitle);
    $location.path(cleanTitle);
  };
  $scope.getColorSchemeClass = function () {
    if ($scope.config.colorScheme) return 'c' + $scope.config.colorScheme;
  };
})
.controller('PanelCtrl', function ($scope, $routeParams) {
  $scope.panel = $scope.panelMap[$routeParams.panelTitle];
  $scope.setTitle($routeParams.panelTitle);
})
.controller('ActorCtrl', function ($scope, $http) {
  $scope.toggle = function (action) {
    $scope.toggleClasses = {};
    $scope.toggleClasses[action] = 'actionRunning';
    var actor = $scope.actor;
    delete actor._lastError;
    var params = actor.type == 'all' ? {action: 'all' + action} : {action: action, type: actor.type, id: actor.id};
    $http.get($scope.config.connAirPath, {params: params})
    .success(function () {
      $scope.toggleClasses[action] = 'actionSuccess';
    })
    .error(function (error) {
      actor._lastError = error;
      delete $scope.toggleClasses[action];
    });
  };
})
;
