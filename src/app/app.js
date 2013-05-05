angular.module('connair', ['ngResource', 'ngCookies', 'http-auth-interceptor'])
.config(function ($routeProvider) {
  var HOME = {templateUrl: 'parts/panelSelection.html'};
  $routeProvider
  .when('/', HOME)
  .when('/login', {templateUrl: 'parts/login.html', controller: 'LoginCtrl'})
  .when('/:panelTitle', {templateUrl: 'parts/panel.html', controller: 'PanelCtrl'})
  .otherwise(HOME);
})
.factory('loginService', function ($http, Base64, authService) {
  var PINKEY = 'connairpin',
      pin = null;
  
  function setPin(newPin) {
    pin = newPin;
    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('connairpin:' + pin);
  }
  
  function enterPin(newPin) {
    localStorage.setItem(PINKEY, newPin);
    setPin(newPin);
    authService.loginConfirmed();
  };
  
  setPin(localStorage.getItem(PINKEY));
  
  return {
    enterPin: enterPin
  };
})
.controller('MainCtrl', function ($scope, $resource, $http, $location) {
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
.controller('LoginCtrl', function ($scope, loginService) {
  function resetPin() {
    $scope.enteredDigits = ['', '', '', ''];
    $scope.pin = '';
  }
  resetPin();
  $scope.numberButtonRows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['C', 0]
  ];
  $scope.enterDigit = function (button) {    
    if (button == 'C') {
      resetPin();
    } else {
      $scope.enteredDigits[$scope.pin.length] = '•';
      $scope.pin += button.toString();
      if ($scope.pin.length == 4) {
        loginService.enterPin($scope.pin);
        $scope.gotoPanel('');
      }
    }
  }
})
.controller('LoginButtonCtrl', function ($scope, $timeout) {
  $scope.onClick = function () {
    $scope.enterDigit($scope.button);
    $scope.className = 'actionRunning';
    $timeout(function () {
      $scope.className = 'actionDone';
    });
  }
})
;
