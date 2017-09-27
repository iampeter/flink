angular.module('flinkApp', ['ui.router', 'angularMoment', 'dndLists']).run(["$rootScope", function($rootScope) {
  $rootScope.sidebarVisible = false;
  return $rootScope.showSidebar = function() {
    $rootScope.sidebarVisible = !$rootScope.sidebarVisible;
    return $rootScope.sidebarClass = 'force-show';
  };
}]).value('flinkConfig', {
  jobServer: '',
  "refresh-interval": 10000
}).value('watermarksConfig', {
  noWatermark: -9223372036854776000
}).run(["JobsService", "MainService", "flinkConfig", "$interval", function(JobsService, MainService, flinkConfig, $interval) {
  return MainService.loadConfig().then(function(config) {
    angular.extend(flinkConfig, config);
    JobsService.listJobs();
    return $interval(function() {
      return JobsService.listJobs();
    }, flinkConfig["refresh-interval"]);
  });
}]).config(["$uiViewScrollProvider", function($uiViewScrollProvider) {
  return $uiViewScrollProvider.useAnchorScroll();
}]).run(["$rootScope", "$state", function($rootScope, $state) {
  return $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    if (toState.redirectTo) {
      event.preventDefault();
      return $state.go(toState.redirectTo, toParams);
    }
  });
}]).config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
  $stateProvider.state("completed-jobs", {
    url: "/completed-jobs",
    views: {
      main: {
        templateUrl: "partials/jobs/completed-jobs.html",
        controller: 'CompletedJobsController'
      }
    }
  }).state("single-job", {
    url: "/jobs/{jobid}",
    abstract: true,
    views: {
      main: {
        templateUrl: "partials/jobs/job.html",
        controller: 'SingleJobController'
      }
    }
  }).state("single-job.plan", {
    url: "",
    redirectTo: "single-job.plan.subtasks",
    views: {
      details: {
        templateUrl: "partials/jobs/job.plan.html",
        controller: 'JobPlanController'
      }
    }
  }).state("single-job.plan.subtasks", {
    url: "",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.subtasks.html",
        controller: 'JobPlanSubtasksController'
      }
    }
  }).state("single-job.plan.metrics", {
    url: "/metrics",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.metrics.html",
        controller: 'JobPlanMetricsController'
      }
    }
  }).state("single-job.plan.watermarks", {
    url: "/watermarks",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.watermarks.html"
      }
    }
  }).state("single-job.plan.taskmanagers", {
    url: "/taskmanagers",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.taskmanagers.html",
        controller: 'JobPlanTaskManagersController'
      }
    }
  }).state("single-job.plan.accumulators", {
    url: "/accumulators",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.accumulators.html",
        controller: 'JobPlanAccumulatorsController'
      }
    }
  }).state("single-job.plan.checkpoints", {
    url: "/checkpoints",
    redirectTo: "single-job.plan.checkpoints.overview",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.checkpoints.html",
        controller: 'JobPlanCheckpointsController'
      }
    }
  }).state("single-job.plan.checkpoints.overview", {
    url: "/overview",
    views: {
      'checkpoints-view': {
        templateUrl: "partials/jobs/job.plan.node.checkpoints.overview.html",
        controller: 'JobPlanCheckpointsController'
      }
    }
  }).state("single-job.plan.checkpoints.summary", {
    url: "/summary",
    views: {
      'checkpoints-view': {
        templateUrl: "partials/jobs/job.plan.node.checkpoints.summary.html",
        controller: 'JobPlanCheckpointsController'
      }
    }
  }).state("single-job.plan.checkpoints.history", {
    url: "/history",
    views: {
      'checkpoints-view': {
        templateUrl: "partials/jobs/job.plan.node.checkpoints.history.html",
        controller: 'JobPlanCheckpointsController'
      }
    }
  }).state("single-job.plan.checkpoints.config", {
    url: "/config",
    views: {
      'checkpoints-view': {
        templateUrl: "partials/jobs/job.plan.node.checkpoints.config.html",
        controller: 'JobPlanCheckpointsController'
      }
    }
  }).state("single-job.plan.checkpoints.details", {
    url: "/details/{checkpointId}",
    views: {
      'checkpoints-view': {
        templateUrl: "partials/jobs/job.plan.node.checkpoints.details.html",
        controller: 'JobPlanCheckpointDetailsController'
      }
    }
  }).state("single-job.plan.backpressure", {
    url: "/backpressure",
    views: {
      'node-details': {
        templateUrl: "partials/jobs/job.plan.node-list.backpressure.html",
        controller: 'JobPlanBackPressureController'
      }
    }
  }).state("single-job.timeline", {
    url: "/timeline",
    views: {
      details: {
        templateUrl: "partials/jobs/job.timeline.html"
      }
    }
  }).state("single-job.timeline.vertex", {
    url: "/{vertexId}",
    views: {
      vertex: {
        templateUrl: "partials/jobs/job.timeline.vertex.html",
        controller: 'JobTimelineVertexController'
      }
    }
  }).state("single-job.exceptions", {
    url: "/exceptions",
    views: {
      details: {
        templateUrl: "partials/jobs/job.exceptions.html",
        controller: 'JobExceptionsController'
      }
    }
  }).state("single-job.config", {
    url: "/config",
    views: {
      details: {
        templateUrl: "partials/jobs/job.config.html"
      }
    }
  });
  return $urlRouterProvider.otherwise("/completed-jobs");
}]);

angular.module('flinkApp').directive('bsLabel', ["JobsService", function(JobsService) {
  return {
    transclude: true,
    replace: true,
    scope: {
      getLabelClass: "&",
      status: "@"
    },
    template: "<span title='{{status}}' ng-class='getLabelClass()'><ng-transclude></ng-transclude></span>",
    link: function(scope, element, attrs) {
      return scope.getLabelClass = function() {
        return 'label label-' + JobsService.translateLabelState(attrs.status);
      };
    }
  };
}]).directive('bpLabel', ["JobsService", function(JobsService) {
  return {
    transclude: true,
    replace: true,
    scope: {
      getBackPressureLabelClass: "&",
      status: "@"
    },
    template: "<span title='{{status}}' ng-class='getBackPressureLabelClass()'><ng-transclude></ng-transclude></span>",
    link: function(scope, element, attrs) {
      return scope.getBackPressureLabelClass = function() {
        return 'label label-' + JobsService.translateBackPressureLabelState(attrs.status);
      };
    }
  };
}]).directive('indicatorPrimary', ["JobsService", function(JobsService) {
  return {
    replace: true,
    scope: {
      getLabelClass: "&",
      status: '@'
    },
    template: "<i title='{{status}}' ng-class='getLabelClass()' />",
    link: function(scope, element, attrs) {
      return scope.getLabelClass = function() {
        return 'fa fa-circle indicator indicator-' + JobsService.translateLabelState(attrs.status);
      };
    }
  };
}]).directive('tableProperty', function() {
  return {
    replace: true,
    scope: {
      value: '='
    },
    template: "<td title=\"{{value || 'None'}}\">{{value || 'None'}}</td>"
  };
});

angular.module('flinkApp').filter("amDurationFormatExtended", ["angularMomentConfig", function(angularMomentConfig) {
  var amDurationFormatExtendedFilter;
  amDurationFormatExtendedFilter = function(value, format, durationFormat) {
    if (typeof value === "undefined" || value === null) {
      return "";
    }
    return moment.duration(value, format).format(durationFormat, {
      trim: false
    });
  };
  amDurationFormatExtendedFilter.$stateful = angularMomentConfig.statefulFilters;
  return amDurationFormatExtendedFilter;
}]).filter("humanizeDuration", function() {
  return function(value, short) {
    var days, hours, minutes, ms, seconds, x;
    if (typeof value === "undefined" || value === null) {
      return "";
    }
    ms = value % 1000;
    x = Math.floor(value / 1000);
    seconds = x % 60;
    x = Math.floor(x / 60);
    minutes = x % 60;
    x = Math.floor(x / 60);
    hours = x % 24;
    x = Math.floor(x / 24);
    days = x;
    if (days === 0) {
      if (hours === 0) {
        if (minutes === 0) {
          if (seconds === 0) {
            return ms + "ms";
          } else {
            return seconds + "s ";
          }
        } else {
          return minutes + "m " + seconds + "s";
        }
      } else {
        if (short) {
          return hours + "h " + minutes + "m";
        } else {
          return hours + "h " + minutes + "m " + seconds + "s";
        }
      }
    } else {
      if (short) {
        return days + "d " + hours + "h";
      } else {
        return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      }
    }
  };
}).filter("limit", function() {
  return function(text) {
    if (text.length > 73) {
      text = text.substring(0, 35) + "..." + text.substring(text.length - 35, text.length);
    }
    return text;
  };
}).filter("humanizeText", function() {
  return function(text) {
    if (text) {
      return text.replace(/&gt;/g, ">").replace(/<br\/>/g, "");
    } else {
      return '';
    }
  };
}).filter("humanizeBytes", [
  'BytesService', function(BytesService) {
    return function(amount) {
      var r;
      r = BytesService.humanize(amount);
      if (!r) {
        return "";
      }
      return r[0] + " " + r[1];
    };
  }
]).filter("toLocaleString", function() {
  return function(text) {
    return text.toLocaleString();
  };
}).filter("toUpperCase", function() {
  return function(text) {
    return text.toUpperCase();
  };
}).filter("percentage", function() {
  return function(number) {
    return (number * 100).toFixed(0) + '%';
  };
}).filter("humanizeWatermark", ["watermarksConfig", function(watermarksConfig) {
  return function(value) {
    if (isNaN(value) || value <= watermarksConfig.noWatermark) {
      return 'No Watermark';
    } else {
      return value;
    }
  };
}]).filter("increment", function() {
  return function(number) {
    return parseInt(number) + 1;
  };
}).filter("humanizeChartNumeric", [
  'humanizeBytesFilter', 'humanizeDurationFilter', function(humanizeBytesFilter, humanizeDurationFilter) {
    return function(value, metric) {
      var return_val;
      return_val = '';
      if (value !== null) {
        if (/bytes/i.test(metric.id) && /persecond/i.test(metric.id)) {
          return_val = humanizeBytesFilter(value) + ' / s';
        } else if (/bytes/i.test(metric.id)) {
          return_val = humanizeBytesFilter(value);
        } else if (/persecond/i.test(metric.id)) {
          return_val = value + ' / s';
        } else if (/time/i.test(metric.id) || /latency/i.test(metric.id)) {
          return_val = humanizeDurationFilter(value, true);
        } else {
          return_val = value;
        }
      }
      return return_val;
    };
  }
]).filter("humanizeChartNumericTitle", [
  'humanizeDurationFilter', function(humanizeDurationFilter) {
    return function(value, metric) {
      var return_val;
      return_val = '';
      if (value !== null) {
        if (/bytes/i.test(metric.id) && /persecond/i.test(metric.id)) {
          return_val = value + ' Bytes / s';
        } else if (/bytes/i.test(metric.id)) {
          return_val = value + ' Bytes';
        } else if (/persecond/i.test(metric.id)) {
          return_val = value + ' / s';
        } else if (/time/i.test(metric.id) || /latency/i.test(metric.id)) {
          return_val = humanizeDurationFilter(value, false);
        } else {
          return_val = value;
        }
      }
      return return_val;
    };
  }
]).filter("searchMetrics", function() {
  return function(availableMetrics, query) {
    var metric, queryRegex;
    queryRegex = new RegExp(query, "gi");
    return (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = availableMetrics.length; i < len; i++) {
        metric = availableMetrics[i];
        if (metric.id.match(queryRegex)) {
          results.push(metric);
        }
      }
      return results;
    })();
  };
});

angular.module('flinkApp').service('MainService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadConfig = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "config").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]).service('BytesService', function() {
  this.humanize = function(amount) {
    var converter, result, units;
    if (typeof amount === "undefined" || amount === null) {
      return null;
    }
    result = function(v, u) {
      return [v, u];
    };
    units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
    converter = function(value, power) {
      var base;
      base = Math.pow(1024, power);
      if (value < base) {
        return result((value / base).toFixed(2), units[power]);
      } else if (value < base * 1000) {
        return result((value / base).toPrecision(3), units[power]);
      } else {
        return converter(value, power + 1);
      }
    };
    if (amount < 1000) {
      return result(amount, "B");
    } else {
      return converter(amount, 1);
    }
  };
  return this;
});

angular.module('flinkApp').controller('JobManagerConfigController', ["$scope", "JobManagerConfigService", function($scope, JobManagerConfigService) {
  return JobManagerConfigService.loadConfig().then(function(data) {
    if ($scope.jobmanager == null) {
      $scope.jobmanager = {};
    }
    return $scope.jobmanager['config'] = data;
  });
}]).controller('JobManagerLogsController', ["$scope", "JobManagerLogsService", function($scope, JobManagerLogsService) {
  JobManagerLogsService.loadLogs().then(function(data) {
    if ($scope.jobmanager == null) {
      $scope.jobmanager = {};
    }
    return $scope.jobmanager['log'] = data;
  });
  return $scope.reloadData = function() {
    return JobManagerLogsService.loadLogs().then(function(data) {
      return $scope.jobmanager['log'] = data;
    });
  };
}]).controller('JobManagerStdoutController', ["$scope", "JobManagerStdoutService", function($scope, JobManagerStdoutService) {
  JobManagerStdoutService.loadStdout().then(function(data) {
    if ($scope.jobmanager == null) {
      $scope.jobmanager = {};
    }
    return $scope.jobmanager['stdout'] = data;
  });
  return $scope.reloadData = function() {
    return JobManagerStdoutService.loadStdout().then(function(data) {
      return $scope.jobmanager['stdout'] = data;
    });
  };
}]);

angular.module('flinkApp').service('JobManagerConfigService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var config;
  config = {};
  this.loadConfig = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobmanager/config").success(function(data, status, headers, config) {
      config = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]).service('JobManagerLogsService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var logs;
  logs = {};
  this.loadLogs = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobmanager/log").success(function(data, status, headers, config) {
      logs = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]).service('JobManagerStdoutService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var stdout;
  stdout = {};
  this.loadStdout = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobmanager/stdout").success(function(data, status, headers, config) {
      stdout = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('RunningJobsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  $scope.jobObserver = function() {
    return $scope.jobs = JobsService.getJobs('running');
  };
  JobsService.registerObserver($scope.jobObserver);
  $scope.$on('$destroy', function() {
    return JobsService.unRegisterObserver($scope.jobObserver);
  });
  return $scope.jobObserver();
}]).controller('CompletedJobsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  $scope.jobObserver = function() {
    return $scope.jobs = JobsService.getJobs('finished');
  };
  JobsService.registerObserver($scope.jobObserver);
  $scope.$on('$destroy', function() {
    return JobsService.unRegisterObserver($scope.jobObserver);
  });
  return $scope.jobObserver();
}]).controller('SingleJobController', ["$scope", "$state", "$stateParams", "JobsService", "MetricsService", "$rootScope", "flinkConfig", "$interval", "$q", function($scope, $state, $stateParams, JobsService, MetricsService, $rootScope, flinkConfig, $interval, $q) {
  var refresher;
  $scope.jobid = $stateParams.jobid;
  $scope.job = null;
  $scope.plan = null;
  $scope.watermarks = {};
  $scope.vertices = null;
  $scope.backPressureOperatorStats = {};
  $scope.godata = null;
  refresher = $interval(function() {
    return JobsService.loadJob($stateParams.jobid).then(function(data) {
      $scope.job = data;
      MetricsService.getWatermarks($scope.job.jid, $scope.plan.nodes).then(function(data) {
        return $scope.watermarks = data;
      });
      MetricsService.getGlobalOverview($scope.job.jid, $scope.plan.nodes).then(function(data) {
        return $scope.godata = data;
      });
      return $scope.$broadcast('reload');
    });
  }, flinkConfig["refresh-interval"]);
  $scope.$on('$destroy', function() {
    $scope.job = null;
    $scope.plan = null;
    $scope.watermarks = {};
    $scope.vertices = null;
    $scope.backPressureOperatorStats = null;
    $scope.godata = null;
    return $interval.cancel(refresher);
  });
  $scope.cancelJob = function(cancelEvent) {
    angular.element(cancelEvent.currentTarget).removeClass("btn").removeClass("btn-default").html('Cancelling...');
    return JobsService.cancelJob($stateParams.jobid).then(function(data) {
      return {};
    });
  };
  $scope.stopJob = function(stopEvent) {
    angular.element(stopEvent.currentTarget).removeClass("btn").removeClass("btn-default").html('Stopping...');
    return JobsService.stopJob($stateParams.jobid).then(function(data) {
      return {};
    });
  };
  JobsService.loadJob($stateParams.jobid).then(function(data) {
    $scope.job = data;
    $scope.vertices = data.vertices;
    $scope.plan = data.plan;
    MetricsService.setupMetrics($stateParams.jobid, data.vertices);
    MetricsService.getWatermarks($scope.job.jid, $scope.plan.nodes).then(function(data) {
      return $scope.watermarks = data;
    });
    return MetricsService.getGlobalOverview($scope.job.jid, $scope.plan.nodes).then(function(data) {
      return $scope.godata = data;
    });
  });
  return $scope.hasWatermark = function(nodeid) {
    return $scope.watermarks[nodeid] && !isNaN($scope.watermarks[nodeid]["lowWatermark"]);
  };
}]).controller('JobPlanController', ["$scope", "$state", "$stateParams", "$window", "JobsService", function($scope, $state, $stateParams, $window, JobsService) {
  $scope.nodeid = null;
  $scope.nodeUnfolded = false;
  $scope.stateList = JobsService.stateList();
  $scope.changeNode = function(nodeid) {
    if (nodeid !== $scope.nodeid) {
      $scope.nodeid = nodeid;
      $scope.vertex = null;
      $scope.subtasks = null;
      $scope.accumulators = null;
      $scope.operatorCheckpointStats = null;
      $scope.$broadcast('reload');
      return $scope.$broadcast('node:change', $scope.nodeid);
    } else {
      $scope.nodeid = null;
      $scope.nodeUnfolded = false;
      $scope.vertex = null;
      $scope.subtasks = null;
      $scope.accumulators = null;
      return $scope.operatorCheckpointStats = null;
    }
  };
  $scope.deactivateNode = function() {
    $scope.nodeid = null;
    $scope.nodeUnfolded = false;
    $scope.vertex = null;
    $scope.subtasks = null;
    $scope.accumulators = null;
    return $scope.operatorCheckpointStats = null;
  };
  return $scope.toggleFold = function() {
    return $scope.nodeUnfolded = !$scope.nodeUnfolded;
  };
}]).controller('JobPlanSubtasksController', ["$scope", "JobsService", function($scope, JobsService) {
  var getSubtasks;
  $scope.aggregate = false;
  getSubtasks = function() {
    if ($scope.aggregate) {
      return JobsService.getTaskManagers($scope.nodeid).then(function(data) {
        return $scope.taskmanagers = data;
      });
    } else {
      return JobsService.getSubtasks($scope.nodeid).then(function(data) {
        return $scope.subtasks = data;
      });
    }
  };
  if ($scope.nodeid && (!$scope.vertex || !$scope.vertex.st)) {
    getSubtasks();
  }
  return $scope.$on('reload', function(event) {
    if ($scope.nodeid) {
      return getSubtasks();
    }
  });
}]).controller('JobPlanAccumulatorsController', ["$scope", "JobsService", function($scope, JobsService) {
  var getAccumulators;
  getAccumulators = function() {
    return JobsService.getAccumulators($scope.nodeid).then(function(data) {
      $scope.accumulators = data.main;
      return $scope.subtaskAccumulators = data.subtasks;
    });
  };
  if ($scope.nodeid && (!$scope.vertex || !$scope.vertex.accumulators)) {
    getAccumulators();
  }
  return $scope.$on('reload', function(event) {
    if ($scope.nodeid) {
      return getAccumulators();
    }
  });
}]).controller('JobPlanCheckpointsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  var getGeneralCheckpointStats;
  $scope.checkpointDetails = {};
  $scope.checkpointDetails.id = -1;
  JobsService.getCheckpointConfig().then(function(data) {
    return $scope.checkpointConfig = data;
  });
  getGeneralCheckpointStats = function() {
    return JobsService.getCheckpointStats().then(function(data) {
      if (data !== null) {
        return $scope.checkpointStats = data;
      }
    });
  };
  getGeneralCheckpointStats();
  return $scope.$on('reload', function(event) {
    return getGeneralCheckpointStats();
  });
}]).controller('JobPlanCheckpointDetailsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  var getCheckpointDetails, getCheckpointSubtaskDetails;
  $scope.subtaskDetails = {};
  $scope.checkpointDetails.id = $stateParams.checkpointId;
  getCheckpointDetails = function(checkpointId) {
    return JobsService.getCheckpointDetails(checkpointId).then(function(data) {
      if (data !== null) {
        return $scope.checkpoint = data;
      } else {
        return $scope.unknown_checkpoint = true;
      }
    });
  };
  getCheckpointSubtaskDetails = function(checkpointId, vertexId) {
    return JobsService.getCheckpointSubtaskDetails(checkpointId, vertexId).then(function(data) {
      if (data !== null) {
        return $scope.subtaskDetails[vertexId] = data;
      }
    });
  };
  getCheckpointDetails($stateParams.checkpointId);
  if ($scope.nodeid) {
    getCheckpointSubtaskDetails($stateParams.checkpointId, $scope.nodeid);
  }
  $scope.$on('reload', function(event) {
    getCheckpointDetails($stateParams.checkpointId);
    if ($scope.nodeid) {
      return getCheckpointSubtaskDetails($stateParams.checkpointId, $scope.nodeid);
    }
  });
  return $scope.$on('$destroy', function() {
    return $scope.checkpointDetails.id = -1;
  });
}]).controller('JobPlanBackPressureController', ["$scope", "JobsService", function($scope, JobsService) {
  var getOperatorBackPressure;
  getOperatorBackPressure = function() {
    $scope.now = Date.now();
    if ($scope.nodeid) {
      return JobsService.getOperatorBackPressure($scope.nodeid).then(function(data) {
        return $scope.backPressureOperatorStats[$scope.nodeid] = data;
      });
    }
  };
  getOperatorBackPressure();
  return $scope.$on('reload', function(event) {
    return getOperatorBackPressure();
  });
}]).controller('JobTimelineVertexController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  var getVertex;
  getVertex = function() {
    return JobsService.getVertex($stateParams.vertexId).then(function(data) {
      return $scope.vertex = data;
    });
  };
  getVertex();
  return $scope.$on('reload', function(event) {
    return getVertex();
  });
}]).controller('JobExceptionsController', ["$scope", "$state", "$stateParams", "JobsService", function($scope, $state, $stateParams, JobsService) {
  return JobsService.loadExceptions().then(function(data) {
    return $scope.exceptions = data;
  });
}]).controller('JobPropertiesController', ["$scope", "JobsService", function($scope, JobsService) {
  return $scope.changeNode = function(nodeid) {
    if (nodeid !== $scope.nodeid) {
      $scope.nodeid = nodeid;
      return JobsService.getNode(nodeid).then(function(data) {
        return $scope.node = data;
      });
    } else {
      $scope.nodeid = null;
      return $scope.node = null;
    }
  };
}]).controller('JobPlanMetricsController', ["$scope", "JobsService", "MetricsService", function($scope, JobsService, MetricsService) {
  var alphabeticalSortById, loadMetrics;
  $scope.dragging = false;
  $scope.window = MetricsService.getWindow();
  $scope.availableMetrics = null;
  $scope.$on('$destroy', function() {
    return MetricsService.unRegisterObserver();
  });
  loadMetrics = function() {
    JobsService.getVertex($scope.nodeid).then(function(data) {
      return $scope.vertex = data;
    });
    return MetricsService.getAvailableMetrics($scope.jobid, $scope.nodeid).then(function(data) {
      $scope.availableMetrics = data.sort(alphabeticalSortById);
      $scope.metrics = MetricsService.getMetricsSetup($scope.jobid, $scope.nodeid).names;
      return MetricsService.registerObserver($scope.jobid, $scope.nodeid, function(data) {
        return $scope.$broadcast("metrics:data:update", data.timestamp, data.values);
      });
    });
  };
  alphabeticalSortById = function(a, b) {
    var A, B;
    A = a.id.toLowerCase();
    B = b.id.toLowerCase();
    if (A < B) {
      return -1;
    } else if (A > B) {
      return 1;
    } else {
      return 0;
    }
  };
  $scope.dropped = function(event, index, item, external, type) {
    MetricsService.orderMetrics($scope.jobid, $scope.nodeid, item, index);
    $scope.$broadcast("metrics:refresh", item);
    loadMetrics();
    return false;
  };
  $scope.dragStart = function() {
    return $scope.dragging = true;
  };
  $scope.dragEnd = function() {
    return $scope.dragging = false;
  };
  $scope.addMetric = function(metric) {
    MetricsService.addMetric($scope.jobid, $scope.nodeid, metric.id);
    return loadMetrics();
  };
  $scope.removeMetric = function(metric) {
    MetricsService.removeMetric($scope.jobid, $scope.nodeid, metric);
    return loadMetrics();
  };
  $scope.setMetricSize = function(metric, size) {
    MetricsService.setMetricSize($scope.jobid, $scope.nodeid, metric, size);
    return loadMetrics();
  };
  $scope.setMetricView = function(metric, view) {
    MetricsService.setMetricView($scope.jobid, $scope.nodeid, metric, view);
    return loadMetrics();
  };
  $scope.getValues = function(metric) {
    return MetricsService.getValues($scope.jobid, $scope.nodeid, metric);
  };
  $scope.$on('node:change', function(event, nodeid) {
    if (!$scope.dragging) {
      return loadMetrics();
    }
  });
  if ($scope.nodeid) {
    return loadMetrics();
  }
}]);

angular.module('flinkApp').directive('vertex', ["$state", function($state) {
  return {
    template: "<svg class='timeline secondary' width='0' height='0'></svg>",
    scope: {
      data: "="
    },
    link: function(scope, elem, attrs) {
      var analyzeTime, containerW, svgEl;
      svgEl = elem.children()[0];
      containerW = elem.width();
      angular.element(svgEl).attr('width', containerW);
      analyzeTime = function(data) {
        var chart, svg, testData;
        d3.select(svgEl).selectAll("*").remove();
        testData = [];
        angular.forEach(data.subtasks, function(subtask, i) {
          var times;
          times = [
            {
              label: "Scheduled",
              color: "#666",
              borderColor: "#555",
              starting_time: subtask.timestamps["SCHEDULED"],
              ending_time: subtask.timestamps["DEPLOYING"],
              type: 'regular'
            }, {
              label: "Deploying",
              color: "#aaa",
              borderColor: "#555",
              starting_time: subtask.timestamps["DEPLOYING"],
              ending_time: subtask.timestamps["RUNNING"],
              type: 'regular'
            }
          ];
          if (subtask.timestamps["FINISHED"] > 0) {
            times.push({
              label: "Running",
              color: "#ddd",
              borderColor: "#555",
              starting_time: subtask.timestamps["RUNNING"],
              ending_time: subtask.timestamps["FINISHED"],
              type: 'regular'
            });
          }
          return testData.push({
            label: "(" + subtask.subtask + ") " + subtask.host,
            times: times
          });
        });
        chart = d3.timeline().stack().tickFormat({
          format: d3.time.format("%L"),
          tickSize: 1
        }).prefix("single").labelFormat(function(label) {
          return label;
        }).margin({
          left: 100,
          right: 0,
          top: 0,
          bottom: 0
        }).itemHeight(30).relativeTime();
        return svg = d3.select(svgEl).datum(testData).call(chart);
      };
      analyzeTime(scope.data);
    }
  };
}]).directive('timeline', ["$state", function($state) {
  return {
    template: "<svg class='timeline' width='0' height='0'></svg>",
    scope: {
      vertices: "=",
      jobid: "="
    },
    link: function(scope, elem, attrs) {
      var analyzeTime, containerW, svgEl, translateLabel;
      svgEl = elem.children()[0];
      containerW = elem.width();
      angular.element(svgEl).attr('width', containerW);
      translateLabel = function(label) {
        return label.replace("&gt;", ">");
      };
      analyzeTime = function(data) {
        var chart, svg, testData;
        d3.select(svgEl).selectAll("*").remove();
        testData = [];
        angular.forEach(data, function(vertex) {
          if (vertex['start-time'] > -1) {
            if (vertex.type === 'scheduled') {
              return testData.push({
                times: [
                  {
                    label: translateLabel(vertex.name),
                    color: "#cccccc",
                    borderColor: "#555555",
                    starting_time: vertex['start-time'],
                    ending_time: vertex['end-time'],
                    type: vertex.type
                  }
                ]
              });
            } else {
              return testData.push({
                times: [
                  {
                    label: translateLabel(vertex.name),
                    color: "#d9f1f7",
                    borderColor: "#62cdea",
                    starting_time: vertex['start-time'],
                    ending_time: vertex['end-time'],
                    link: vertex.id,
                    type: vertex.type
                  }
                ]
              });
            }
          }
        });
        chart = d3.timeline().stack().click(function(d, i, datum) {
          if (d.link) {
            return $state.go("single-job.timeline.vertex", {
              jobid: scope.jobid,
              vertexId: d.link
            });
          }
        }).tickFormat({
          format: d3.time.format("%L"),
          tickSize: 1
        }).prefix("main").margin({
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }).itemHeight(30).showBorderLine().showHourTimeline();
        return svg = d3.select(svgEl).datum(testData).call(chart);
      };
      scope.$watch(attrs.vertices, function(data) {
        if (data) {
          return analyzeTime(data);
        }
      });
    }
  };
}]).directive('split', function() {
  return {
    compile: function(tElem, tAttrs) {
      return Split(tElem.children(), {
        sizes: [50, 50],
        direction: 'vertical'
      });
    }
  };
}).directive('jobPlan', ["$timeout", function($timeout) {
  return {
    template: "<svg class='graph'><g /></svg> <svg class='tmp' width='1' height='1'><g /></svg> <div class='btn-group zoom-buttons'> <a class='btn btn-default zoom-in' ng-click='zoomIn()'><i class='fa fa-plus' /></a> <a class='btn btn-default zoom-out' ng-click='zoomOut()'><i class='fa fa-minus' /></a> </div>",
    scope: {
      plan: '=',
      watermarks: '=',
      setNode: '&'
    },
    link: function(scope, elem, attrs) {
      var containerW, createEdge, createLabelEdge, createLabelNode, createNode, d3mainSvg, d3mainSvgG, d3tmpSvg, drawGraph, extendLabelNodeForIteration, g, getNodeType, isSpecialIterationNode, jobid, lastPosition, lastZoomScale, loadJsonToDagre, mainG, mainSvgElement, mainTmpElement, mainZoom, mergeWatermarks, searchForNode, shortenString, subgraphs;
      g = null;
      mainZoom = d3.behavior.zoom();
      subgraphs = [];
      jobid = attrs.jobid;
      mainSvgElement = elem.children()[0];
      mainG = elem.children().children()[0];
      mainTmpElement = elem.children()[1];
      d3mainSvg = d3.select(mainSvgElement);
      d3mainSvgG = d3.select(mainG);
      d3tmpSvg = d3.select(mainTmpElement);
      containerW = elem.width();
      angular.element(elem.children()[0]).width(containerW);
      lastZoomScale = 0;
      lastPosition = 0;
      scope.zoomIn = function() {
        var translate, v1, v2;
        if (mainZoom.scale() < 2.99) {
          translate = mainZoom.translate();
          v1 = translate[0] * (mainZoom.scale() + 0.1 / (mainZoom.scale()));
          v2 = translate[1] * (mainZoom.scale() + 0.1 / (mainZoom.scale()));
          mainZoom.scale(mainZoom.scale() + 0.1);
          mainZoom.translate([v1, v2]);
          d3mainSvgG.attr("transform", "translate(" + v1 + "," + v2 + ") scale(" + mainZoom.scale() + ")");
          lastZoomScale = mainZoom.scale();
          return lastPosition = mainZoom.translate();
        }
      };
      scope.zoomOut = function() {
        var translate, v1, v2;
        if (mainZoom.scale() > 0.31) {
          mainZoom.scale(mainZoom.scale() - 0.1);
          translate = mainZoom.translate();
          v1 = translate[0] * (mainZoom.scale() - 0.1 / (mainZoom.scale()));
          v2 = translate[1] * (mainZoom.scale() - 0.1 / (mainZoom.scale()));
          mainZoom.translate([v1, v2]);
          d3mainSvgG.attr("transform", "translate(" + v1 + "," + v2 + ") scale(" + mainZoom.scale() + ")");
          lastZoomScale = mainZoom.scale();
          return lastPosition = mainZoom.translate();
        }
      };
      createLabelEdge = function(el) {
        var labelValue;
        labelValue = "";
        if ((el.ship_strategy != null) || (el.local_strategy != null)) {
          labelValue += "<div class='edge-label'>";
          if (el.ship_strategy != null) {
            labelValue += el.ship_strategy;
          }
          if (el.temp_mode !== undefined) {
            labelValue += " (" + el.temp_mode + ")";
          }
          if (el.local_strategy !== undefined) {
            labelValue += ",<br>" + el.local_strategy;
          }
          labelValue += "</div>";
        }
        return labelValue;
      };
      isSpecialIterationNode = function(info) {
        return info === "partialSolution" || info === "nextPartialSolution" || info === "workset" || info === "nextWorkset" || info === "solutionSet" || info === "solutionDelta";
      };
      getNodeType = function(el, info) {
        if (info === "mirror") {
          return 'node-mirror';
        } else if (isSpecialIterationNode(info)) {
          return 'node-iteration';
        } else {
          return 'node-normal';
        }
      };
      createLabelNode = function(el, info, maxW, maxH) {
        var labelValue, stepName;
        labelValue = "<div href='#/jobs/" + jobid + "/vertex/" + el.id + "' class='node-label " + getNodeType(el, info) + "'>";
        if (info === "mirror") {
          labelValue += "<h3 class='node-name'>Mirror of " + el.operator + "</h3>";
        } else {
          labelValue += "<h3 class='node-name'>" + el.operator + "</h3>";
        }
        if (el.description === "") {
          labelValue += "";
        } else {
          stepName = el.description;
          stepName = shortenString(stepName);
          labelValue += "<h4 class='step-name'>" + stepName + "</h4>";
        }
        if (el.step_function != null) {
          labelValue += extendLabelNodeForIteration(el.id, maxW, maxH);
        } else {
          if (isSpecialIterationNode(info)) {
            labelValue += "<h5>" + info + " Node</h5>";
          }
          if (el.parallelism !== "") {
            labelValue += "<h5>Parallelism: " + el.parallelism + "</h5>";
          }
          if (el.lowWatermark !== undefined) {
            labelValue += "<h5>Low Watermark: " + el.lowWatermark + "</h5>";
          }
          if (!(el.operator === undefined || !el.operator_strategy)) {
            labelValue += "<h5>Operation: " + shortenString(el.operator_strategy) + "</h5>";
          }
        }
        labelValue += "</div>";
        return labelValue;
      };
      extendLabelNodeForIteration = function(id, maxW, maxH) {
        var labelValue, svgID;
        svgID = "svg-" + id;
        labelValue = "<svg class='" + svgID + "' width=" + maxW + " height=" + maxH + "><g /></svg>";
        return labelValue;
      };
      shortenString = function(s) {
        var sbr;
        if (s.charAt(0) === "<") {
          s = s.replace("<", "&lt;");
          s = s.replace(">", "&gt;");
        }
        sbr = "";
        while (s.length > 30) {
          sbr = sbr + s.substring(0, 30) + "<br>";
          s = s.substring(30, s.length);
        }
        sbr = sbr + s;
        return sbr;
      };
      createNode = function(g, data, el, isParent, maxW, maxH) {
        if (isParent == null) {
          isParent = false;
        }
        if (el.id === data.partial_solution) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "partialSolution", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "partialSolution")
          });
        } else if (el.id === data.next_partial_solution) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "nextPartialSolution", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "nextPartialSolution")
          });
        } else if (el.id === data.workset) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "workset", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "workset")
          });
        } else if (el.id === data.next_workset) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "nextWorkset", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "nextWorkset")
          });
        } else if (el.id === data.solution_set) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "solutionSet", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "solutionSet")
          });
        } else if (el.id === data.solution_delta) {
          return g.setNode(el.id, {
            label: createLabelNode(el, "solutionDelta", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "solutionDelta")
          });
        } else {
          return g.setNode(el.id, {
            label: createLabelNode(el, "", maxW, maxH),
            labelType: 'html',
            "class": getNodeType(el, "")
          });
        }
      };
      createEdge = function(g, data, el, existingNodes, pred) {
        return g.setEdge(pred.id, el.id, {
          label: createLabelEdge(pred),
          labelType: 'html',
          arrowhead: 'normal'
        });
      };
      loadJsonToDagre = function(g, data) {
        var el, existingNodes, isParent, k, l, len, len1, maxH, maxW, pred, r, ref, sg, toIterate;
        existingNodes = [];
        if (data.nodes != null) {
          toIterate = data.nodes;
        } else {
          toIterate = data.step_function;
          isParent = true;
        }
        for (k = 0, len = toIterate.length; k < len; k++) {
          el = toIterate[k];
          maxW = 0;
          maxH = 0;
          if (el.step_function) {
            sg = new dagreD3.graphlib.Graph({
              multigraph: true,
              compound: true
            }).setGraph({
              nodesep: 20,
              edgesep: 0,
              ranksep: 20,
              rankdir: "LR",
              marginx: 10,
              marginy: 10
            });
            subgraphs[el.id] = sg;
            loadJsonToDagre(sg, el);
            r = new dagreD3.render();
            d3tmpSvg.select('g').call(r, sg);
            maxW = sg.graph().width;
            maxH = sg.graph().height;
            angular.element(mainTmpElement).empty();
          }
          createNode(g, data, el, isParent, maxW, maxH);
          existingNodes.push(el.id);
          if (el.inputs != null) {
            ref = el.inputs;
            for (l = 0, len1 = ref.length; l < len1; l++) {
              pred = ref[l];
              createEdge(g, data, el, existingNodes, pred);
            }
          }
        }
        return g;
      };
      searchForNode = function(data, nodeID) {
        var el, i, j;
        for (i in data.nodes) {
          el = data.nodes[i];
          if (el.id === nodeID) {
            return el;
          }
          if (el.step_function != null) {
            for (j in el.step_function) {
              if (el.step_function[j].id === nodeID) {
                return el.step_function[j];
              }
            }
          }
        }
      };
      mergeWatermarks = function(data, watermarks) {
        var k, len, node, ref;
        if (!_.isEmpty(watermarks)) {
          ref = data.nodes;
          for (k = 0, len = ref.length; k < len; k++) {
            node = ref[k];
            if (watermarks[node.id] && !isNaN(watermarks[node.id]["lowWatermark"])) {
              node.lowWatermark = watermarks[node.id]["lowWatermark"];
            }
          }
        }
        return data;
      };
      lastPosition = 0;
      lastZoomScale = 0;
      drawGraph = function() {
        var i, newScale, renderer, sg, xCenterOffset, yCenterOffset;
        if (scope.plan) {
          g = new dagreD3.graphlib.Graph({
            multigraph: true,
            compound: true
          }).setGraph({
            nodesep: 70,
            edgesep: 0,
            ranksep: 50,
            rankdir: "LR",
            marginx: 40,
            marginy: 40
          });
          loadJsonToDagre(g, mergeWatermarks(scope.plan, scope.watermarks));
          d3mainSvgG.selectAll("*").remove();
          d3mainSvgG.attr("transform", "scale(" + 1 + ")");
          renderer = new dagreD3.render();
          d3mainSvgG.call(renderer, g);
          for (i in subgraphs) {
            sg = subgraphs[i];
            d3mainSvg.select('svg.svg-' + i + ' g').call(renderer, sg);
          }
          newScale = 0.5;
          xCenterOffset = Math.floor((angular.element(mainSvgElement).width() - g.graph().width * newScale) / 2);
          yCenterOffset = Math.floor((angular.element(mainSvgElement).height() - g.graph().height * newScale) / 2);
          if (lastZoomScale !== 0 && lastPosition !== 0) {
            mainZoom.scale(lastZoomScale).translate(lastPosition);
            d3mainSvgG.attr("transform", "translate(" + lastPosition + ") scale(" + lastZoomScale + ")");
          } else {
            mainZoom.scale(newScale).translate([xCenterOffset, yCenterOffset]);
            d3mainSvgG.attr("transform", "translate(" + xCenterOffset + ", " + yCenterOffset + ") scale(" + mainZoom.scale() + ")");
          }
          mainZoom.on("zoom", function() {
            var ev;
            ev = d3.event;
            lastZoomScale = ev.scale;
            lastPosition = ev.translate;
            return d3mainSvgG.attr("transform", "translate(" + lastPosition + ") scale(" + lastZoomScale + ")");
          });
          mainZoom(d3mainSvg);
          return d3mainSvgG.selectAll('.node').on('click', function(d) {
            return scope.setNode({
              nodeid: d
            });
          });
        }
      };
      scope.$watch(attrs.plan, function(newPlan) {
        if (newPlan) {
          return drawGraph();
        }
      });
      scope.$watch(attrs.watermarks, function(newWatermarks) {
        if (newWatermarks && scope.plan) {
          return drawGraph();
        }
      });
    }
  };
}]).directive('globalOverview', ["$timeout", "BytesService", function($timeout, BytesService) {
  return {
    template: "<div class='global-overview'> <div class='row'> <div class='col-xs-5'> <div class='row'> <div class='col-xs-12'> <div class='meta title'>Ingress Throughput</div> </div> </div> <div class='row'> <div class='col-xs-6'> <div class='data'>{{incoming[0]}}</div> <div class='meta unit'>{{incoming[1]}}/s</div> </div> <div class='col-xs-6'> <div class='data'>{{incomingR}}</div> <div class='meta unit'>records/s</div> </div> </div> </div> <div class='col-xs-5'> <div class='row'> <div class='col-xs-12'> <div class='meta title'>Egress Throughput</div> </div> </div> <div class='row'> <div class='col-xs-6'> <div class='data'>{{outgoing[0]}}</div> <div class='meta unit'>{{outgoing[1]}}/s</div> </div> <div class='col-xs-6'> <div class='data'>{{outgoingR}}</div> <div class='meta unit'>records/s</div> </div> </div> </div> <div class='col-xs-2'> <div class='meta'>End-to-end Latency</div> <div class='data'>{{latency}}</div> <div class='meta unit'>ms</div> </div> </div> </div>",
    scope: {
      godata: '='
    },
    link: function(scope, elem, attrs) {
      scope.incoming = [0, "b"];
      scope.outgoing = [0, "b"];
      scope.incomingR = 0;
      scope.outgoingR = 0;
      scope.latency = 0;
      scope.$watch(attrs.godata, function(data) {
        if (data) {
          scope.incoming = BytesService.humanize(data.incoming);
          scope.outgoing = BytesService.humanize(data.outgoing);
          scope.incomingR = data.incomingR;
          scope.outgoingR = data.outgoingR;
          return scope.latency = data.latency;
        }
      });
    }
  };
}]);

angular.module('flinkApp').service('JobsService', ["$http", "flinkConfig", "$log", "amMoment", "$q", "$timeout", function($http, flinkConfig, $log, amMoment, $q, $timeout) {
  var currentJob, currentPlan, deferreds, jobObservers, jobs, notifyObservers;
  currentJob = null;
  currentPlan = null;
  deferreds = {};
  jobs = {
    running: [],
    finished: [],
    cancelled: [],
    failed: []
  };
  jobObservers = [];
  notifyObservers = function() {
    return angular.forEach(jobObservers, function(callback) {
      return callback();
    });
  };
  this.registerObserver = function(callback) {
    return jobObservers.push(callback);
  };
  this.unRegisterObserver = function(callback) {
    var index;
    index = jobObservers.indexOf(callback);
    return jobObservers.splice(index, 1);
  };
  this.stateList = function() {
    return ['SCHEDULED', 'DEPLOYING', 'RUNNING', 'FINISHED', 'FAILED', 'CANCELING', 'CANCELED'];
  };
  this.translateLabelState = function(state) {
    switch (state.toLowerCase()) {
      case 'finished':
        return 'success';
      case 'failed':
        return 'danger';
      case 'scheduled':
        return 'default';
      case 'deploying':
        return 'info';
      case 'running':
        return 'primary';
      case 'canceling':
        return 'warning';
      case 'pending':
        return 'info';
      case 'total':
        return 'black';
      default:
        return 'default';
    }
  };
  this.setEndTimes = function(list) {
    return angular.forEach(list, function(item, jobKey) {
      if (!(item['end-time'] > -1)) {
        return item['end-time'] = item['start-time'] + item['duration'];
      }
    });
  };
  this.processVertices = function(data) {
    angular.forEach(data.vertices, function(vertex, i) {
      return vertex.type = 'regular';
    });
    return data.vertices.unshift({
      name: 'Scheduled',
      'start-time': data.timestamps['CREATED'],
      'end-time': data.timestamps['CREATED'] + 1,
      type: 'scheduled'
    });
  };
  this.listJobs = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "joboverview").success((function(_this) {
      return function(data, status, headers, config) {
        angular.forEach(data, function(list, listKey) {
          switch (listKey) {
            case 'running':
              return jobs.running = _this.setEndTimes(list);
            case 'finished':
              return jobs.finished = _this.setEndTimes(list);
            case 'cancelled':
              return jobs.cancelled = _this.setEndTimes(list);
            case 'failed':
              return jobs.failed = _this.setEndTimes(list);
          }
        });
        deferred.resolve(jobs);
        return notifyObservers();
      };
    })(this));
    return deferred.promise;
  };
  this.getJobs = function(type) {
    return jobs[type];
  };
  this.getAllJobs = function() {
    return jobs;
  };
  this.loadJob = function(jobid) {
    currentJob = null;
    deferreds.job = $q.defer();
    $http.get(flinkConfig.jobServer + "jobs/" + jobid).success((function(_this) {
      return function(data, status, headers, config) {
        _this.setEndTimes(data.vertices);
        _this.processVertices(data);
        return $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/config").success(function(jobConfig) {
          data = angular.extend(data, jobConfig);
          currentJob = data;
          return deferreds.job.resolve(currentJob);
        });
      };
    })(this));
    return deferreds.job.promise;
  };
  this.getNode = function(nodeid) {
    var deferred, seekNode;
    seekNode = function(nodeid, data) {
      var j, len, node, sub;
      for (j = 0, len = data.length; j < len; j++) {
        node = data[j];
        if (node.id === nodeid) {
          return node;
        }
        if (node.step_function) {
          sub = seekNode(nodeid, node.step_function);
        }
        if (sub) {
          return sub;
        }
      }
      return null;
    };
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        var foundNode;
        foundNode = seekNode(nodeid, currentJob.plan.nodes);
        foundNode.vertex = _this.seekVertex(nodeid);
        return deferred.resolve(foundNode);
      };
    })(this));
    return deferred.promise;
  };
  this.seekVertex = function(nodeid) {
    var j, len, ref, vertex;
    ref = currentJob.vertices;
    for (j = 0, len = ref.length; j < len; j++) {
      vertex = ref[j];
      if (vertex.id === nodeid) {
        return vertex;
      }
    }
    return null;
  };
  this.getVertex = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        var vertex;
        vertex = _this.seekVertex(vertexid);
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/subtasktimes").success(function(data) {
          vertex.subtasks = data.subtasks;
          return deferred.resolve(vertex);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getSubtasks = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid).success(function(data) {
          var subtasks;
          subtasks = data.subtasks;
          return deferred.resolve(subtasks);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getTaskManagers = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/taskmanagers").success(function(data) {
          var taskmanagers;
          taskmanagers = data.taskmanagers;
          return deferred.resolve(taskmanagers);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getAccumulators = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        console.log(currentJob.jid);
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/accumulators").success(function(data) {
          var accumulators;
          accumulators = data['user-accumulators'];
          return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/subtasks/accumulators").success(function(data) {
            var subtaskAccumulators;
            subtaskAccumulators = data.subtasks;
            return deferred.resolve({
              main: accumulators,
              subtasks: subtaskAccumulators
            });
          });
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getCheckpointConfig = function() {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/checkpoints/config").success(function(data) {
          if (angular.equals({}, data)) {
            return deferred.resolve(null);
          } else {
            return deferred.resolve(data);
          }
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getCheckpointStats = function() {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/checkpoints").success(function(data, status, headers, config) {
          if (angular.equals({}, data)) {
            return deferred.resolve(null);
          } else {
            return deferred.resolve(data);
          }
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getCheckpointDetails = function(checkpointid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/checkpoints/details/" + checkpointid).success(function(data) {
          if (angular.equals({}, data)) {
            return deferred.resolve(null);
          } else {
            return deferred.resolve(data);
          }
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getCheckpointSubtaskDetails = function(checkpointid, vertexid) {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/checkpoints/details/" + checkpointid + "/subtasks/" + vertexid).success(function(data) {
          if (angular.equals({}, data)) {
            return deferred.resolve(null);
          } else {
            return deferred.resolve(data);
          }
        });
      };
    })(this));
    return deferred.promise;
  };
  this.getOperatorBackPressure = function(vertexid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/vertices/" + vertexid + "/backpressure").success((function(_this) {
      return function(data) {
        return deferred.resolve(data);
      };
    })(this));
    return deferred.promise;
  };
  this.translateBackPressureLabelState = function(state) {
    switch (state.toLowerCase()) {
      case 'in-progress':
        return 'danger';
      case 'ok':
        return 'success';
      case 'low':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'default';
    }
  };
  this.loadExceptions = function() {
    var deferred;
    deferred = $q.defer();
    deferreds.job.promise.then((function(_this) {
      return function(data) {
        return $http.get(flinkConfig.jobServer + "jobs/" + currentJob.jid + "/exceptions").success(function(exceptions) {
          currentJob.exceptions = exceptions;
          return deferred.resolve(exceptions);
        });
      };
    })(this));
    return deferred.promise;
  };
  this.cancelJob = function(jobid) {
    return $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/yarn-cancel");
  };
  this.stopJob = function(jobid) {
    return $http.get("jobs/" + jobid + "/yarn-stop");
  };
  return this;
}]);

angular.module('flinkApp').directive('metricsGraph', function() {
  return {
    template: '<div class="panel panel-default panel-metric"> <div class="panel-heading"> <span class="metric-title">{{metric.id}}</span> <div class="buttons"> <div class="btn-group"> <button type="button" ng-class="[btnClasses, {active: metric.size != \'big\'}]" ng-click="setSize(\'small\')">Small</button> <button type="button" ng-class="[btnClasses, {active: metric.size == \'big\'}]" ng-click="setSize(\'big\')">Big</button> </div> <a title="Remove" class="btn btn-default btn-xs remove" ng-click="removeMetric()"><i class="fa fa-close" /></a> </div> </div> <div class="panel-body"> <svg ng-if="metric.view == \'chart\'"/> <div ng-if="metric.view != \'chart\'"> <div class="metric-numeric" title="{{value | humanizeChartNumericTitle:metric}}">{{value | humanizeChartNumeric:metric}}</div> </div> </div> <div class="buttons"> <div class="btn-group"> <button type="button" ng-class="[btnClasses, {active: metric.view == \'chart\'}]" ng-click="setView(\'chart\')">Chart</button> <button type="button" ng-class="[btnClasses, {active: metric.view != \'chart\'}]" ng-click="setView(\'numeric\')">Numeric</button> </div> </div>',
    replace: true,
    scope: {
      metric: "=",
      window: "=",
      removeMetric: "&",
      setMetricSize: "=",
      setMetricView: "=",
      getValues: "&"
    },
    link: function(scope, element, attrs) {
      scope.btnClasses = ['btn', 'btn-default', 'btn-xs'];
      scope.value = null;
      scope.data = [
        {
          values: scope.getValues()
        }
      ];
      scope.options = {
        x: function(d, i) {
          return d.x;
        },
        y: function(d, i) {
          return d.y;
        },
        xTickFormat: function(d) {
          return d3.time.format('%H:%M:%S')(new Date(d));
        },
        yTickFormat: function(d) {
          var absD, found, pow, step;
          found = false;
          pow = 0;
          step = 1;
          absD = Math.abs(d);
          while (!found && pow < 50) {
            if (Math.pow(10, pow) <= absD && absD < Math.pow(10, pow + step)) {
              found = true;
            } else {
              pow += step;
            }
          }
          if (found && pow > 6) {
            return (d / Math.pow(10, pow)) + "E" + pow;
          } else {
            return "" + d;
          }
        }
      };
      scope.showChart = function() {
        return d3.select(element.find("svg")[0]).datum(scope.data).transition().duration(250).call(scope.chart);
      };
      scope.chart = nv.models.lineChart().options(scope.options).showLegend(false).margin({
        top: 15,
        left: 60,
        bottom: 30,
        right: 30
      });
      scope.chart.yAxis.showMaxMin(false);
      scope.chart.tooltip.hideDelay(0);
      scope.chart.tooltip.contentGenerator(function(obj) {
        return "<p>" + (d3.time.format('%H:%M:%S')(new Date(obj.point.x))) + " | " + obj.point.y + "</p>";
      });
      nv.utils.windowResize(scope.chart.update);
      scope.setSize = function(size) {
        return scope.setMetricSize(scope.metric, size);
      };
      scope.setView = function(view) {
        scope.setMetricView(scope.metric, view);
        if (view === 'chart') {
          return scope.showChart();
        }
      };
      if (scope.metric.view === 'chart') {
        scope.showChart();
      }
      scope.$on('metrics:data:update', function(event, timestamp, data) {
        scope.value = parseFloat(data[scope.metric.id]);
        scope.data[0].values.push({
          x: timestamp,
          y: scope.value
        });
        if (scope.data[0].values.length > scope.window) {
          scope.data[0].values.shift();
        }
        if (scope.metric.view === 'chart') {
          scope.showChart();
        }
        if (scope.metric.view === 'chart') {
          scope.chart.clearHighlights();
        }
        return scope.chart.tooltip.hidden(true);
      });
      return element.find(".metric-title").qtip({
        content: {
          text: scope.metric.id
        },
        position: {
          my: 'bottom left',
          at: 'top left'
        },
        style: {
          classes: 'qtip-light qtip-timeline-bar'
        }
      });
    }
  };
});

angular.module('flinkApp').service('MetricsService', ["$http", "$q", "flinkConfig", "$interval", "watermarksConfig", function($http, $q, flinkConfig, $interval, watermarksConfig) {
  this.metrics = {};
  this.values = {};
  this.watched = {};
  this.observer = {
    jobid: null,
    nodeid: null,
    callback: null
  };
  this.refresh = $interval((function(_this) {
    return function() {
      return angular.forEach(_this.metrics, function(vertices, jobid) {
        return angular.forEach(vertices, function(metrics, nodeid) {
          var names;
          names = [];
          angular.forEach(metrics, function(metric, index) {
            return names.push(metric.id);
          });
          if (names.length > 0) {
            return _this.getMetrics(jobid, nodeid, names).then(function(values) {
              if (jobid === _this.observer.jobid && nodeid === _this.observer.nodeid) {
                if (_this.observer.callback) {
                  return _this.observer.callback(values);
                }
              }
            });
          }
        });
      });
    };
  })(this), flinkConfig["refresh-interval"]);
  this.registerObserver = function(jobid, nodeid, callback) {
    this.observer.jobid = jobid;
    this.observer.nodeid = nodeid;
    return this.observer.callback = callback;
  };
  this.unRegisterObserver = function() {
    return this.observer = {
      jobid: null,
      nodeid: null,
      callback: null
    };
  };
  this.setupMetrics = function(jobid, vertices) {
    this.setupLS();
    this.watched[jobid] = [];
    return angular.forEach(vertices, (function(_this) {
      return function(v, k) {
        if (v.id) {
          return _this.watched[jobid].push(v.id);
        }
      };
    })(this));
  };
  this.getWindow = function() {
    return 100;
  };
  this.setupLS = function() {
    if (sessionStorage.flinkMetrics == null) {
      this.saveSetup();
    }
    return this.metrics = JSON.parse(sessionStorage.flinkMetrics);
  };
  this.saveSetup = function() {
    return sessionStorage.flinkMetrics = JSON.stringify(this.metrics);
  };
  this.saveValue = function(jobid, nodeid, value) {
    if (this.values[jobid] == null) {
      this.values[jobid] = {};
    }
    if (this.values[jobid][nodeid] == null) {
      this.values[jobid][nodeid] = [];
    }
    this.values[jobid][nodeid].push(value);
    if (this.values[jobid][nodeid].length > this.getWindow()) {
      return this.values[jobid][nodeid].shift();
    }
  };
  this.getValues = function(jobid, nodeid, metricid) {
    var results;
    if (this.values[jobid] == null) {
      return [];
    }
    if (this.values[jobid][nodeid] == null) {
      return [];
    }
    results = [];
    angular.forEach(this.values[jobid][nodeid], (function(_this) {
      return function(v, k) {
        if (v.values[metricid] != null) {
          return results.push({
            x: v.timestamp,
            y: v.values[metricid]
          });
        }
      };
    })(this));
    return results;
  };
  this.setupLSFor = function(jobid, nodeid) {
    if (this.metrics[jobid] == null) {
      this.metrics[jobid] = {};
    }
    if (this.metrics[jobid][nodeid] == null) {
      return this.metrics[jobid][nodeid] = [];
    }
  };
  this.addMetric = function(jobid, nodeid, metricid) {
    this.setupLSFor(jobid, nodeid);
    this.metrics[jobid][nodeid].push({
      id: metricid,
      size: 'small',
      view: 'chart'
    });
    return this.saveSetup();
  };
  this.removeMetric = (function(_this) {
    return function(jobid, nodeid, metric) {
      var i;
      if (_this.metrics[jobid][nodeid] != null) {
        i = _this.metrics[jobid][nodeid].indexOf(metric);
        if (i === -1) {
          i = _.findIndex(_this.metrics[jobid][nodeid], {
            id: metric
          });
        }
        if (i !== -1) {
          _this.metrics[jobid][nodeid].splice(i, 1);
        }
        return _this.saveSetup();
      }
    };
  })(this);
  this.setMetricSize = (function(_this) {
    return function(jobid, nodeid, metric, size) {
      var i;
      if (_this.metrics[jobid][nodeid] != null) {
        i = _this.metrics[jobid][nodeid].indexOf(metric.id);
        if (i === -1) {
          i = _.findIndex(_this.metrics[jobid][nodeid], {
            id: metric.id
          });
        }
        if (i !== -1) {
          _this.metrics[jobid][nodeid][i] = {
            id: metric.id,
            size: size,
            view: metric.view
          };
        }
        return _this.saveSetup();
      }
    };
  })(this);
  this.setMetricView = (function(_this) {
    return function(jobid, nodeid, metric, view) {
      var i;
      if (_this.metrics[jobid][nodeid] != null) {
        i = _this.metrics[jobid][nodeid].indexOf(metric.id);
        if (i === -1) {
          i = _.findIndex(_this.metrics[jobid][nodeid], {
            id: metric.id
          });
        }
        if (i !== -1) {
          _this.metrics[jobid][nodeid][i] = {
            id: metric.id,
            size: metric.size,
            view: view
          };
        }
        return _this.saveSetup();
      }
    };
  })(this);
  this.orderMetrics = function(jobid, nodeid, item, index) {
    this.setupLSFor(jobid, nodeid);
    angular.forEach(this.metrics[jobid][nodeid], (function(_this) {
      return function(v, k) {
        if (v.id === item.id) {
          _this.metrics[jobid][nodeid].splice(k, 1);
          if (k < index) {
            return index = index - 1;
          }
        }
      };
    })(this));
    this.metrics[jobid][nodeid].splice(index, 0, item);
    return this.saveSetup();
  };
  this.getMetricsSetup = (function(_this) {
    return function(jobid, nodeid) {
      return {
        names: _.map(_this.metrics[jobid][nodeid], function(value) {
          if (_.isString(value)) {
            return {
              id: value,
              size: "small",
              view: "chart"
            };
          } else {
            return value;
          }
        })
      };
    };
  })(this);
  this.getAvailableMetrics = (function(_this) {
    return function(jobid, nodeid) {
      var deferred;
      _this.setupLSFor(jobid, nodeid);
      deferred = $q.defer();
      $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics").success(function(data) {
        var results;
        results = [];
        angular.forEach(data, function(v, k) {
          var i;
          i = _this.metrics[jobid][nodeid].indexOf(v.id);
          if (i === -1) {
            i = _.findIndex(_this.metrics[jobid][nodeid], {
              id: v.id
            });
          }
          if (i === -1) {
            return results.push(v);
          }
        });
        return deferred.resolve(results);
      });
      return deferred.promise;
    };
  })(this);
  this.getAllAvailableMetrics = (function(_this) {
    return function(jobid, nodeid) {
      var deferred;
      deferred = $q.defer();
      $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics").success(function(data) {
        return deferred.resolve(data);
      });
      return deferred.promise;
    };
  })(this);
  this.getMetrics = function(jobid, nodeid, metricIds) {
    var deferred, ids;
    deferred = $q.defer();
    ids = metricIds.join(",");
    $http.get(flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics?get=" + ids).success((function(_this) {
      return function(data) {
        var newValue, result;
        result = {};
        angular.forEach(data, function(v, k) {
          return result[v.id] = parseInt(v.value);
        });
        newValue = {
          timestamp: Date.now(),
          values: result
        };
        _this.saveValue(jobid, nodeid, newValue);
        return deferred.resolve(newValue);
      };
    })(this));
    return deferred.promise;
  };
  this.getWatermarks = function(jid, nodes) {
    var deferred, promises, requestWatermarkForNode, watermarks;
    requestWatermarkForNode = (function(_this) {
      return function(node) {
        var deferred, i, metricIds;
        deferred = $q.defer();
        metricIds = (function() {
          var j, ref, results1;
          results1 = [];
          for (i = j = 0, ref = node.parallelism - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            results1.push(i + ".currentLowWatermark");
          }
          return results1;
        })();
        _this.getMetrics(jid, node.id, metricIds).then(function(metrics) {
          var key, lowWatermark, minValue, ref, subtaskIndex, value, watermarks;
          minValue = 0/0;
          watermarks = {};
          ref = metrics.values;
          for (key in ref) {
            value = ref[key];
            subtaskIndex = key.replace('.currentLowWatermark', '');
            watermarks[subtaskIndex] = value;
            if (isNaN(minValue) || value < minValue) {
              minValue = value;
            }
          }
          if (!isNaN(minValue) && minValue > watermarksConfig.noWatermark) {
            lowWatermark = minValue;
          } else {
            lowWatermark = 0/0;
          }
          return deferred.resolve({
            "lowWatermark": lowWatermark,
            "watermarks": watermarks
          });
        });
        return deferred.promise;
      };
    })(this);
    deferred = $q.defer();
    watermarks = {};
    promises = [];
    angular.forEach(nodes, (function(_this) {
      return function(node, index) {
        var pr;
        pr = requestWatermarkForNode(node).then(function(data) {
          return watermarks[node.id] = data;
        });
        return promises.push(pr);
      };
    })(this));
    $q.all(promises).then((function(_this) {
      return function() {
        return deferred.resolve(watermarks);
      };
    })(this));
    return deferred.promise;
  };
  this.getGlobalOverview = function(jid, nodes) {
    var deferred, getSourcesAndSinks, incoming, incomingR, outgoing, outgoingR, promises, ref, sinks, sources;
    deferred = $q.defer();
    promises = [];
    getSourcesAndSinks = (function(_this) {
      return function() {
        var predecessors, sinks, sources;
        predecessors = [];
        sources = [];
        sinks = [];
        angular.forEach(nodes, function(node) {
          if (!node.inputs) {
            return sources.push(node.id);
          } else {
            return predecessors = predecessors.concat(_.map(node.inputs, function(input) {
              return input.id;
            }));
          }
        });
        angular.forEach(nodes, function(node) {
          if (!_.contains(predecessors, node.id)) {
            return sinks.push(node.id);
          }
        });
        return [sources, sinks];
      };
    })(this);
    ref = getSourcesAndSinks(), sources = ref[0], sinks = ref[1];
    incoming = 0;
    outgoing = 0;
    incomingR = 0;
    outgoingR = 0;
    angular.forEach(nodes, (function(_this) {
      return function(node) {
        var i, metricIds, pr;
        metricIds = ((function() {
          var j, ref1, results1;
          results1 = [];
          for (i = j = 0, ref1 = node.parallelism - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            results1.push(i + ".numBytesInLocalPerSecond");
          }
          return results1;
        })()).concat((function() {
          var j, ref1, results1;
          results1 = [];
          for (i = j = 0, ref1 = node.parallelism - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            results1.push(i + ".numBytesInRemotePerSecond");
          }
          return results1;
        })()).concat((function() {
          var j, ref1, results1;
          results1 = [];
          for (i = j = 0, ref1 = node.parallelism - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            results1.push(i + ".numBytesOutPerSecond");
          }
          return results1;
        })()).concat((function() {
          var j, ref1, results1;
          results1 = [];
          for (i = j = 0, ref1 = node.parallelism - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            results1.push(i + ".numRecordsInPerSecond");
          }
          return results1;
        })()).concat((function() {
          var j, ref1, results1;
          results1 = [];
          for (i = j = 0, ref1 = node.parallelism - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            results1.push(i + ".numRecordsOutPerSecond");
          }
          return results1;
        })());
        pr = _this.getMetrics(jid, node.id, metricIds).then(function(metrics) {
          return angular.forEach(_.keys(metrics.values), (function(_this) {
            return function(key) {
              if (key.indexOf("numBytesOutPerSecond") !== -1 && _.contains(sources, node.id)) {
                return incoming += metrics.values[key];
              } else if (key.indexOf("numBytesInLocalPerSecond") !== -1 && _.contains(sinks, node.id)) {
                return outgoing += metrics.values[key];
              } else if (key.indexOf("numBytesInRemotePerSecond") !== -1 && _.contains(sinks, node.id)) {
                return outgoing += metrics.values[key];
              } else if (key.indexOf("numRecordsOutPerSecond") !== -1 && _.contains(sources, node.id)) {
                return incomingR += metrics.values[key];
              } else if (key.indexOf("numRecordsInPerSecond") !== -1 && _.contains(sinks, node.id)) {
                return outgoingR += metrics.values[key];
              }
            };
          })(this));
        });
        return promises.push(pr);
      };
    })(this));
    $q.all(promises).then((function(_this) {
      return function() {
        return deferred.resolve({
          incoming: incoming,
          outgoing: outgoing,
          incomingR: incomingR,
          outgoingR: outgoingR,
          latency: 0
        });
      };
    })(this));
    return deferred.promise;
  };
  this.setupLS();
  return this;
}]);

angular.module('flinkApp').controller('OverviewController', ["$scope", "OverviewService", "JobsService", "$interval", "flinkConfig", function($scope, OverviewService, JobsService, $interval, flinkConfig) {
  var refresh;
  $scope.jobObserver = function() {
    $scope.runningJobs = JobsService.getJobs('running');
    return $scope.finishedJobs = JobsService.getJobs('finished');
  };
  JobsService.registerObserver($scope.jobObserver);
  $scope.$on('$destroy', function() {
    return JobsService.unRegisterObserver($scope.jobObserver);
  });
  $scope.jobObserver();
  OverviewService.loadOverview().then(function(data) {
    return $scope.overview = data;
  });
  refresh = $interval(function() {
    return OverviewService.loadOverview().then(function(data) {
      return $scope.overview = data;
    });
  }, flinkConfig["refresh-interval"]);
  return $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
}]);

angular.module('flinkApp').service('OverviewService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  var overview;
  overview = {};
  this.loadOverview = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "overview").success(function(data, status, headers, config) {
      overview = data;
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('JobSubmitController', ["$scope", "JobSubmitService", "$interval", "flinkConfig", "$state", "$location", function($scope, JobSubmitService, $interval, flinkConfig, $state, $location) {
  var refresh;
  $scope.yarn = $location.absUrl().indexOf("/proxy/application_") !== -1;
  $scope.loadList = function() {
    return JobSubmitService.loadJarList().then(function(data) {
      $scope.address = data.address;
      $scope.noaccess = data.error;
      return $scope.jars = data.files;
    });
  };
  $scope.defaultState = function() {
    $scope.plan = null;
    $scope.error = null;
    return $scope.state = {
      selected: null,
      parallelism: "",
      savepointPath: "",
      allowNonRestoredState: false,
      'entry-class': "",
      'program-args': "",
      'plan-button': "Show Plan",
      'submit-button': "Submit",
      'action-time': 0
    };
  };
  $scope.defaultState();
  $scope.uploader = {};
  $scope.loadList();
  refresh = $interval(function() {
    return $scope.loadList();
  }, flinkConfig["refresh-interval"]);
  $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
  $scope.selectJar = function(id) {
    if ($scope.state.selected === id) {
      return $scope.defaultState();
    } else {
      $scope.defaultState();
      return $scope.state.selected = id;
    }
  };
  $scope.deleteJar = function(event, id) {
    if ($scope.state.selected === id) {
      $scope.defaultState();
    }
    angular.element(event.currentTarget).removeClass("fa-remove").addClass("fa-spin fa-spinner");
    return JobSubmitService.deleteJar(id).then(function(data) {
      angular.element(event.currentTarget).removeClass("fa-spin fa-spinner").addClass("fa-remove");
      if (data.error != null) {
        return alert(data.error);
      }
    });
  };
  $scope.loadEntryClass = function(name) {
    return $scope.state['entry-class'] = name;
  };
  $scope.getPlan = function() {
    var action;
    if ($scope.state['plan-button'] === "Show Plan") {
      action = new Date().getTime();
      $scope.state['action-time'] = action;
      $scope.state['submit-button'] = "Submit";
      $scope.state['plan-button'] = "Getting Plan";
      $scope.error = null;
      $scope.plan = null;
      return JobSubmitService.getPlan($scope.state.selected, {
        'entry-class': $scope.state['entry-class'],
        parallelism: $scope.state.parallelism,
        'program-args': $scope.state['program-args']
      }).then(function(data) {
        if (action === $scope.state['action-time']) {
          $scope.state['plan-button'] = "Show Plan";
          $scope.error = data.error;
          return $scope.plan = data.plan;
        }
      });
    }
  };
  $scope.runJob = function() {
    var action;
    if ($scope.state['submit-button'] === "Submit") {
      action = new Date().getTime();
      $scope.state['action-time'] = action;
      $scope.state['submit-button'] = "Submitting";
      $scope.state['plan-button'] = "Show Plan";
      $scope.error = null;
      return JobSubmitService.runJob($scope.state.selected, {
        'entry-class': $scope.state['entry-class'],
        parallelism: $scope.state.parallelism,
        'program-args': $scope.state['program-args'],
        savepointPath: $scope.state['savepointPath'],
        allowNonRestoredState: $scope.state['allowNonRestoredState']
      }).then(function(data) {
        if (action === $scope.state['action-time']) {
          $scope.state['submit-button'] = "Submit";
          $scope.error = data.error;
          if (data.jobid != null) {
            return $state.go("single-job.plan.subtasks", {
              jobid: data.jobid
            });
          }
        }
      });
    }
  };
  $scope.nodeid = null;
  $scope.changeNode = function(nodeid) {
    if (nodeid !== $scope.nodeid) {
      $scope.nodeid = nodeid;
      $scope.vertex = null;
      $scope.subtasks = null;
      $scope.accumulators = null;
      return $scope.$broadcast('reload');
    } else {
      $scope.nodeid = null;
      $scope.nodeUnfolded = false;
      $scope.vertex = null;
      $scope.subtasks = null;
      return $scope.accumulators = null;
    }
  };
  $scope.clearFiles = function() {
    return $scope.uploader = {};
  };
  $scope.uploadFiles = function(files) {
    $scope.uploader = {};
    if (files.length === 1) {
      $scope.uploader['file'] = files[0];
      return $scope.uploader['upload'] = true;
    } else {
      return $scope.uploader['error'] = "Did ya forget to select a file?";
    }
  };
  return $scope.startUpload = function() {
    var formdata, xhr;
    if ($scope.uploader['file'] != null) {
      formdata = new FormData();
      formdata.append("jarfile", $scope.uploader['file']);
      $scope.uploader['upload'] = false;
      $scope.uploader['success'] = "Initializing upload...";
      xhr = new XMLHttpRequest();
      xhr.upload.onprogress = function(event) {
        $scope.uploader['success'] = null;
        return $scope.uploader['progress'] = parseInt(100 * event.loaded / event.total);
      };
      xhr.upload.onerror = function(event) {
        $scope.uploader['progress'] = null;
        return $scope.uploader['error'] = "An error occurred while uploading your file";
      };
      xhr.upload.onload = function(event) {
        $scope.uploader['progress'] = null;
        return $scope.uploader['success'] = "Saving...";
      };
      xhr.onreadystatechange = function() {
        var response;
        if (xhr.readyState === 4) {
          response = JSON.parse(xhr.responseText);
          if (response.error != null) {
            $scope.uploader['error'] = response.error;
            return $scope.uploader['success'] = null;
          } else {
            return $scope.uploader['success'] = "Uploaded!";
          }
        }
      };
      xhr.open("POST", flinkConfig.jobServer + "jars/upload");
      return xhr.send(formdata);
    } else {
      return console.log("Unexpected Error. This should not happen");
    }
  };
}]).filter('getJarSelectClass', function() {
  return function(selected, actual) {
    if (selected === actual) {
      return "fa-check-square";
    } else {
      return "fa-square-o";
    }
  };
});

angular.module('flinkApp').service('JobSubmitService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadJarList = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jars/").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.deleteJar = function(id) {
    var deferred;
    deferred = $q.defer();
    $http["delete"](flinkConfig.jobServer + "jars/" + encodeURIComponent(id)).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.getPlan = function(id, args) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "jars/" + encodeURIComponent(id) + "/plan", {
      params: args
    }).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.runJob = function(id, args) {
    var deferred;
    deferred = $q.defer();
    $http.post(flinkConfig.jobServer + "jars/" + encodeURIComponent(id) + "/run", {}, {
      params: args
    }).success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

angular.module('flinkApp').controller('AllTaskManagersController', ["$scope", "TaskManagersService", "$interval", "flinkConfig", function($scope, TaskManagersService, $interval, flinkConfig) {
  var refresh;
  TaskManagersService.loadManagers().then(function(data) {
    return $scope.managers = data;
  });
  refresh = $interval(function() {
    return TaskManagersService.loadManagers().then(function(data) {
      return $scope.managers = data;
    });
  }, flinkConfig["refresh-interval"]);
  return $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
}]).controller('SingleTaskManagerController', ["$scope", "$stateParams", "SingleTaskManagerService", "$interval", "flinkConfig", function($scope, $stateParams, SingleTaskManagerService, $interval, flinkConfig) {
  var refresh;
  $scope.metrics = {};
  SingleTaskManagerService.loadMetrics($stateParams.taskmanagerid).then(function(data) {
    return $scope.metrics = data[0];
  });
  refresh = $interval(function() {
    return SingleTaskManagerService.loadMetrics($stateParams.taskmanagerid).then(function(data) {
      return $scope.metrics = data[0];
    });
  }, flinkConfig["refresh-interval"]);
  return $scope.$on('$destroy', function() {
    return $interval.cancel(refresh);
  });
}]).controller('SingleTaskManagerLogsController', ["$scope", "$stateParams", "SingleTaskManagerService", "$interval", "flinkConfig", function($scope, $stateParams, SingleTaskManagerService, $interval, flinkConfig) {
  $scope.log = {};
  $scope.taskmanagerid = $stateParams.taskmanagerid;
  SingleTaskManagerService.loadLogs($stateParams.taskmanagerid).then(function(data) {
    return $scope.log = data;
  });
  return $scope.reloadData = function() {
    return SingleTaskManagerService.loadLogs($stateParams.taskmanagerid).then(function(data) {
      return $scope.log = data;
    });
  };
}]).controller('SingleTaskManagerStdoutController', ["$scope", "$stateParams", "SingleTaskManagerService", "$interval", "flinkConfig", function($scope, $stateParams, SingleTaskManagerService, $interval, flinkConfig) {
  $scope.stdout = {};
  $scope.taskmanagerid = $stateParams.taskmanagerid;
  SingleTaskManagerService.loadStdout($stateParams.taskmanagerid).then(function(data) {
    return $scope.stdout = data;
  });
  return $scope.reloadData = function() {
    return SingleTaskManagerService.loadStdout($stateParams.taskmanagerid).then(function(data) {
      return $scope.stdout = data;
    });
  };
}]);

angular.module('flinkApp').service('TaskManagersService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadManagers = function() {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers").success(function(data, status, headers, config) {
      return deferred.resolve(data['taskmanagers']);
    });
    return deferred.promise;
  };
  return this;
}]).service('SingleTaskManagerService', ["$http", "flinkConfig", "$q", function($http, flinkConfig, $q) {
  this.loadMetrics = function(taskmanagerid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers/" + taskmanagerid).success(function(data, status, headers, config) {
      return deferred.resolve(data['taskmanagers']);
    });
    return deferred.promise;
  };
  this.loadLogs = function(taskmanagerid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers/" + taskmanagerid + "/log").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  this.loadStdout = function(taskmanagerid) {
    var deferred;
    deferred = $q.defer();
    $http.get(flinkConfig.jobServer + "taskmanagers/" + taskmanagerid + "/stdout").success(function(data, status, headers, config) {
      return deferred.resolve(data);
    });
    return deferred.promise;
  };
  return this;
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4X2hzLmNvZmZlZSIsImluZGV4X2hzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMuY29mZmVlIiwiY29tbW9uL2RpcmVjdGl2ZXMuanMiLCJjb21tb24vZmlsdGVycy5jb2ZmZWUiLCJjb21tb24vZmlsdGVycy5qcyIsImNvbW1vbi9zZXJ2aWNlcy5jb2ZmZWUiLCJjb21tb24vc2VydmljZXMuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvam9ibWFuYWdlci9qb2JtYW5hZ2VyLmN0cmwuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5zdmMuY29mZmVlIiwibW9kdWxlcy9qb2JtYW5hZ2VyL2pvYm1hbmFnZXIuc3ZjLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5jdHJsLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuZGlyLmNvZmZlZSIsIm1vZHVsZXMvam9icy9qb2JzLmRpci5qcyIsIm1vZHVsZXMvam9icy9qb2JzLnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5zdmMuanMiLCJtb2R1bGVzL2pvYnMvbWV0cmljcy5kaXIuY29mZmVlIiwibW9kdWxlcy9qb2JzL21ldHJpY3MuZGlyLmpzIiwibW9kdWxlcy9qb2JzL21ldHJpY3Muc3ZjLmNvZmZlZSIsIm1vZHVsZXMvam9icy9tZXRyaWNzLnN2Yy5qcyIsIm1vZHVsZXMvb3ZlcnZpZXcvb3ZlcnZpZXcuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LmN0cmwuanMiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5qcyIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmpzIiwibW9kdWxlcy9zdWJtaXQvc3VibWl0LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL3N1Ym1pdC9zdWJtaXQuc3ZjLmpzIiwibW9kdWxlcy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuY3RybC5qcyIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCQSxRQUFRLE9BQU8sWUFBWSxDQUFDLGFBQWEsaUJBQWlCLGFBSXpELG1CQUFJLFNBQUMsWUFBRDtFQUNILFdBQVcsaUJBQWlCO0VDckI1QixPRHNCQSxXQUFXLGNBQWMsV0FBQTtJQUN2QixXQUFXLGlCQUFpQixDQUFDLFdBQVc7SUNyQnhDLE9Ec0JBLFdBQVcsZUFBZTs7SUFJN0IsTUFBTSxlQUFlO0VBQ3BCLFdBQVc7RUFFWCxvQkFBb0I7R0FLckIsTUFBTSxvQkFBb0I7RUFJekIsYUFBYSxDQUFDO0dBS2YsK0RBQUksU0FBQyxhQUFhLGFBQWEsYUFBYSxXQUF4QztFQ25DSCxPRG9DQSxZQUFZLGFBQWEsS0FBSyxTQUFDLFFBQUQ7SUFDNUIsUUFBUSxPQUFPLGFBQWE7SUFFNUIsWUFBWTtJQ3BDWixPRHNDQSxVQUFVLFdBQUE7TUNyQ1IsT0RzQ0EsWUFBWTtPQUNaLFlBQVk7O0lBS2pCLGlDQUFPLFNBQUMsdUJBQUQ7RUN4Q04sT0R5Q0Esc0JBQXNCO0lBSXZCLDZCQUFJLFNBQUMsWUFBWSxRQUFiO0VDM0NILE9ENENBLFdBQVcsSUFBSSxxQkFBcUIsU0FBQyxPQUFPLFNBQVMsVUFBVSxXQUEzQjtJQUNsQyxJQUFHLFFBQVEsWUFBWDtNQUNFLE1BQU07TUMzQ04sT0Q0Q0EsT0FBTyxHQUFHLFFBQVEsWUFBWTs7O0lBSW5DLGdEQUFPLFNBQUMsZ0JBQWdCLG9CQUFqQjtFQUNOLGVBQWUsTUFBTSxrQkFDbkI7SUFBQSxLQUFLO0lBQ0wsT0FDRTtNQUFB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LGFBQWEsSUFBckI7RUFDOUIsS0FBQyxlQUFlLFdBQUE7SUFDZCxJQUFBO0lBQUEsV0FBVyxHQUFHO0lBRWQsTUFBTSxJQUFJLFlBQVksWUFBWSxnQkFDakMsUUFBUSxTQUFDLE1BQU0sUUFBUSxTQUFTLFFBQXhCO01DcEJQLE9EcUJBLFNBQVMsUUFBUSxLQUFLOztJQ25CeEIsT0RxQkEsU0FBUzs7RUNuQlgsT0RxQkE7SUFFRCxRQUFRLDJEQUE0QixTQUFDLE9BQU8sYUFBYSxJQUFyQjtFQUNuQyxLQUFDLGNBQWMsU0FBQyxlQUFEO0lBQ2IsSUFBQTtJQUFBLFdBQVcsR0FBRztJQUVkLE1BQU0sSUFBSSxZQUFZLFlBQVksa0JBQWtCLGVBQ25ELFFBQVEsU0FBQyxNQUFNLFFBQVEsU0FBUyxRQUF4QjtNQ3RCUCxPRHVCQSxTQUFTLFFBQVEsS0FBSzs7SUNyQnhCLE9EdUJBLFNBQVM7O0VBRVgsS0FBQyxXQUFXLFNBQUMsZUFBRDtJQUNWLElBQUE7SUFBQSxXQUFXLEdBQUc7SUFFZCxNQUFNLElBQUksWUFBWSxZQUFZLGtCQUFrQixnQkFBZ0IsUUFDbkUsUUFBUSxTQUFDLE1BQU0sUUFBUSxTQUFTLFFBQXhCO01DdkJQLE9Ed0JBLFNBQVMsUUFBUTs7SUN0Qm5CLE9Ed0JBLFNBQVM7O0VBRVgsS0FBQyxhQUFhLFNBQUMsZUFBRDtJQUNaLElBQUE7SUFBQSxXQUFXLEdBQUc7SUFFZCxNQUFNLElBQUksWUFBWSxZQUFZLGtCQUFrQixnQkFBZ0IsV0FDbkUsUUFBUSxTQUFDLE1BQU0sUUFBUSxTQUFTLFFBQXhCO01DeEJQLE9EeUJBLFNBQVMsUUFBUTs7SUN2Qm5CLE9EeUJBLFNBQVM7O0VDdkJYLE9EeUJBOztBQ3ZCRiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnLCBbJ3VpLnJvdXRlcicsICdhbmd1bGFyTW9tZW50JywgJ2RuZExpc3RzJ10pXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnJ1biAoJHJvb3RTY29wZSkgLT5cbiAgJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZSA9IGZhbHNlXG4gICRyb290U2NvcGUuc2hvd1NpZGViYXIgPSAtPlxuICAgICRyb290U2NvcGUuc2lkZWJhclZpc2libGUgPSAhJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZVxuICAgICRyb290U2NvcGUuc2lkZWJhckNsYXNzID0gJ2ZvcmNlLXNob3cnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnZhbHVlICdmbGlua0NvbmZpZycsIHtcbiAgam9iU2VydmVyOiAnJ1xuIyAgam9iU2VydmVyOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxLydcbiAgXCJyZWZyZXNoLWludGVydmFsXCI6IDEwMDAwXG59XG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnZhbHVlICd3YXRlcm1hcmtzQ29uZmlnJywge1xuICAjIEEgdmFsdWUgb2YgKEphdmEpIExvbmcuTUlOX1ZBTFVFIGluZGljYXRlcyB0aGF0IHRoZXJlIGlzIG5vIHdhdGVybWFya1xuICAjIGF2YWlsYWJsZS4gVGhpcyBpcyBwYXJzZWQgYnkgSmF2YXNjcmlwdCBhcyB0aGlzIG51bWJlci4gV2UgaGF2ZSBpdCBhc1xuICAjIGEgY29uc3RhbnQgaGVyZSB0byBjb21wYXJlIGF2YWlsYWJsZSB3YXRlcm1hcmtzIGFnYWluc3QuXG4gIG5vV2F0ZXJtYXJrOiAtOTIyMzM3MjAzNjg1NDc3NjAwMFxufVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5ydW4gKEpvYnNTZXJ2aWNlLCBNYWluU2VydmljZSwgZmxpbmtDb25maWcsICRpbnRlcnZhbCkgLT5cbiAgTWFpblNlcnZpY2UubG9hZENvbmZpZygpLnRoZW4gKGNvbmZpZykgLT5cbiAgICBhbmd1bGFyLmV4dGVuZCBmbGlua0NvbmZpZywgY29uZmlnXG5cbiAgICBKb2JzU2VydmljZS5saXN0Sm9icygpXG5cbiAgICAkaW50ZXJ2YWwgLT5cbiAgICAgIEpvYnNTZXJ2aWNlLmxpc3RKb2JzKClcbiAgICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbmZpZyAoJHVpVmlld1Njcm9sbFByb3ZpZGVyKSAtPlxuICAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4ucnVuICgkcm9vdFNjb3BlLCAkc3RhdGUpIC0+XG4gICRyb290U2NvcGUuJG9uICckc3RhdGVDaGFuZ2VTdGFydCcsIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSkgLT5cbiAgICBpZiB0b1N0YXRlLnJlZGlyZWN0VG9cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICRzdGF0ZS5nbyB0b1N0YXRlLnJlZGlyZWN0VG8sIHRvUGFyYW1zXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbmZpZyAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikgLT5cbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUgXCJjb21wbGV0ZWQtam9ic1wiLFxuICAgIHVybDogXCIvY29tcGxldGVkLWpvYnNcIlxuICAgIHZpZXdzOlxuICAgICAgbWFpbjpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9jb21wbGV0ZWQtam9icy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0NvbXBsZXRlZEpvYnNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2JcIixcbiAgICB1cmw6IFwiL2pvYnMve2pvYmlkfVwiXG4gICAgYWJzdHJhY3Q6IHRydWVcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlSm9iQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW5cIixcbiAgICB1cmw6IFwiXCJcbiAgICByZWRpcmVjdFRvOiBcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsXG4gICAgdXJsOiBcIlwiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3Quc3VidGFza3MuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5tZXRyaWNzXCIsXG4gICAgdXJsOiBcIi9tZXRyaWNzXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5tZXRyaWNzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi53YXRlcm1hcmtzXCIsXG4gICAgdXJsOiBcIi93YXRlcm1hcmtzXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC53YXRlcm1hcmtzLmh0bWxcIlxuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi50YXNrbWFuYWdlcnNcIixcbiAgICB1cmw6IFwiL3Rhc2ttYW5hZ2Vyc1wiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QudGFza21hbmFnZXJzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLmFjY3VtdWxhdG9yc1wiLFxuICAgIHVybDogXCIvYWNjdW11bGF0b3JzXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5hY2N1bXVsYXRvcnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHNcIixcbiAgICAgIHVybDogXCIvY2hlY2twb2ludHNcIlxuICAgICAgcmVkaXJlY3RUbzogXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHMub3ZlcnZpZXdcIlxuICAgICAgdmlld3M6XG4gICAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmNoZWNrcG9pbnRzLmh0bWxcIlxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuICBcbiAgICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHMub3ZlcnZpZXdcIixcbiAgICAgIHVybDogXCIvb3ZlcnZpZXdcIlxuICAgICAgdmlld3M6XG4gICAgICAgICdjaGVja3BvaW50cy12aWV3JzpcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUuY2hlY2twb2ludHMub3ZlcnZpZXcuaHRtbFwiXG4gICAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInXG4gIFxuICAgIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5zdW1tYXJ5XCIsXG4gICAgICB1cmw6IFwiL3N1bW1hcnlcIlxuICAgICAgdmlld3M6XG4gICAgICAgICdjaGVja3BvaW50cy12aWV3JzpcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUuY2hlY2twb2ludHMuc3VtbWFyeS5odG1sXCJcbiAgICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgXG4gICAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmhpc3RvcnlcIixcbiAgICAgIHVybDogXCIvaGlzdG9yeVwiXG4gICAgICB2aWV3czpcbiAgICAgICAgJ2NoZWNrcG9pbnRzLXZpZXcnOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS5jaGVja3BvaW50cy5oaXN0b3J5Lmh0bWxcIlxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuICBcbiAgICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHMuY29uZmlnXCIsXG4gICAgICB1cmw6IFwiL2NvbmZpZ1wiXG4gICAgICB2aWV3czpcbiAgICAgICAgJ2NoZWNrcG9pbnRzLXZpZXcnOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS5jaGVja3BvaW50cy5jb25maWcuaHRtbFwiXG4gICAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInXG4gIFxuICAgIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5kZXRhaWxzXCIsXG4gICAgICB1cmw6IFwiL2RldGFpbHMve2NoZWNrcG9pbnRJZH1cIlxuICAgICAgdmlld3M6XG4gICAgICAgICdjaGVja3BvaW50cy12aWV3JzpcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUuY2hlY2twb2ludHMuZGV0YWlscy5odG1sXCJcbiAgICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnREZXRhaWxzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uYmFja3ByZXNzdXJlXCIsXG4gICAgdXJsOiBcIi9iYWNrcHJlc3N1cmVcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmJhY2twcmVzc3VyZS5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IudGltZWxpbmVcIixcbiAgICB1cmw6IFwiL3RpbWVsaW5lXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnRpbWVsaW5lLmh0bWxcIlxuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsXG4gICAgdXJsOiBcIi97dmVydGV4SWR9XCJcbiAgICB2aWV3czpcbiAgICAgIHZlcnRleDpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUudmVydGV4Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iVGltZWxpbmVWZXJ0ZXhDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IuZXhjZXB0aW9uc1wiLFxuICAgIHVybDogXCIvZXhjZXB0aW9uc1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5leGNlcHRpb25zLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5jb25maWdcIixcbiAgICB1cmw6IFwiL2NvbmZpZ1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5jb25maWcuaHRtbFwiXG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSBcIi9jb21wbGV0ZWQtam9ic1wiXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnLCBbJ3VpLnJvdXRlcicsICdhbmd1bGFyTW9tZW50JywgJ2RuZExpc3RzJ10pLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuc2lkZWJhclZpc2libGUgPSBmYWxzZTtcbiAgcmV0dXJuICRyb290U2NvcGUuc2hvd1NpZGViYXIgPSBmdW5jdGlvbigpIHtcbiAgICAkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlID0gISRyb290U2NvcGUuc2lkZWJhclZpc2libGU7XG4gICAgcmV0dXJuICRyb290U2NvcGUuc2lkZWJhckNsYXNzID0gJ2ZvcmNlLXNob3cnO1xuICB9O1xufSkudmFsdWUoJ2ZsaW5rQ29uZmlnJywge1xuICBqb2JTZXJ2ZXI6ICcnLFxuICBcInJlZnJlc2gtaW50ZXJ2YWxcIjogMTAwMDBcbn0pLnZhbHVlKCd3YXRlcm1hcmtzQ29uZmlnJywge1xuICBub1dhdGVybWFyazogLTkyMjMzNzIwMzY4NTQ3NzYwMDBcbn0pLnJ1bihmdW5jdGlvbihKb2JzU2VydmljZSwgTWFpblNlcnZpY2UsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwpIHtcbiAgcmV0dXJuIE1haW5TZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuKGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIGFuZ3VsYXIuZXh0ZW5kKGZsaW5rQ29uZmlnLCBjb25maWcpO1xuICAgIEpvYnNTZXJ2aWNlLmxpc3RKb2JzKCk7XG4gICAgcmV0dXJuICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBKb2JzU2VydmljZS5saXN0Sm9icygpO1xuICAgIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIH0pO1xufSkuY29uZmlnKGZ1bmN0aW9uKCR1aVZpZXdTY3JvbGxQcm92aWRlcikge1xuICByZXR1cm4gJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpO1xufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSkge1xuICByZXR1cm4gJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUpIHtcbiAgICBpZiAodG9TdGF0ZS5yZWRpcmVjdFRvKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuICRzdGF0ZS5nbyh0b1N0YXRlLnJlZGlyZWN0VG8sIHRvUGFyYW1zKTtcbiAgICB9XG4gIH0pO1xufSkuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJjb21wbGV0ZWQtam9ic1wiLCB7XG4gICAgdXJsOiBcIi9jb21wbGV0ZWQtam9ic1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvY29tcGxldGVkLWpvYnMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnQ29tcGxldGVkSm9ic0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2JcIiwge1xuICAgIHVybDogXCIvam9icy97am9iaWR9XCIsXG4gICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlSm9iQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuXCIsIHtcbiAgICB1cmw6IFwiXCIsXG4gICAgcmVkaXJlY3RUbzogXCJzaW5nbGUtam9iLnBsYW4uc3VidGFza3NcIixcbiAgICB2aWV3czoge1xuICAgICAgZGV0YWlsczoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5Db250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4uc3VidGFza3NcIiwge1xuICAgIHVybDogXCJcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3Quc3VidGFza3MuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLm1ldHJpY3NcIiwge1xuICAgIHVybDogXCIvbWV0cmljc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbm9kZS1kZXRhaWxzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5tZXRyaWNzLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5NZXRyaWNzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLndhdGVybWFya3NcIiwge1xuICAgIHVybDogXCIvd2F0ZXJtYXJrc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbm9kZS1kZXRhaWxzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC53YXRlcm1hcmtzLmh0bWxcIlxuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4udGFza21hbmFnZXJzXCIsIHtcbiAgICB1cmw6IFwiL3Rhc2ttYW5hZ2Vyc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbm9kZS1kZXRhaWxzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC50YXNrbWFuYWdlcnMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhblRhc2tNYW5hZ2Vyc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5hY2N1bXVsYXRvcnNcIiwge1xuICAgIHVybDogXCIvYWNjdW11bGF0b3JzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmFjY3VtdWxhdG9ycy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzXCIsIHtcbiAgICB1cmw6IFwiL2NoZWNrcG9pbnRzXCIsXG4gICAgcmVkaXJlY3RUbzogXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHMub3ZlcnZpZXdcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuY2hlY2twb2ludHMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLm92ZXJ2aWV3XCIsIHtcbiAgICB1cmw6IFwiL292ZXJ2aWV3XCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdjaGVja3BvaW50cy12aWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUuY2hlY2twb2ludHMub3ZlcnZpZXcuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLnN1bW1hcnlcIiwge1xuICAgIHVybDogXCIvc3VtbWFyeVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLnN1bW1hcnkuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmhpc3RvcnlcIiwge1xuICAgIHVybDogXCIvaGlzdG9yeVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLmhpc3RvcnkuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmNvbmZpZ1wiLCB7XG4gICAgdXJsOiBcIi9jb25maWdcIixcbiAgICB2aWV3czoge1xuICAgICAgJ2NoZWNrcG9pbnRzLXZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS5jaGVja3BvaW50cy5jb25maWcuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmRldGFpbHNcIiwge1xuICAgIHVybDogXCIvZGV0YWlscy97Y2hlY2twb2ludElkfVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLmRldGFpbHMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnREZXRhaWxzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmJhY2twcmVzc3VyZVwiLCB7XG4gICAgdXJsOiBcIi9iYWNrcHJlc3N1cmVcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYmFja3ByZXNzdXJlLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnRpbWVsaW5lXCIsIHtcbiAgICB1cmw6IFwiL3RpbWVsaW5lXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUuaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsIHtcbiAgICB1cmw6IFwiL3t2ZXJ0ZXhJZH1cIixcbiAgICB2aWV3czoge1xuICAgICAgdmVydGV4OiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnRpbWVsaW5lLnZlcnRleC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IuZXhjZXB0aW9uc1wiLCB7XG4gICAgdXJsOiBcIi9leGNlcHRpb25zXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuZXhjZXB0aW9ucy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5jb25maWdcIiwge1xuICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuY29uZmlnLmh0bWxcIlxuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2NvbXBsZXRlZC1qb2JzXCIpO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ2JzTGFiZWwnLCAoSm9ic1NlcnZpY2UpIC0+XG4gIHRyYW5zY2x1ZGU6IHRydWVcbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTogXG4gICAgZ2V0TGFiZWxDbGFzczogXCImXCJcbiAgICBzdGF0dXM6IFwiQFwiXG5cbiAgdGVtcGxhdGU6IFwiPHNwYW4gdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRMYWJlbENsYXNzKCknPjxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT48L3NwYW4+XCJcbiAgXG4gIGxpbms6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgc2NvcGUuZ2V0TGFiZWxDbGFzcyA9IC0+XG4gICAgICAnbGFiZWwgbGFiZWwtJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAnYnBMYWJlbCcsIChKb2JzU2VydmljZSkgLT5cbiAgdHJhbnNjbHVkZTogdHJ1ZVxuICByZXBsYWNlOiB0cnVlXG4gIHNjb3BlOlxuICAgIGdldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3M6IFwiJlwiXG4gICAgc3RhdHVzOiBcIkBcIlxuXG4gIHRlbXBsYXRlOiBcIjxzcGFuIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzcygpJz48bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+PC9zcGFuPlwiXG5cbiAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRycykgLT5cbiAgICBzY29wZS5nZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzID0gLT5cbiAgICAgICdsYWJlbCBsYWJlbC0nICsgSm9ic1NlcnZpY2UudHJhbnNsYXRlQmFja1ByZXNzdXJlTGFiZWxTdGF0ZShhdHRycy5zdGF0dXMpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdpbmRpY2F0b3JQcmltYXJ5JywgKEpvYnNTZXJ2aWNlKSAtPlxuICByZXBsYWNlOiB0cnVlXG4gIHNjb3BlOiBcbiAgICBnZXRMYWJlbENsYXNzOiBcIiZcIlxuICAgIHN0YXR1czogJ0AnXG5cbiAgdGVtcGxhdGU6IFwiPGkgdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRMYWJlbENsYXNzKCknIC8+XCJcbiAgXG4gIGxpbms6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgc2NvcGUuZ2V0TGFiZWxDbGFzcyA9IC0+XG4gICAgICAnZmEgZmEtY2lyY2xlIGluZGljYXRvciBpbmRpY2F0b3ItJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAndGFibGVQcm9wZXJ0eScsIC0+XG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6XG4gICAgdmFsdWU6ICc9J1xuXG4gIHRlbXBsYXRlOiBcIjx0ZCB0aXRsZT1cXFwie3t2YWx1ZSB8fCAnTm9uZSd9fVxcXCI+e3t2YWx1ZSB8fCAnTm9uZSd9fTwvdGQ+XCJcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmRpcmVjdGl2ZSgnYnNMYWJlbCcsIGZ1bmN0aW9uKEpvYnNTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBnZXRMYWJlbENsYXNzOiBcIiZcIixcbiAgICAgIHN0YXR1czogXCJAXCJcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBcIjxzcGFuIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0TGFiZWxDbGFzcygpJz48bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+PC9zcGFuPlwiLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgcmV0dXJuIHNjb3BlLmdldExhYmVsQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICdsYWJlbCBsYWJlbC0nICsgSm9ic1NlcnZpY2UudHJhbnNsYXRlTGFiZWxTdGF0ZShhdHRycy5zdGF0dXMpO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ2JwTGFiZWwnLCBmdW5jdGlvbihKb2JzU2VydmljZSkge1xuICByZXR1cm4ge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzczogXCImXCIsXG4gICAgICBzdGF0dXM6IFwiQFwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogXCI8c3BhbiB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3MoKSc+PG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPjwvc3Bhbj5cIixcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHJldHVybiBzY29wZS5nZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnbGFiZWwgbGFiZWwtJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUJhY2tQcmVzc3VyZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufSkuZGlyZWN0aXZlKCdpbmRpY2F0b3JQcmltYXJ5JywgZnVuY3Rpb24oSm9ic1NlcnZpY2UpIHtcbiAgcmV0dXJuIHtcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBnZXRMYWJlbENsYXNzOiBcIiZcIixcbiAgICAgIHN0YXR1czogJ0AnXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogXCI8aSB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldExhYmVsQ2xhc3MoKScgLz5cIixcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHJldHVybiBzY29wZS5nZXRMYWJlbENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnZmEgZmEtY2lyY2xlIGluZGljYXRvciBpbmRpY2F0b3ItJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufSkuZGlyZWN0aXZlKCd0YWJsZVByb3BlcnR5JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgdmFsdWU6ICc9J1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiPHRkIHRpdGxlPVxcXCJ7e3ZhbHVlIHx8ICdOb25lJ319XFxcIj57e3ZhbHVlIHx8ICdOb25lJ319PC90ZD5cIlxuICB9O1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmZpbHRlciBcImFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZFwiLCAoYW5ndWxhck1vbWVudENvbmZpZykgLT5cbiAgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyID0gKHZhbHVlLCBmb3JtYXQsIGR1cmF0aW9uRm9ybWF0KSAtPlxuICAgIHJldHVybiBcIlwiICBpZiB0eXBlb2YgdmFsdWUgaXMgXCJ1bmRlZmluZWRcIiBvciB2YWx1ZSBpcyBudWxsXG5cbiAgICBtb21lbnQuZHVyYXRpb24odmFsdWUsIGZvcm1hdCkuZm9ybWF0KGR1cmF0aW9uRm9ybWF0LCB7IHRyaW06IGZhbHNlIH0pXG5cbiAgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyLiRzdGF0ZWZ1bCA9IGFuZ3VsYXJNb21lbnRDb25maWcuc3RhdGVmdWxGaWx0ZXJzXG5cbiAgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyXG5cbi5maWx0ZXIgXCJodW1hbml6ZUR1cmF0aW9uXCIsIC0+XG4gICh2YWx1ZSwgc2hvcnQpIC0+XG4gICAgcmV0dXJuIFwiXCIgaWYgdHlwZW9mIHZhbHVlIGlzIFwidW5kZWZpbmVkXCIgb3IgdmFsdWUgaXMgbnVsbFxuICAgIG1zID0gdmFsdWUgJSAxMDAwXG4gICAgeCA9IE1hdGguZmxvb3IodmFsdWUgLyAxMDAwKVxuICAgIHNlY29uZHMgPSB4ICUgNjBcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gNjApXG4gICAgbWludXRlcyA9IHggJSA2MFxuICAgIHggPSBNYXRoLmZsb29yKHggLyA2MClcbiAgICBob3VycyA9IHggJSAyNFxuICAgIHggPSBNYXRoLmZsb29yKHggLyAyNClcbiAgICBkYXlzID0geFxuICAgIGlmIGRheXMgPT0gMFxuICAgICAgaWYgaG91cnMgPT0gMFxuICAgICAgICBpZiBtaW51dGVzID09IDBcbiAgICAgICAgICBpZiBzZWNvbmRzID09IDBcbiAgICAgICAgICAgIHJldHVybiBtcyArIFwibXNcIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBzZWNvbmRzICsgXCJzIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIlxuICAgICAgZWxzZVxuICAgICAgICBpZiBzaG9ydCB0aGVuIHJldHVybiBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm1cIiBlbHNlIHJldHVybiBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCJcbiAgICBlbHNlXG4gICAgICBpZiBzaG9ydCB0aGVuIHJldHVybiBkYXlzICsgXCJkIFwiICsgaG91cnMgKyBcImhcIiBlbHNlIHJldHVybiBkYXlzICsgXCJkIFwiICsgaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiXG5cbi5maWx0ZXIgXCJsaW1pdFwiLCAtPlxuICAodGV4dCkgLT5cbiAgICBpZiAodGV4dC5sZW5ndGggPiA3MylcbiAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCAzNSkgKyBcIi4uLlwiICsgdGV4dC5zdWJzdHJpbmcodGV4dC5sZW5ndGggLSAzNSwgdGV4dC5sZW5ndGgpXG4gICAgdGV4dFxuXG4uZmlsdGVyIFwiaHVtYW5pemVUZXh0XCIsIC0+XG4gICh0ZXh0KSAtPlxuICAgICMgVE9ETzogZXh0ZW5kLi4uIGEgbG90XG4gICAgaWYgdGV4dCB0aGVuIHRleHQucmVwbGFjZSgvJmd0Oy9nLCBcIj5cIikucmVwbGFjZSgvPGJyXFwvPi9nLFwiXCIpIGVsc2UgJydcblxuLmZpbHRlciBcImh1bWFuaXplQnl0ZXNcIiwgWydCeXRlc1NlcnZpY2UnLCAoQnl0ZXNTZXJ2aWNlKSAtPlxuICAoYW1vdW50KSAtPlxuICAgIHIgPSBCeXRlc1NlcnZpY2UuaHVtYW5pemUoYW1vdW50KVxuICAgIHJldHVybiBcIlwiIHVubGVzcyByXG5cbiAgICByWzBdICsgXCIgXCIgKyByWzFdXG5dXG5cbi5maWx0ZXIgXCJ0b0xvY2FsZVN0cmluZ1wiLCAtPlxuICAodGV4dCkgLT4gdGV4dC50b0xvY2FsZVN0cmluZygpXG5cbi5maWx0ZXIgXCJ0b1VwcGVyQ2FzZVwiLCAtPlxuICAodGV4dCkgLT4gdGV4dC50b1VwcGVyQ2FzZSgpXG5cbi5maWx0ZXIgXCJwZXJjZW50YWdlXCIsIC0+XG4gIChudW1iZXIpIC0+IChudW1iZXIgKiAxMDApLnRvRml4ZWQoMCkgKyAnJSdcblxuLmZpbHRlciBcImh1bWFuaXplV2F0ZXJtYXJrXCIsICh3YXRlcm1hcmtzQ29uZmlnKSAtPlxuICAodmFsdWUpIC0+XG4gICAgaWYgaXNOYU4odmFsdWUpIHx8IHZhbHVlIDw9IHdhdGVybWFya3NDb25maWcubm9XYXRlcm1hcmtcbiAgICAgIHJldHVybiAnTm8gV2F0ZXJtYXJrJ1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB2YWx1ZVxuXG4uZmlsdGVyIFwiaW5jcmVtZW50XCIsIC0+XG4gIChudW1iZXIpIC0+XG4gICAgcGFyc2VJbnQobnVtYmVyKSArIDFcblxuLmZpbHRlciBcImh1bWFuaXplQ2hhcnROdW1lcmljXCIsIFsnaHVtYW5pemVCeXRlc0ZpbHRlcicsICdodW1hbml6ZUR1cmF0aW9uRmlsdGVyJywgKGh1bWFuaXplQnl0ZXNGaWx0ZXIsIGh1bWFuaXplRHVyYXRpb25GaWx0ZXIpLT5cbiAgKHZhbHVlLCBtZXRyaWMpLT5cbiAgICByZXR1cm5fdmFsID0gJydcbiAgICBpZiB2YWx1ZSAhPSBudWxsXG4gICAgICBpZiAvYnl0ZXMvaS50ZXN0KG1ldHJpYy5pZCkgJiYgL3BlcnNlY29uZC9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gaHVtYW5pemVCeXRlc0ZpbHRlcih2YWx1ZSkgKyAnIC8gcydcbiAgICAgIGVsc2UgaWYgL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpXG4gICAgICAgIHJldHVybl92YWwgPSBodW1hbml6ZUJ5dGVzRmlsdGVyKHZhbHVlKVxuICAgICAgZWxzZSBpZiAvcGVyc2Vjb25kL2kudGVzdChtZXRyaWMuaWQpXG4gICAgICAgIHJldHVybl92YWwgPSB2YWx1ZSArICcgLyBzJ1xuICAgICAgZWxzZSBpZiAvdGltZS9pLnRlc3QobWV0cmljLmlkKSB8fCAvbGF0ZW5jeS9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gaHVtYW5pemVEdXJhdGlvbkZpbHRlcih2YWx1ZSwgdHJ1ZSlcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlXG4gICAgcmV0dXJuIHJldHVybl92YWxcbl1cblxuLmZpbHRlciBcImh1bWFuaXplQ2hhcnROdW1lcmljVGl0bGVcIiwgWydodW1hbml6ZUR1cmF0aW9uRmlsdGVyJywgKGh1bWFuaXplRHVyYXRpb25GaWx0ZXIpLT5cbiAgKHZhbHVlLCBtZXRyaWMpLT5cbiAgICByZXR1cm5fdmFsID0gJydcbiAgICBpZiB2YWx1ZSAhPSBudWxsXG4gICAgICBpZiAvYnl0ZXMvaS50ZXN0KG1ldHJpYy5pZCkgJiYgL3BlcnNlY29uZC9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gdmFsdWUgKyAnIEJ5dGVzIC8gcydcbiAgICAgIGVsc2UgaWYgL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpXG4gICAgICAgIHJldHVybl92YWwgPSB2YWx1ZSArICcgQnl0ZXMnXG4gICAgICBlbHNlIGlmIC9wZXJzZWNvbmQvaS50ZXN0KG1ldHJpYy5pZClcbiAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlICsgJyAvIHMnXG4gICAgICBlbHNlIGlmIC90aW1lL2kudGVzdChtZXRyaWMuaWQpIHx8IC9sYXRlbmN5L2kudGVzdChtZXRyaWMuaWQpXG4gICAgICAgIHJldHVybl92YWwgPSBodW1hbml6ZUR1cmF0aW9uRmlsdGVyKHZhbHVlLCBmYWxzZSlcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlXG4gICAgcmV0dXJuIHJldHVybl92YWxcbl1cblxuLmZpbHRlciBcInNlYXJjaE1ldHJpY3NcIiwgLT5cbiAgKGF2YWlsYWJsZU1ldHJpY3MsIHF1ZXJ5KS0+XG4gICAgcXVlcnlSZWdleCA9IG5ldyBSZWdFeHAocXVlcnksIFwiZ2lcIilcbiAgICByZXR1cm4gKG1ldHJpYyBmb3IgbWV0cmljIGluIGF2YWlsYWJsZU1ldHJpY3Mgd2hlbiBtZXRyaWMuaWQubWF0Y2gocXVlcnlSZWdleCkpXG5cbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmZpbHRlcihcImFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZFwiLCBmdW5jdGlvbihhbmd1bGFyTW9tZW50Q29uZmlnKSB7XG4gIHZhciBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXI7XG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlciA9IGZ1bmN0aW9uKHZhbHVlLCBmb3JtYXQsIGR1cmF0aW9uRm9ybWF0KSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIiB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiBtb21lbnQuZHVyYXRpb24odmFsdWUsIGZvcm1hdCkuZm9ybWF0KGR1cmF0aW9uRm9ybWF0LCB7XG4gICAgICB0cmltOiBmYWxzZVxuICAgIH0pO1xuICB9O1xuICBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXIuJHN0YXRlZnVsID0gYW5ndWxhck1vbWVudENvbmZpZy5zdGF0ZWZ1bEZpbHRlcnM7XG4gIHJldHVybiBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXI7XG59KS5maWx0ZXIoXCJodW1hbml6ZUR1cmF0aW9uXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIHNob3J0KSB7XG4gICAgdmFyIGRheXMsIGhvdXJzLCBtaW51dGVzLCBtcywgc2Vjb25kcywgeDtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgbXMgPSB2YWx1ZSAlIDEwMDA7XG4gICAgeCA9IE1hdGguZmxvb3IodmFsdWUgLyAxMDAwKTtcbiAgICBzZWNvbmRzID0geCAlIDYwO1xuICAgIHggPSBNYXRoLmZsb29yKHggLyA2MCk7XG4gICAgbWludXRlcyA9IHggJSA2MDtcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gNjApO1xuICAgIGhvdXJzID0geCAlIDI0O1xuICAgIHggPSBNYXRoLmZsb29yKHggLyAyNCk7XG4gICAgZGF5cyA9IHg7XG4gICAgaWYgKGRheXMgPT09IDApIHtcbiAgICAgIGlmIChob3VycyA9PT0gMCkge1xuICAgICAgICBpZiAobWludXRlcyA9PT0gMCkge1xuICAgICAgICAgIGlmIChzZWNvbmRzID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbXMgKyBcIm1zXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzZWNvbmRzICsgXCJzIFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNob3J0KSB7XG4gICAgICAgICAgcmV0dXJuIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNob3J0KSB7XG4gICAgICAgIHJldHVybiBkYXlzICsgXCJkIFwiICsgaG91cnMgKyBcImhcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkYXlzICsgXCJkIFwiICsgaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pLmZpbHRlcihcImxpbWl0XCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDczKSB7XG4gICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgMzUpICsgXCIuLi5cIiArIHRleHQuc3Vic3RyaW5nKHRleHQubGVuZ3RoIC0gMzUsIHRleHQubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG4gIH07XG59KS5maWx0ZXIoXCJodW1hbml6ZVRleHRcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLzxiclxcLz4vZywgXCJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH07XG59KS5maWx0ZXIoXCJodW1hbml6ZUJ5dGVzXCIsIFtcbiAgJ0J5dGVzU2VydmljZScsIGZ1bmN0aW9uKEJ5dGVzU2VydmljZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHZhciByO1xuICAgICAgciA9IEJ5dGVzU2VydmljZS5odW1hbml6ZShhbW91bnQpO1xuICAgICAgaWYgKCFyKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJbMF0gKyBcIiBcIiArIHJbMV07XG4gICAgfTtcbiAgfVxuXSkuZmlsdGVyKFwidG9Mb2NhbGVTdHJpbmdcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9Mb2NhbGVTdHJpbmcoKTtcbiAgfTtcbn0pLmZpbHRlcihcInRvVXBwZXJDYXNlXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvVXBwZXJDYXNlKCk7XG4gIH07XG59KS5maWx0ZXIoXCJwZXJjZW50YWdlXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24obnVtYmVyKSB7XG4gICAgcmV0dXJuIChudW1iZXIgKiAxMDApLnRvRml4ZWQoMCkgKyAnJSc7XG4gIH07XG59KS5maWx0ZXIoXCJodW1hbml6ZVdhdGVybWFya1wiLCBmdW5jdGlvbih3YXRlcm1hcmtzQ29uZmlnKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPD0gd2F0ZXJtYXJrc0NvbmZpZy5ub1dhdGVybWFyaykge1xuICAgICAgcmV0dXJuICdObyBXYXRlcm1hcmsnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9O1xufSkuZmlsdGVyKFwiaW5jcmVtZW50XCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24obnVtYmVyKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KG51bWJlcikgKyAxO1xuICB9O1xufSkuZmlsdGVyKFwiaHVtYW5pemVDaGFydE51bWVyaWNcIiwgW1xuICAnaHVtYW5pemVCeXRlc0ZpbHRlcicsICdodW1hbml6ZUR1cmF0aW9uRmlsdGVyJywgZnVuY3Rpb24oaHVtYW5pemVCeXRlc0ZpbHRlciwgaHVtYW5pemVEdXJhdGlvbkZpbHRlcikge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgbWV0cmljKSB7XG4gICAgICB2YXIgcmV0dXJuX3ZhbDtcbiAgICAgIHJldHVybl92YWwgPSAnJztcbiAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpICYmIC9wZXJzZWNvbmQvaS50ZXN0KG1ldHJpYy5pZCkpIHtcbiAgICAgICAgICByZXR1cm5fdmFsID0gaHVtYW5pemVCeXRlc0ZpbHRlcih2YWx1ZSkgKyAnIC8gcyc7XG4gICAgICAgIH0gZWxzZSBpZiAoL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IGh1bWFuaXplQnl0ZXNGaWx0ZXIodmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKC9wZXJzZWNvbmQvaS50ZXN0KG1ldHJpYy5pZCkpIHtcbiAgICAgICAgICByZXR1cm5fdmFsID0gdmFsdWUgKyAnIC8gcyc7XG4gICAgICAgIH0gZWxzZSBpZiAoL3RpbWUvaS50ZXN0KG1ldHJpYy5pZCkgfHwgL2xhdGVuY3kvaS50ZXN0KG1ldHJpYy5pZCkpIHtcbiAgICAgICAgICByZXR1cm5fdmFsID0gaHVtYW5pemVEdXJhdGlvbkZpbHRlcih2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0dXJuX3ZhbDtcbiAgICB9O1xuICB9XG5dKS5maWx0ZXIoXCJodW1hbml6ZUNoYXJ0TnVtZXJpY1RpdGxlXCIsIFtcbiAgJ2h1bWFuaXplRHVyYXRpb25GaWx0ZXInLCBmdW5jdGlvbihodW1hbml6ZUR1cmF0aW9uRmlsdGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBtZXRyaWMpIHtcbiAgICAgIHZhciByZXR1cm5fdmFsO1xuICAgICAgcmV0dXJuX3ZhbCA9ICcnO1xuICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIGlmICgvYnl0ZXMvaS50ZXN0KG1ldHJpYy5pZCkgJiYgL3BlcnNlY29uZC9pLnRlc3QobWV0cmljLmlkKSkge1xuICAgICAgICAgIHJldHVybl92YWwgPSB2YWx1ZSArICcgQnl0ZXMgLyBzJztcbiAgICAgICAgfSBlbHNlIGlmICgvYnl0ZXMvaS50ZXN0KG1ldHJpYy5pZCkpIHtcbiAgICAgICAgICByZXR1cm5fdmFsID0gdmFsdWUgKyAnIEJ5dGVzJztcbiAgICAgICAgfSBlbHNlIGlmICgvcGVyc2Vjb25kL2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlICsgJyAvIHMnO1xuICAgICAgICB9IGVsc2UgaWYgKC90aW1lL2kudGVzdChtZXRyaWMuaWQpIHx8IC9sYXRlbmN5L2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IGh1bWFuaXplRHVyYXRpb25GaWx0ZXIodmFsdWUsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm5fdmFsID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXR1cm5fdmFsO1xuICAgIH07XG4gIH1cbl0pLmZpbHRlcihcInNlYXJjaE1ldHJpY3NcIiwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihhdmFpbGFibGVNZXRyaWNzLCBxdWVyeSkge1xuICAgIHZhciBtZXRyaWMsIHF1ZXJ5UmVnZXg7XG4gICAgcXVlcnlSZWdleCA9IG5ldyBSZWdFeHAocXVlcnksIFwiZ2lcIik7XG4gICAgcmV0dXJuIChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpLCBsZW4sIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBhdmFpbGFibGVNZXRyaWNzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIG1ldHJpYyA9IGF2YWlsYWJsZU1ldHJpY3NbaV07XG4gICAgICAgIGlmIChtZXRyaWMuaWQubWF0Y2gocXVlcnlSZWdleCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gobWV0cmljKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkoKTtcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdNYWluU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBAbG9hZENvbmZpZyA9IC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJjb25maWdcIlxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuXG4gIEBcblxuLnNlcnZpY2UgJ0J5dGVzU2VydmljZScsICgpIC0+XG4gIEBodW1hbml6ZSA9IChhbW91bnQpIC0+XG4gICAgcmV0dXJuIG51bGwgaWYgdHlwZW9mIGFtb3VudCBpcyBcInVuZGVmaW5lZFwiIG9yIGFtb3VudCBpcyBudWxsXG5cbiAgICByZXN1bHQgPSAodiwgdSkgLT5cbiAgICAgIFt2LCB1XVxuXG4gICAgdW5pdHMgPSBbXCJCXCIsIFwiS0JcIiwgXCJNQlwiLCBcIkdCXCIsIFwiVEJcIiwgXCJQQlwiLCBcIkVCXCJdXG4gICAgY29udmVydGVyID0gKHZhbHVlLCBwb3dlcikgLT5cbiAgICAgIGJhc2UgPSBNYXRoLnBvdygxMDI0LCBwb3dlcilcbiAgICAgIGlmIHZhbHVlIDwgYmFzZVxuICAgICAgICByZXR1cm4gcmVzdWx0KCh2YWx1ZSAvIGJhc2UpLnRvRml4ZWQoMiksIHVuaXRzW3Bvd2VyXSlcbiAgICAgIGVsc2UgaWYgdmFsdWUgPCBiYXNlICogMTAwMFxuICAgICAgICByZXR1cm4gcmVzdWx0KCh2YWx1ZSAvIGJhc2UpLnRvUHJlY2lzaW9uKDMpLCB1bml0c1twb3dlcl0pXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBjb252ZXJ0ZXIodmFsdWUsIHBvd2VyICsgMSlcblxuICAgIGlmIGFtb3VudCA8IDEwMDAgdGhlbiByZXN1bHQoYW1vdW50LCBcIkJcIikgZWxzZSBjb252ZXJ0ZXIoYW1vdW50LCAxKVxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ01haW5TZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB0aGlzLmxvYWRDb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImNvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KS5zZXJ2aWNlKCdCeXRlc1NlcnZpY2UnLCBmdW5jdGlvbigpIHtcbiAgdGhpcy5odW1hbml6ZSA9IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgIHZhciBjb252ZXJ0ZXIsIHJlc3VsdCwgdW5pdHM7XG4gICAgaWYgKHR5cGVvZiBhbW91bnQgPT09IFwidW5kZWZpbmVkXCIgfHwgYW1vdW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0ID0gZnVuY3Rpb24odiwgdSkge1xuICAgICAgcmV0dXJuIFt2LCB1XTtcbiAgICB9O1xuICAgIHVuaXRzID0gW1wiQlwiLCBcIktCXCIsIFwiTUJcIiwgXCJHQlwiLCBcIlRCXCIsIFwiUEJcIiwgXCJFQlwiXTtcbiAgICBjb252ZXJ0ZXIgPSBmdW5jdGlvbih2YWx1ZSwgcG93ZXIpIHtcbiAgICAgIHZhciBiYXNlO1xuICAgICAgYmFzZSA9IE1hdGgucG93KDEwMjQsIHBvd2VyKTtcbiAgICAgIGlmICh2YWx1ZSA8IGJhc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCgodmFsdWUgLyBiYXNlKS50b0ZpeGVkKDIpLCB1bml0c1twb3dlcl0pO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IGJhc2UgKiAxMDAwKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQoKHZhbHVlIC8gYmFzZSkudG9QcmVjaXNpb24oMyksIHVuaXRzW3Bvd2VyXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBwb3dlciArIDEpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGFtb3VudCA8IDEwMDApIHtcbiAgICAgIHJldHVybiByZXN1bHQoYW1vdW50LCBcIkJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb252ZXJ0ZXIoYW1vdW50LCAxKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJDb25maWdDb250cm9sbGVyJywgKCRzY29wZSwgSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuIChkYXRhKSAtPlxuICAgIGlmICEkc2NvcGUuam9ibWFuYWdlcj9cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge31cbiAgICAkc2NvcGUuam9ibWFuYWdlclsnY29uZmlnJ10gPSBkYXRhXG5cbi5jb250cm9sbGVyICdKb2JNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4gKGRhdGEpIC0+XG4gICAgaWYgISRzY29wZS5qb2JtYW5hZ2VyP1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fVxuICAgICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlLmxvYWRMb2dzKCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGFcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJTdGRvdXRDb250cm9sbGVyJywgKCRzY29wZSwgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuIChkYXRhKSAtPlxuICAgIGlmICEkc2NvcGUuam9ibWFuYWdlcj9cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge31cbiAgICAkc2NvcGUuam9ibWFuYWdlclsnc3Rkb3V0J10gPSBkYXRhXG5cbiAgJHNjb3BlLnJlbG9hZERhdGEgPSAoKSAtPlxuICAgIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmpvYm1hbmFnZXJbJ3N0ZG91dCddID0gZGF0YVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignSm9iTWFuYWdlckNvbmZpZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlKSB7XG4gIHJldHVybiBKb2JNYW5hZ2VyQ29uZmlnU2VydmljZS5sb2FkQ29uZmlnKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCRzY29wZS5qb2JtYW5hZ2VyID09IG51bGwpIHtcbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge307XG4gICAgfVxuICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnY29uZmlnJ10gPSBkYXRhO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlKSB7XG4gIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICgkc2NvcGUuam9ibWFuYWdlciA9PSBudWxsKSB7XG4gICAgICAkc2NvcGUuam9ibWFuYWdlciA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gJHNjb3BlLmpvYm1hbmFnZXJbJ2xvZyddID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUucmVsb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UubG9hZExvZ3MoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnbG9nJ10gPSBkYXRhO1xuICAgIH0pO1xuICB9O1xufSkuY29udHJvbGxlcignSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlKSB7XG4gIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoJHNjb3BlLmpvYm1hbmFnZXIgPT0gbnVsbCkge1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLnJlbG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UubG9hZFN0ZG91dCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgY29uZmlnID0ge31cblxuICBAbG9hZENvbmZpZyA9IC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2NvbmZpZ1wiKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGNvbmZpZyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyTG9nc1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgbG9ncyA9IHt9XG5cbiAgQGxvYWRMb2dzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvbG9nXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgbG9ncyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyU3Rkb3V0U2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBzdGRvdXQgPSB7fVxuXG4gIEBsb2FkU3Rkb3V0ID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvc3Rkb3V0XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgc3Rkb3V0ID0gZGF0YVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ0pvYk1hbmFnZXJDb25maWdTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgY29uZmlnO1xuICBjb25maWcgPSB7fTtcbiAgdGhpcy5sb2FkQ29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBjb25maWcgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnSm9iTWFuYWdlckxvZ3NTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgbG9ncztcbiAgbG9ncyA9IHt9O1xuICB0aGlzLmxvYWRMb2dzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2xvZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBsb2dzID0gZGF0YTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pLnNlcnZpY2UoJ0pvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgc3Rkb3V0O1xuICBzdGRvdXQgPSB7fTtcbiAgdGhpcy5sb2FkU3Rkb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL3N0ZG91dFwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBzdGRvdXQgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ1J1bm5pbmdKb2JzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gLT5cbiAgICAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKVxuXG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcblxuICAkc2NvcGUuam9iT2JzZXJ2ZXIoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gLT5cbiAgICAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJylcblxuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG5cbiAgJHNjb3BlLmpvYk9ic2VydmVyKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnU2luZ2xlSm9iQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UsICRyb290U2NvcGUsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwsICRxKSAtPlxuICAkc2NvcGUuam9iaWQgPSAkc3RhdGVQYXJhbXMuam9iaWRcbiAgJHNjb3BlLmpvYiA9IG51bGxcbiAgJHNjb3BlLnBsYW4gPSBudWxsXG4gICRzY29wZS53YXRlcm1hcmtzID0ge31cbiAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbFxuICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IHt9XG4gICRzY29wZS5nb2RhdGEgPSBudWxsXG5cbiAgcmVmcmVzaGVyID0gJGludGVydmFsIC0+XG4gICAgSm9ic1NlcnZpY2UubG9hZEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuam9iID0gZGF0YVxuICAgICAgTWV0cmljc1NlcnZpY2UuZ2V0V2F0ZXJtYXJrcygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS53YXRlcm1hcmtzID0gZGF0YVxuICAgICAgTWV0cmljc1NlcnZpY2UuZ2V0R2xvYmFsT3ZlcnZpZXcoJHNjb3BlLmpvYi5qaWQsICRzY29wZS5wbGFuLm5vZGVzKS50aGVuIChkYXRhKSAtPlxuICAgICAgICAkc2NvcGUuZ29kYXRhID0gZGF0YVxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkc2NvcGUuam9iID0gbnVsbFxuICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICRzY29wZS53YXRlcm1hcmtzID0ge31cbiAgICAkc2NvcGUudmVydGljZXMgPSBudWxsXG4gICAgJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHMgPSBudWxsXG4gICAgJHNjb3BlLmdvZGF0YSA9IG51bGxcblxuICAgICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaGVyKVxuXG4gICRzY29wZS5jYW5jZWxKb2IgPSAoY2FuY2VsRXZlbnQpIC0+XG4gICAgYW5ndWxhci5lbGVtZW50KGNhbmNlbEV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiYnRuXCIpLnJlbW92ZUNsYXNzKFwiYnRuLWRlZmF1bHRcIikuaHRtbCgnQ2FuY2VsbGluZy4uLicpXG4gICAgSm9ic1NlcnZpY2UuY2FuY2VsSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgIHt9XG5cbiAgJHNjb3BlLnN0b3BKb2IgPSAoc3RvcEV2ZW50KSAtPlxuICAgIGFuZ3VsYXIuZWxlbWVudChzdG9wRXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJidG5cIikucmVtb3ZlQ2xhc3MoXCJidG4tZGVmYXVsdFwiKS5odG1sKCdTdG9wcGluZy4uLicpXG4gICAgSm9ic1NlcnZpY2Uuc3RvcEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICB7fVxuXG4gIEpvYnNTZXJ2aWNlLmxvYWRKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5qb2IgPSBkYXRhXG4gICAgJHNjb3BlLnZlcnRpY2VzID0gZGF0YS52ZXJ0aWNlc1xuICAgICRzY29wZS5wbGFuID0gZGF0YS5wbGFuXG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0dXBNZXRyaWNzKCRzdGF0ZVBhcmFtcy5qb2JpZCwgZGF0YS52ZXJ0aWNlcylcbiAgICBNZXRyaWNzU2VydmljZS5nZXRXYXRlcm1hcmtzKCRzY29wZS5qb2IuamlkLCAkc2NvcGUucGxhbi5ub2RlcykudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS53YXRlcm1hcmtzID0gZGF0YVxuICAgIE1ldHJpY3NTZXJ2aWNlLmdldEdsb2JhbE92ZXJ2aWV3KCRzY29wZS5qb2IuamlkLCAkc2NvcGUucGxhbi5ub2RlcykudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5nb2RhdGEgPSBkYXRhXG5cbiAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIGxvd1dhdGVybWFyayBpcyAhPSBOYU5cbiAgJHNjb3BlLmhhc1dhdGVybWFyayA9IChub2RlaWQpIC0+XG4gICAgJHNjb3BlLndhdGVybWFya3Nbbm9kZWlkXSAmJiAhaXNOYU4oJHNjb3BlLndhdGVybWFya3Nbbm9kZWlkXVtcImxvd1dhdGVybWFya1wiXSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbkNvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHdpbmRvdywgSm9ic1NlcnZpY2UpIC0+XG4gICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZVxuICAkc2NvcGUuc3RhdGVMaXN0ID0gSm9ic1NlcnZpY2Uuc3RhdGVMaXN0KClcblxuICAkc2NvcGUuY2hhbmdlTm9kZSA9IChub2RlaWQpIC0+XG4gICAgaWYgbm9kZWlkICE9ICRzY29wZS5ub2RlaWRcbiAgICAgICRzY29wZS5ub2RlaWQgPSBub2RlaWRcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbFxuXG4gICAgICAkc2NvcGUuJGJyb2FkY2FzdCAncmVsb2FkJ1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ25vZGU6Y2hhbmdlJywgJHNjb3BlLm5vZGVpZFxuXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZVxuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGxcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGxcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsXG4gICAgICAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsXG5cbiAgJHNjb3BlLmRlYWN0aXZhdGVOb2RlID0gLT5cbiAgICAkc2NvcGUubm9kZWlkID0gbnVsbFxuICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZVxuICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsXG4gICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbFxuXG4gICRzY29wZS50b2dnbGVGb2xkID0gLT5cbiAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gISRzY29wZS5ub2RlVW5mb2xkZWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhblN1YnRhc2tzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICAkc2NvcGUuYWdncmVnYXRlID0gZmFsc2VcblxuICBnZXRTdWJ0YXNrcyA9IC0+XG4gICAgaWYgJHNjb3BlLmFnZ3JlZ2F0ZVxuICAgICAgSm9ic1NlcnZpY2UuZ2V0VGFza01hbmFnZXJzKCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS50YXNrbWFuYWdlcnMgPSBkYXRhXG4gICAgZWxzZVxuICAgICAgSm9ic1NlcnZpY2UuZ2V0U3VidGFza3MoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLnN1YnRhc2tzID0gZGF0YVxuXG4gIGlmICRzY29wZS5ub2RlaWQgYW5kICghJHNjb3BlLnZlcnRleCBvciAhJHNjb3BlLnZlcnRleC5zdClcbiAgICBnZXRTdWJ0YXNrcygpXG5cbiAgJHNjb3BlLiRvbiAncmVsb2FkJywgKGV2ZW50KSAtPlxuICAgIGdldFN1YnRhc2tzKCkgaWYgJHNjb3BlLm5vZGVpZFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBnZXRBY2N1bXVsYXRvcnMgPSAtPlxuICAgIEpvYnNTZXJ2aWNlLmdldEFjY3VtdWxhdG9ycygkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IGRhdGEubWFpblxuICAgICAgJHNjb3BlLnN1YnRhc2tBY2N1bXVsYXRvcnMgPSBkYXRhLnN1YnRhc2tzXG5cbiAgaWYgJHNjb3BlLm5vZGVpZCBhbmQgKCEkc2NvcGUudmVydGV4IG9yICEkc2NvcGUudmVydGV4LmFjY3VtdWxhdG9ycylcbiAgICBnZXRBY2N1bXVsYXRvcnMoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBnZXRBY2N1bXVsYXRvcnMoKSBpZiAkc2NvcGUubm9kZWlkXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5DaGVja3BvaW50c0NvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIC0+XG4gICMgVXBkYXRlZCBieSB0aGUgZGV0YWlscyBoYW5kbGVyIGZvciB0aGUgc3ViIGNoZWNrcG9pbnRzIG5hdiBiYXIuXG4gICRzY29wZS5jaGVja3BvaW50RGV0YWlscyA9IHt9XG4gICRzY29wZS5jaGVja3BvaW50RGV0YWlscy5pZCA9IC0xXG5cbiAgIyBSZXF1ZXN0IHRoZSBjb25maWcgb25jZSAoaXQncyBzdGF0aWMpXG4gIEpvYnNTZXJ2aWNlLmdldENoZWNrcG9pbnRDb25maWcoKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5jaGVja3BvaW50Q29uZmlnID0gZGF0YVxuXG4gICMgR2VuZXJhbCBzdGF0cyBsaWtlIGNvdW50cywgaGlzdG9yeSwgZXRjLlxuICBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRDaGVja3BvaW50U3RhdHMoKS50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgKGRhdGEgIT0gbnVsbClcbiAgICAgICAgJHNjb3BlLmNoZWNrcG9pbnRTdGF0cyA9IGRhdGFcblxuICAjIFRyaWdnZXIgcmVxdWVzdFxuICBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgIyBSZXRyaWdnZXIgcmVxdWVzdFxuICAgIGdldEdlbmVyYWxDaGVja3BvaW50U3RhdHMoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQ2hlY2twb2ludERldGFpbHNDb250cm9sbGVyJywgKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSAtPlxuICAkc2NvcGUuc3VidGFza0RldGFpbHMgPSB7fVxuICAkc2NvcGUuY2hlY2twb2ludERldGFpbHMuaWQgPSAkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkXG5cbiAgIyBEZXRhaWxlZCBzdGF0cyBmb3IgYSBzaW5nbGUgY2hlY2twb2ludFxuICBnZXRDaGVja3BvaW50RGV0YWlscyA9IChjaGVja3BvaW50SWQpIC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludERldGFpbHMoY2hlY2twb2ludElkKS50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgKGRhdGEgIT0gbnVsbClcbiAgICAgICAgJHNjb3BlLmNoZWNrcG9pbnQgPSBkYXRhXG4gICAgICBlbHNlXG4gICAgICAgICRzY29wZS51bmtub3duX2NoZWNrcG9pbnQgPSB0cnVlXG5cbiAgZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzID0gKGNoZWNrcG9pbnRJZCwgdmVydGV4SWQpIC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzKGNoZWNrcG9pbnRJZCwgdmVydGV4SWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiAoZGF0YSAhPSBudWxsKVxuICAgICAgICAkc2NvcGUuc3VidGFza0RldGFpbHNbdmVydGV4SWRdID0gZGF0YVxuXG4gIGdldENoZWNrcG9pbnREZXRhaWxzKCRzdGF0ZVBhcmFtcy5jaGVja3BvaW50SWQpXG5cbiAgaWYgKCRzY29wZS5ub2RlaWQpXG4gICAgZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzKCRzdGF0ZVBhcmFtcy5jaGVja3BvaW50SWQsICRzY29wZS5ub2RlaWQpXG5cbiAgJHNjb3BlLiRvbiAncmVsb2FkJywgKGV2ZW50KSAtPlxuICAgIGdldENoZWNrcG9pbnREZXRhaWxzKCRzdGF0ZVBhcmFtcy5jaGVja3BvaW50SWQpXG5cbiAgICBpZiAoJHNjb3BlLm5vZGVpZClcbiAgICAgIGdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkLCAkc2NvcGUubm9kZWlkKVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkc2NvcGUuY2hlY2twb2ludERldGFpbHMuaWQgPSAtMVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQmFja1ByZXNzdXJlQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSA9IC0+XG4gICAgJHNjb3BlLm5vdyA9IERhdGUubm93KClcblxuICAgIGlmICRzY29wZS5ub2RlaWRcbiAgICAgIEpvYnNTZXJ2aWNlLmdldE9wZXJhdG9yQmFja1ByZXNzdXJlKCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzWyRzY29wZS5ub2RlaWRdID0gZGF0YVxuXG4gIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIC0+XG4gIGdldFZlcnRleCA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzdGF0ZVBhcmFtcy52ZXJ0ZXhJZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS52ZXJ0ZXggPSBkYXRhXG5cbiAgZ2V0VmVydGV4KClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgZ2V0VmVydGV4KClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIC0+XG4gIEpvYnNTZXJ2aWNlLmxvYWRFeGNlcHRpb25zKCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUuZXhjZXB0aW9ucyA9IGRhdGFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUHJvcGVydGllc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSAobm9kZWlkKSAtPlxuICAgIGlmIG5vZGVpZCAhPSAkc2NvcGUubm9kZWlkXG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkXG5cbiAgICAgIEpvYnNTZXJ2aWNlLmdldE5vZGUobm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgICAkc2NvcGUubm9kZSA9IGRhdGFcblxuICAgIGVsc2VcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgICAkc2NvcGUubm9kZSA9IG51bGxcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UsIE1ldHJpY3NTZXJ2aWNlKSAtPlxuICAkc2NvcGUuZHJhZ2dpbmcgPSBmYWxzZVxuICAkc2NvcGUud2luZG93ID0gTWV0cmljc1NlcnZpY2UuZ2V0V2luZG93KClcbiAgJHNjb3BlLmF2YWlsYWJsZU1ldHJpY3MgPSBudWxsXG5cbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigpXG5cbiAgbG9hZE1ldHJpY3MgPSAtPlxuICAgIEpvYnNTZXJ2aWNlLmdldFZlcnRleCgkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLnZlcnRleCA9IGRhdGFcblxuICAgIE1ldHJpY3NTZXJ2aWNlLmdldEF2YWlsYWJsZU1ldHJpY3MoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmF2YWlsYWJsZU1ldHJpY3MgPSBkYXRhLnNvcnQoYWxwaGFiZXRpY2FsU29ydEJ5SWQpXG4gICAgICAkc2NvcGUubWV0cmljcyA9IE1ldHJpY3NTZXJ2aWNlLmdldE1ldHJpY3NTZXR1cCgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpLm5hbWVzXG5cbiAgICAgIE1ldHJpY3NTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QgXCJtZXRyaWNzOmRhdGE6dXBkYXRlXCIsIGRhdGEudGltZXN0YW1wLCBkYXRhLnZhbHVlc1xuICAgICAgKVxuXG4gIGFscGhhYmV0aWNhbFNvcnRCeUlkID0gKGEsIGIpIC0+XG4gICAgQSA9IGEuaWQudG9Mb3dlckNhc2UoKVxuICAgIEIgPSBiLmlkLnRvTG93ZXJDYXNlKClcbiAgICBpZiBBIDwgQlxuICAgICAgcmV0dXJuIC0xXG4gICAgZWxzZSBpZiBBID4gQlxuICAgICAgcmV0dXJuIDFcbiAgICBlbHNlXG4gICAgICByZXR1cm4gMFxuXG4gICRzY29wZS5kcm9wcGVkID0gKGV2ZW50LCBpbmRleCwgaXRlbSwgZXh0ZXJuYWwsIHR5cGUpIC0+XG5cbiAgICBNZXRyaWNzU2VydmljZS5vcmRlck1ldHJpY3MoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBpdGVtLCBpbmRleClcbiAgICAkc2NvcGUuJGJyb2FkY2FzdCBcIm1ldHJpY3M6cmVmcmVzaFwiLCBpdGVtXG4gICAgbG9hZE1ldHJpY3MoKVxuICAgIGZhbHNlXG5cbiAgJHNjb3BlLmRyYWdTdGFydCA9IC0+XG4gICAgJHNjb3BlLmRyYWdnaW5nID0gdHJ1ZVxuXG4gICRzY29wZS5kcmFnRW5kID0gLT5cbiAgICAkc2NvcGUuZHJhZ2dpbmcgPSBmYWxzZVxuXG4gICRzY29wZS5hZGRNZXRyaWMgPSAobWV0cmljKSAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLmFkZE1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYy5pZClcbiAgICBsb2FkTWV0cmljcygpXG5cbiAgJHNjb3BlLnJlbW92ZU1ldHJpYyA9IChtZXRyaWMpIC0+XG4gICAgTWV0cmljc1NlcnZpY2UucmVtb3ZlTWV0cmljKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljKVxuICAgIGxvYWRNZXRyaWNzKClcblxuICAkc2NvcGUuc2V0TWV0cmljU2l6ZSA9IChtZXRyaWMsIHNpemUpIC0+XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljU2l6ZSgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgc2l6ZSlcbiAgICBsb2FkTWV0cmljcygpXG5cbiAgJHNjb3BlLnNldE1ldHJpY1ZpZXcgPSAobWV0cmljLCB2aWV3KSAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLnNldE1ldHJpY1ZpZXcoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBtZXRyaWMsIHZpZXcpXG4gICAgbG9hZE1ldHJpY3MoKVxuXG4gICRzY29wZS5nZXRWYWx1ZXMgPSAobWV0cmljKSAtPlxuICAgIE1ldHJpY3NTZXJ2aWNlLmdldFZhbHVlcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYylcblxuICAkc2NvcGUuJG9uICdub2RlOmNoYW5nZScsIChldmVudCwgbm9kZWlkKSAtPlxuICAgIGxvYWRNZXRyaWNzKCkgaWYgISRzY29wZS5kcmFnZ2luZ1xuXG4gIGxvYWRNZXRyaWNzKCkgaWYgJHNjb3BlLm5vZGVpZFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5jb250cm9sbGVyKCdSdW5uaW5nSm9ic0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLmpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdydW5uaW5nJyk7XG4gIH07XG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLmpvYk9ic2VydmVyKCk7XG59KS5jb250cm9sbGVyKCdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gICRzY29wZS5qb2JPYnNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJyk7XG4gIH07XG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLmpvYk9ic2VydmVyKCk7XG59KS5jb250cm9sbGVyKCdTaW5nbGVKb2JDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UsIE1ldHJpY3NTZXJ2aWNlLCAkcm9vdFNjb3BlLCBmbGlua0NvbmZpZywgJGludGVydmFsLCAkcSkge1xuICB2YXIgcmVmcmVzaGVyO1xuICAkc2NvcGUuam9iaWQgPSAkc3RhdGVQYXJhbXMuam9iaWQ7XG4gICRzY29wZS5qb2IgPSBudWxsO1xuICAkc2NvcGUucGxhbiA9IG51bGw7XG4gICRzY29wZS53YXRlcm1hcmtzID0ge307XG4gICRzY29wZS52ZXJ0aWNlcyA9IG51bGw7XG4gICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzID0ge307XG4gICRzY29wZS5nb2RhdGEgPSBudWxsO1xuICByZWZyZXNoZXIgPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmxvYWRKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5qb2IgPSBkYXRhO1xuICAgICAgTWV0cmljc1NlcnZpY2UuZ2V0V2F0ZXJtYXJrcygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLndhdGVybWFya3MgPSBkYXRhO1xuICAgICAgfSk7XG4gICAgICBNZXRyaWNzU2VydmljZS5nZXRHbG9iYWxPdmVydmlldygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmdvZGF0YSA9IGRhdGE7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdCgncmVsb2FkJyk7XG4gICAgfSk7XG4gIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmpvYiA9IG51bGw7XG4gICAgJHNjb3BlLnBsYW4gPSBudWxsO1xuICAgICRzY29wZS53YXRlcm1hcmtzID0ge307XG4gICAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbDtcbiAgICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IG51bGw7XG4gICAgJHNjb3BlLmdvZGF0YSA9IG51bGw7XG4gICAgcmV0dXJuICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaGVyKTtcbiAgfSk7XG4gICRzY29wZS5jYW5jZWxKb2IgPSBmdW5jdGlvbihjYW5jZWxFdmVudCkge1xuICAgIGFuZ3VsYXIuZWxlbWVudChjYW5jZWxFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ0NhbmNlbGxpbmcuLi4nKTtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuY2FuY2VsSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS5zdG9wSm9iID0gZnVuY3Rpb24oc3RvcEV2ZW50KSB7XG4gICAgYW5ndWxhci5lbGVtZW50KHN0b3BFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ1N0b3BwaW5nLi4uJyk7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnN0b3BKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9KTtcbiAgfTtcbiAgSm9ic1NlcnZpY2UubG9hZEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICRzY29wZS5qb2IgPSBkYXRhO1xuICAgICRzY29wZS52ZXJ0aWNlcyA9IGRhdGEudmVydGljZXM7XG4gICAgJHNjb3BlLnBsYW4gPSBkYXRhLnBsYW47XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0dXBNZXRyaWNzKCRzdGF0ZVBhcmFtcy5qb2JpZCwgZGF0YS52ZXJ0aWNlcyk7XG4gICAgTWV0cmljc1NlcnZpY2UuZ2V0V2F0ZXJtYXJrcygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS53YXRlcm1hcmtzID0gZGF0YTtcbiAgICB9KTtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0R2xvYmFsT3ZlcnZpZXcoJHNjb3BlLmpvYi5qaWQsICRzY29wZS5wbGFuLm5vZGVzKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuZ29kYXRhID0gZGF0YTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUuaGFzV2F0ZXJtYXJrID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgcmV0dXJuICRzY29wZS53YXRlcm1hcmtzW25vZGVpZF0gJiYgIWlzTmFOKCRzY29wZS53YXRlcm1hcmtzW25vZGVpZF1bXCJsb3dXYXRlcm1hcmtcIl0pO1xuICB9O1xufSkuY29udHJvbGxlcignSm9iUGxhbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkd2luZG93LCBKb2JzU2VydmljZSkge1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAkc2NvcGUuc3RhdGVMaXN0ID0gSm9ic1NlcnZpY2Uuc3RhdGVMaXN0KCk7XG4gICRzY29wZS5jaGFuZ2VOb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgaWYgKG5vZGVpZCAhPT0gJHNjb3BlLm5vZGVpZCkge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZDtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsO1xuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdyZWxvYWQnKTtcbiAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdCgnbm9kZTpjaGFuZ2UnLCAkc2NvcGUubm9kZWlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2U7XG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbDtcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmRlYWN0aXZhdGVOb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgcmV0dXJuICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IG51bGw7XG4gIH07XG4gIHJldHVybiAkc2NvcGUudG9nZ2xlRm9sZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUubm9kZVVuZm9sZGVkID0gISRzY29wZS5ub2RlVW5mb2xkZWQ7XG4gIH07XG59KS5jb250cm9sbGVyKCdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0U3VidGFza3M7XG4gICRzY29wZS5hZ2dyZWdhdGUgPSBmYWxzZTtcbiAgZ2V0U3VidGFza3MgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmFnZ3JlZ2F0ZSkge1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldFRhc2tNYW5hZ2Vycygkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS50YXNrbWFuYWdlcnMgPSBkYXRhO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRTdWJ0YXNrcygkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrcyA9IGRhdGE7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGlmICgkc2NvcGUubm9kZWlkICYmICghJHNjb3BlLnZlcnRleCB8fCAhJHNjb3BlLnZlcnRleC5zdCkpIHtcbiAgICBnZXRTdWJ0YXNrcygpO1xuICB9XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgICByZXR1cm4gZ2V0U3VidGFza3MoKTtcbiAgICB9XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRBY2N1bXVsYXRvcnM7XG4gIGdldEFjY3VtdWxhdG9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRBY2N1bXVsYXRvcnMoJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gZGF0YS5tYWluO1xuICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrQWNjdW11bGF0b3JzID0gZGF0YS5zdWJ0YXNrcztcbiAgICB9KTtcbiAgfTtcbiAgaWYgKCRzY29wZS5ub2RlaWQgJiYgKCEkc2NvcGUudmVydGV4IHx8ICEkc2NvcGUudmVydGV4LmFjY3VtdWxhdG9ycykpIHtcbiAgICBnZXRBY2N1bXVsYXRvcnMoKTtcbiAgfVxuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldEFjY3VtdWxhdG9ycygpO1xuICAgIH1cbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIHtcbiAgdmFyIGdldEdlbmVyYWxDaGVja3BvaW50U3RhdHM7XG4gICRzY29wZS5jaGVja3BvaW50RGV0YWlscyA9IHt9O1xuICAkc2NvcGUuY2hlY2twb2ludERldGFpbHMuaWQgPSAtMTtcbiAgSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludENvbmZpZygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiAkc2NvcGUuY2hlY2twb2ludENvbmZpZyA9IGRhdGE7XG4gIH0pO1xuICBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldENoZWNrcG9pbnRTdGF0cygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5jaGVja3BvaW50U3RhdHMgPSBkYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzKCk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHJldHVybiBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzKCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkNoZWNrcG9pbnREZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRDaGVja3BvaW50RGV0YWlscywgZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzO1xuICAkc2NvcGUuc3VidGFza0RldGFpbHMgPSB7fTtcbiAgJHNjb3BlLmNoZWNrcG9pbnREZXRhaWxzLmlkID0gJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZDtcbiAgZ2V0Q2hlY2twb2ludERldGFpbHMgPSBmdW5jdGlvbihjaGVja3BvaW50SWQpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludERldGFpbHMoY2hlY2twb2ludElkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUuY2hlY2twb2ludCA9IGRhdGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHNjb3BlLnVua25vd25fY2hlY2twb2ludCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIGdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscyA9IGZ1bmN0aW9uKGNoZWNrcG9pbnRJZCwgdmVydGV4SWQpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzKGNoZWNrcG9pbnRJZCwgdmVydGV4SWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrRGV0YWlsc1t2ZXJ0ZXhJZF0gPSBkYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBnZXRDaGVja3BvaW50RGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkKTtcbiAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICBnZXRDaGVja3BvaW50U3VidGFza0RldGFpbHMoJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZCwgJHNjb3BlLm5vZGVpZCk7XG4gIH1cbiAgJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBnZXRDaGVja3BvaW50RGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkLCAkc2NvcGUubm9kZWlkKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLmNoZWNrcG9pbnREZXRhaWxzLmlkID0gLTE7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZTtcbiAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubm93ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldE9wZXJhdG9yQmFja1ByZXNzdXJlKCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHNbJHNjb3BlLm5vZGVpZF0gPSBkYXRhO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgpO1xuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKTtcbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0VmVydGV4O1xuICBnZXRWZXJ0ZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzdGF0ZVBhcmFtcy52ZXJ0ZXhJZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLnZlcnRleCA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG4gIGdldFZlcnRleCgpO1xuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gZ2V0VmVydGV4KCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICByZXR1cm4gSm9ic1NlcnZpY2UubG9hZEV4Y2VwdGlvbnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLmV4Y2VwdGlvbnMgPSBkYXRhO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYlByb3BlcnRpZXNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICByZXR1cm4gJHNjb3BlLmNoYW5nZU5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICBpZiAobm9kZWlkICE9PSAkc2NvcGUubm9kZWlkKSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkO1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldE5vZGUobm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5ub2RlID0gZGF0YTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUubm9kZSA9IG51bGw7XG4gICAgfVxuICB9O1xufSkuY29udHJvbGxlcignSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UpIHtcbiAgdmFyIGFscGhhYmV0aWNhbFNvcnRCeUlkLCBsb2FkTWV0cmljcztcbiAgJHNjb3BlLmRyYWdnaW5nID0gZmFsc2U7XG4gICRzY29wZS53aW5kb3cgPSBNZXRyaWNzU2VydmljZS5nZXRXaW5kb3coKTtcbiAgJHNjb3BlLmF2YWlsYWJsZU1ldHJpY3MgPSBudWxsO1xuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNZXRyaWNzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoKTtcbiAgfSk7XG4gIGxvYWRNZXRyaWNzID0gZnVuY3Rpb24oKSB7XG4gICAgSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS52ZXJ0ZXggPSBkYXRhO1xuICAgIH0pO1xuICAgIHJldHVybiBNZXRyaWNzU2VydmljZS5nZXRBdmFpbGFibGVNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuYXZhaWxhYmxlTWV0cmljcyA9IGRhdGEuc29ydChhbHBoYWJldGljYWxTb3J0QnlJZCk7XG4gICAgICAkc2NvcGUubWV0cmljcyA9IE1ldHJpY3NTZXJ2aWNlLmdldE1ldHJpY3NTZXR1cCgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpLm5hbWVzO1xuICAgICAgcmV0dXJuIE1ldHJpY3NTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdChcIm1ldHJpY3M6ZGF0YTp1cGRhdGVcIiwgZGF0YS50aW1lc3RhbXAsIGRhdGEudmFsdWVzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuICBhbHBoYWJldGljYWxTb3J0QnlJZCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgQSwgQjtcbiAgICBBID0gYS5pZC50b0xvd2VyQ2FzZSgpO1xuICAgIEIgPSBiLmlkLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKEEgPCBCKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSBlbHNlIGlmIChBID4gQikge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmRyb3BwZWQgPSBmdW5jdGlvbihldmVudCwgaW5kZXgsIGl0ZW0sIGV4dGVybmFsLCB0eXBlKSB7XG4gICAgTWV0cmljc1NlcnZpY2Uub3JkZXJNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgaXRlbSwgaW5kZXgpO1xuICAgICRzY29wZS4kYnJvYWRjYXN0KFwibWV0cmljczpyZWZyZXNoXCIsIGl0ZW0pO1xuICAgIGxvYWRNZXRyaWNzKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICAkc2NvcGUuZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5kcmFnZ2luZyA9IHRydWU7XG4gIH07XG4gICRzY29wZS5kcmFnRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5kcmFnZ2luZyA9IGZhbHNlO1xuICB9O1xuICAkc2NvcGUuYWRkTWV0cmljID0gZnVuY3Rpb24obWV0cmljKSB7XG4gICAgTWV0cmljc1NlcnZpY2UuYWRkTWV0cmljKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljLmlkKTtcbiAgICByZXR1cm4gbG9hZE1ldHJpY3MoKTtcbiAgfTtcbiAgJHNjb3BlLnJlbW92ZU1ldHJpYyA9IGZ1bmN0aW9uKG1ldHJpYykge1xuICAgIE1ldHJpY3NTZXJ2aWNlLnJlbW92ZU1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYyk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5zZXRNZXRyaWNTaXplID0gZnVuY3Rpb24obWV0cmljLCBzaXplKSB7XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljU2l6ZSgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgc2l6ZSk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5zZXRNZXRyaWNWaWV3ID0gZnVuY3Rpb24obWV0cmljLCB2aWV3KSB7XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljVmlldygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgdmlldyk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbihtZXRyaWMpIHtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0VmFsdWVzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljKTtcbiAgfTtcbiAgJHNjb3BlLiRvbignbm9kZTpjaGFuZ2UnLCBmdW5jdGlvbihldmVudCwgbm9kZWlkKSB7XG4gICAgaWYgKCEkc2NvcGUuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybiBsb2FkTWV0cmljcygpO1xuICAgIH1cbiAgfSk7XG4gIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH1cbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICd2ZXJ0ZXgnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZSBzZWNvbmRhcnknIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiXG5cbiAgc2NvcGU6XG4gICAgZGF0YTogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICBhbmFseXplVGltZSA9IChkYXRhKSAtPlxuICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpXG5cbiAgICAgIHRlc3REYXRhID0gW11cblxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEuc3VidGFza3MsIChzdWJ0YXNrLCBpKSAtPlxuICAgICAgICB0aW1lcyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJTY2hlZHVsZWRcIlxuICAgICAgICAgICAgY29sb3I6IFwiIzY2NlwiXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCJcbiAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlNDSEVEVUxFRFwiXVxuICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIkRlcGxveWluZ1wiXG4gICAgICAgICAgICBjb2xvcjogXCIjYWFhXCJcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIlxuICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICBdXG5cbiAgICAgICAgaWYgc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0gPiAwXG4gICAgICAgICAgdGltZXMucHVzaCB7XG4gICAgICAgICAgICBsYWJlbDogXCJSdW5uaW5nXCJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNkZGRcIlxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiXG4gICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJSVU5OSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl1cbiAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgIH1cblxuICAgICAgICB0ZXN0RGF0YS5wdXNoIHtcbiAgICAgICAgICBsYWJlbDogXCIoI3tzdWJ0YXNrLnN1YnRhc2t9KSAje3N1YnRhc2suaG9zdH1cIlxuICAgICAgICAgIHRpbWVzOiB0aW1lc1xuICAgICAgICB9XG5cbiAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpXG4gICAgICAudGlja0Zvcm1hdCh7XG4gICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKVxuICAgICAgICAjIHRpY2tJbnRlcnZhbDogMVxuICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgfSlcbiAgICAgIC5wcmVmaXgoXCJzaW5nbGVcIilcbiAgICAgIC5sYWJlbEZvcm1hdCgobGFiZWwpIC0+XG4gICAgICAgIGxhYmVsXG4gICAgICApXG4gICAgICAubWFyZ2luKHsgbGVmdDogMTAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDAgfSlcbiAgICAgIC5pdGVtSGVpZ2h0KDMwKVxuICAgICAgLnJlbGF0aXZlVGltZSgpXG5cbiAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmdFbClcbiAgICAgIC5kYXR1bSh0ZXN0RGF0YSlcbiAgICAgIC5jYWxsKGNoYXJ0KVxuXG4gICAgYW5hbHl6ZVRpbWUoc2NvcGUuZGF0YSlcblxuICAgIHJldHVyblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAndGltZWxpbmUnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCJcblxuICBzY29wZTpcbiAgICB2ZXJ0aWNlczogXCI9XCJcbiAgICBqb2JpZDogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICB0cmFuc2xhdGVMYWJlbCA9IChsYWJlbCkgLT5cbiAgICAgIGxhYmVsLnJlcGxhY2UoXCImZ3Q7XCIsIFwiPlwiKVxuXG4gICAgYW5hbHl6ZVRpbWUgPSAoZGF0YSkgLT5cbiAgICAgIGQzLnNlbGVjdChzdmdFbCkuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKVxuXG4gICAgICB0ZXN0RGF0YSA9IFtdXG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLCAodmVydGV4KSAtPlxuICAgICAgICBpZiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSA+IC0xXG4gICAgICAgICAgaWYgdmVydGV4LnR5cGUgaXMgJ3NjaGVkdWxlZCdcbiAgICAgICAgICAgIHRlc3REYXRhLnB1c2hcbiAgICAgICAgICAgICAgdGltZXM6IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlTGFiZWwodmVydGV4Lm5hbWUpXG4gICAgICAgICAgICAgICAgY29sb3I6IFwiI2NjY2NjY1wiXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NTU1NVwiXG4gICAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogdmVydGV4WydzdGFydC10aW1lJ11cbiAgICAgICAgICAgICAgICBlbmRpbmdfdGltZTogdmVydGV4WydlbmQtdGltZSddXG4gICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRlc3REYXRhLnB1c2hcbiAgICAgICAgICAgICAgdGltZXM6IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlTGFiZWwodmVydGV4Lm5hbWUpXG4gICAgICAgICAgICAgICAgY29sb3I6IFwiI2Q5ZjFmN1wiXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzYyY2RlYVwiXG4gICAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogdmVydGV4WydzdGFydC10aW1lJ11cbiAgICAgICAgICAgICAgICBlbmRpbmdfdGltZTogdmVydGV4WydlbmQtdGltZSddXG4gICAgICAgICAgICAgICAgbGluazogdmVydGV4LmlkXG4gICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgXVxuXG4gICAgICBjaGFydCA9IGQzLnRpbWVsaW5lKCkuc3RhY2soKS5jbGljaygoZCwgaSwgZGF0dW0pIC0+XG4gICAgICAgIGlmIGQubGlua1xuICAgICAgICAgICRzdGF0ZS5nbyBcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsIHsgam9iaWQ6IHNjb3BlLmpvYmlkLCB2ZXJ0ZXhJZDogZC5saW5rIH1cblxuICAgICAgKVxuICAgICAgLnRpY2tGb3JtYXQoe1xuICAgICAgICBmb3JtYXQ6IGQzLnRpbWUuZm9ybWF0KFwiJUxcIilcbiAgICAgICAgIyB0aWNrVGltZTogZDMudGltZS5zZWNvbmRcbiAgICAgICAgIyB0aWNrSW50ZXJ2YWw6IDAuNVxuICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgfSlcbiAgICAgIC5wcmVmaXgoXCJtYWluXCIpXG4gICAgICAubWFyZ2luKHsgbGVmdDogMCwgcmlnaHQ6IDAsIHRvcDogMCwgYm90dG9tOiAwIH0pXG4gICAgICAuaXRlbUhlaWdodCgzMClcbiAgICAgIC5zaG93Qm9yZGVyTGluZSgpXG4gICAgICAuc2hvd0hvdXJUaW1lbGluZSgpXG5cbiAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmdFbClcbiAgICAgIC5kYXR1bSh0ZXN0RGF0YSlcbiAgICAgIC5jYWxsKGNoYXJ0KVxuXG4gICAgc2NvcGUuJHdhdGNoIGF0dHJzLnZlcnRpY2VzLCAoZGF0YSkgLT5cbiAgICAgIGFuYWx5emVUaW1lKGRhdGEpIGlmIGRhdGFcblxuICAgIHJldHVyblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAnc3BsaXQnLCAoKSAtPlxuICByZXR1cm4gY29tcGlsZTogKHRFbGVtLCB0QXR0cnMpIC0+XG4gICAgICBTcGxpdCh0RWxlbS5jaGlsZHJlbigpLCAoXG4gICAgICAgIHNpemVzOiBbNTAsIDUwXVxuICAgICAgICBkaXJlY3Rpb246ICd2ZXJ0aWNhbCdcbiAgICAgICkpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdqb2JQbGFuJywgKCR0aW1lb3V0KSAtPlxuICB0ZW1wbGF0ZTogXCJcbiAgICA8c3ZnIGNsYXNzPSdncmFwaCc+PGcgLz48L3N2Zz5cbiAgICA8c3ZnIGNsYXNzPSd0bXAnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxnIC8+PC9zdmc+XG4gICAgPGRpdiBjbGFzcz0nYnRuLWdyb3VwIHpvb20tYnV0dG9ucyc+XG4gICAgICA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20taW4nIG5nLWNsaWNrPSd6b29tSW4oKSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMnIC8+PC9hPlxuICAgICAgPGEgY2xhc3M9J2J0biBidG4tZGVmYXVsdCB6b29tLW91dCcgbmctY2xpY2s9J3pvb21PdXQoKSc+PGkgY2xhc3M9J2ZhIGZhLW1pbnVzJyAvPjwvYT5cbiAgICA8L2Rpdj5cIlxuXG4gIHNjb3BlOlxuICAgIHBsYW46ICc9J1xuICAgIHdhdGVybWFya3M6ICc9J1xuICAgIHNldE5vZGU6ICcmJ1xuXG4gIGxpbms6IChzY29wZSwgZWxlbSwgYXR0cnMpIC0+XG4gICAgZyA9IG51bGxcbiAgICBtYWluWm9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgIHN1YmdyYXBocyA9IFtdXG4gICAgam9iaWQgPSBhdHRycy5qb2JpZFxuXG4gICAgbWFpblN2Z0VsZW1lbnQgPSBlbGVtLmNoaWxkcmVuKClbMF1cbiAgICBtYWluRyA9IGVsZW0uY2hpbGRyZW4oKS5jaGlsZHJlbigpWzBdXG4gICAgbWFpblRtcEVsZW1lbnQgPSBlbGVtLmNoaWxkcmVuKClbMV1cblxuICAgIGQzbWFpblN2ZyA9IGQzLnNlbGVjdChtYWluU3ZnRWxlbWVudClcbiAgICBkM21haW5TdmdHID0gZDMuc2VsZWN0KG1haW5HKVxuICAgIGQzdG1wU3ZnID0gZDMuc2VsZWN0KG1haW5UbXBFbGVtZW50KVxuXG4gICAgIyBhbmd1bGFyLmVsZW1lbnQobWFpbkcpLmVtcHR5KClcbiAgICAjIGQzbWFpblN2Z0cuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKVxuXG4gICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKVxuICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtLmNoaWxkcmVuKClbMF0pLndpZHRoKGNvbnRhaW5lclcpXG5cbiAgICBsYXN0Wm9vbVNjYWxlID0gMFxuICAgIGxhc3RQb3NpdGlvbiA9IDBcblxuICAgIHNjb3BlLnpvb21JbiA9IC0+XG4gICAgICBpZiBtYWluWm9vbS5zY2FsZSgpIDwgMi45OVxuXG4gICAgICAgICMgQ2FsY3VsYXRlIGFuZCBzdG9yZSBuZXcgdmFsdWVzIGluIHpvb20gb2JqZWN0XG4gICAgICAgIHRyYW5zbGF0ZSA9IG1haW5ab29tLnRyYW5zbGF0ZSgpXG4gICAgICAgIHYxID0gdHJhbnNsYXRlWzBdICogKG1haW5ab29tLnNjYWxlKCkgKyAwLjEgLyAobWFpblpvb20uc2NhbGUoKSkpXG4gICAgICAgIHYyID0gdHJhbnNsYXRlWzFdICogKG1haW5ab29tLnNjYWxlKCkgKyAwLjEgLyAobWFpblpvb20uc2NhbGUoKSkpXG4gICAgICAgIG1haW5ab29tLnNjYWxlIG1haW5ab29tLnNjYWxlKCkgKyAwLjFcbiAgICAgICAgbWFpblpvb20udHJhbnNsYXRlIFsgdjEsIHYyIF1cblxuICAgICAgICAjIFRyYW5zZm9ybSBzdmdcbiAgICAgICAgZDNtYWluU3ZnRy5hdHRyIFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiXG5cbiAgICAgICAgbGFzdFpvb21TY2FsZSA9IG1haW5ab29tLnNjYWxlKClcbiAgICAgICAgbGFzdFBvc2l0aW9uID0gbWFpblpvb20udHJhbnNsYXRlKClcblxuICAgIHNjb3BlLnpvb21PdXQgPSAtPlxuICAgICAgaWYgbWFpblpvb20uc2NhbGUoKSA+IDAuMzFcblxuICAgICAgICAjIENhbGN1bGF0ZSBhbmQgc3RvcmUgbmV3IHZhbHVlcyBpbiBtYWluWm9vbSBvYmplY3RcbiAgICAgICAgbWFpblpvb20uc2NhbGUgbWFpblpvb20uc2NhbGUoKSAtIDAuMVxuICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUgWyB2MSwgdjIgXVxuXG4gICAgICAgICMgVHJhbnNmb3JtIHN2Z1xuICAgICAgICBkM21haW5TdmdHLmF0dHIgXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB2MSArIFwiLFwiICsgdjIgKyBcIikgc2NhbGUoXCIgKyBtYWluWm9vbS5zY2FsZSgpICsgXCIpXCJcblxuICAgICAgICBsYXN0Wm9vbVNjYWxlID0gbWFpblpvb20uc2NhbGUoKVxuICAgICAgICBsYXN0UG9zaXRpb24gPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuXG4gICAgI2NyZWF0ZSBhIGxhYmVsIG9mIGFuIGVkZ2VcbiAgICBjcmVhdGVMYWJlbEVkZ2UgPSAoZWwpIC0+XG4gICAgICBsYWJlbFZhbHVlID0gXCJcIlxuICAgICAgaWYgZWwuc2hpcF9zdHJhdGVneT8gb3IgZWwubG9jYWxfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8ZGl2IGNsYXNzPSdlZGdlLWxhYmVsJz5cIlxuICAgICAgICBsYWJlbFZhbHVlICs9IGVsLnNoaXBfc3RyYXRlZ3kgIGlmIGVsLnNoaXBfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCIgKFwiICsgZWwudGVtcF9tb2RlICsgXCIpXCIgIHVubGVzcyBlbC50ZW1wX21vZGUgaXMgYHVuZGVmaW5lZGBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneSAgdW5sZXNzIGVsLmxvY2FsX3N0cmF0ZWd5IGlzIGB1bmRlZmluZWRgXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8L2Rpdj5cIlxuICAgICAgbGFiZWxWYWx1ZVxuXG5cbiAgICAjIHRydWUsIGlmIHRoZSBub2RlIGlzIGEgc3BlY2lhbCBub2RlIGZyb20gYW4gaXRlcmF0aW9uXG4gICAgaXNTcGVjaWFsSXRlcmF0aW9uTm9kZSA9IChpbmZvKSAtPlxuICAgICAgKGluZm8gaXMgXCJwYXJ0aWFsU29sdXRpb25cIiBvciBpbmZvIGlzIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIG9yIGluZm8gaXMgXCJ3b3Jrc2V0XCIgb3IgaW5mbyBpcyBcIm5leHRXb3Jrc2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uU2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uRGVsdGFcIilcblxuICAgIGdldE5vZGVUeXBlID0gKGVsLCBpbmZvKSAtPlxuICAgICAgaWYgaW5mbyBpcyBcIm1pcnJvclwiXG4gICAgICAgICdub2RlLW1pcnJvcidcblxuICAgICAgZWxzZSBpZiBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pXG4gICAgICAgICdub2RlLWl0ZXJhdGlvbidcblxuICAgICAgZWxzZVxuICAgICAgICAnbm9kZS1ub3JtYWwnXG5cbiAgICAjIGNyZWF0ZXMgdGhlIGxhYmVsIG9mIGEgbm9kZSwgaW4gaW5mbyBpcyBzdG9yZWQsIHdoZXRoZXIgaXQgaXMgYSBzcGVjaWFsIG5vZGUgKGxpa2UgYSBtaXJyb3IgaW4gYW4gaXRlcmF0aW9uKVxuICAgIGNyZWF0ZUxhYmVsTm9kZSA9IChlbCwgaW5mbywgbWF4VywgbWF4SCkgLT5cbiAgICAgICMgbGFiZWxWYWx1ZSA9IFwiPGEgaHJlZj0nIy9qb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0ZXgvXCIgKyBlbC5pZCArIFwiJyBjbGFzcz0nbm9kZS1sYWJlbCBcIiArIGdldE5vZGVUeXBlKGVsLCBpbmZvKSArIFwiJz5cIlxuICAgICAgbGFiZWxWYWx1ZSA9IFwiPGRpdiBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiXG5cbiAgICAgICMgTm9kZW5hbWVcbiAgICAgIGlmIGluZm8gaXMgXCJtaXJyb3JcIlxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGgzIGNsYXNzPSdub2RlLW5hbWUnPk1pcnJvciBvZiBcIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiXG4gICAgICBlbHNlXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+XCIgKyBlbC5vcGVyYXRvciArIFwiPC9oMz5cIlxuICAgICAgaWYgZWwuZGVzY3JpcHRpb24gaXMgXCJcIlxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgc3RlcE5hbWUgPSBlbC5kZXNjcmlwdGlvblxuXG4gICAgICAgICMgY2xlYW4gc3RlcE5hbWVcbiAgICAgICAgc3RlcE5hbWUgPSBzaG9ydGVuU3RyaW5nKHN0ZXBOYW1lKVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg0IGNsYXNzPSdzdGVwLW5hbWUnPlwiICsgc3RlcE5hbWUgKyBcIjwvaDQ+XCJcblxuICAgICAgIyBJZiB0aGlzIG5vZGUgaXMgYW4gXCJpdGVyYXRpb25cIiB3ZSBuZWVkIGEgZGlmZmVyZW50IHBhbmVsLWJvZHlcbiAgICAgIGlmIGVsLnN0ZXBfZnVuY3Rpb24/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gZXh0ZW5kTGFiZWxOb2RlRm9ySXRlcmF0aW9uKGVsLmlkLCBtYXhXLCBtYXhIKVxuICAgICAgZWxzZVxuXG4gICAgICAgICMgT3RoZXJ3aXNlIGFkZCBpbmZvc1xuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1PlwiICsgaW5mbyArIFwiIE5vZGU8L2g1PlwiICBpZiBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+UGFyYWxsZWxpc206IFwiICsgZWwucGFyYWxsZWxpc20gKyBcIjwvaDU+XCIgIHVubGVzcyBlbC5wYXJhbGxlbGlzbSBpcyBcIlwiXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+TG93IFdhdGVybWFyazogXCIgKyBlbC5sb3dXYXRlcm1hcmsgKyBcIjwvaDU+XCIgIHVubGVzcyBlbC5sb3dXYXRlcm1hcmsgaXMgYHVuZGVmaW5lZGBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5PcGVyYXRpb246IFwiICsgc2hvcnRlblN0cmluZyhlbC5vcGVyYXRvcl9zdHJhdGVneSkgKyBcIjwvaDU+XCIgdW5sZXNzIGVsLm9wZXJhdG9yIGlzIGB1bmRlZmluZWRgIG9yIG5vdCBlbC5vcGVyYXRvcl9zdHJhdGVneVxuICAgICAgIyBsYWJlbFZhbHVlICs9IFwiPC9hPlwiXG4gICAgICBsYWJlbFZhbHVlICs9IFwiPC9kaXY+XCJcbiAgICAgIGxhYmVsVmFsdWVcblxuICAgICMgRXh0ZW5kcyB0aGUgbGFiZWwgb2YgYSBub2RlIHdpdGggYW4gYWRkaXRpb25hbCBzdmcgRWxlbWVudCB0byBwcmVzZW50IHRoZSBpdGVyYXRpb24uXG4gICAgZXh0ZW5kTGFiZWxOb2RlRm9ySXRlcmF0aW9uID0gKGlkLCBtYXhXLCBtYXhIKSAtPlxuICAgICAgc3ZnSUQgPSBcInN2Zy1cIiArIGlkXG5cbiAgICAgIGxhYmVsVmFsdWUgPSBcIjxzdmcgY2xhc3M9J1wiICsgc3ZnSUQgKyBcIicgd2lkdGg9XCIgKyBtYXhXICsgXCIgaGVpZ2h0PVwiICsgbWF4SCArIFwiPjxnIC8+PC9zdmc+XCJcbiAgICAgIGxhYmVsVmFsdWVcblxuICAgICMgU3BsaXQgYSBzdHJpbmcgaW50byBtdWx0aXBsZSBsaW5lcyBzbyB0aGF0IGVhY2ggbGluZSBoYXMgbGVzcyB0aGFuIDMwIGxldHRlcnMuXG4gICAgc2hvcnRlblN0cmluZyA9IChzKSAtPlxuICAgICAgIyBtYWtlIHN1cmUgdGhhdCBuYW1lIGRvZXMgbm90IGNvbnRhaW4gYSA8IChiZWNhdXNlIG9mIGh0bWwpXG4gICAgICBpZiBzLmNoYXJBdCgwKSBpcyBcIjxcIlxuICAgICAgICBzID0gcy5yZXBsYWNlKFwiPFwiLCBcIiZsdDtcIilcbiAgICAgICAgcyA9IHMucmVwbGFjZShcIj5cIiwgXCImZ3Q7XCIpXG4gICAgICBzYnIgPSBcIlwiXG4gICAgICB3aGlsZSBzLmxlbmd0aCA+IDMwXG4gICAgICAgIHNiciA9IHNiciArIHMuc3Vic3RyaW5nKDAsIDMwKSArIFwiPGJyPlwiXG4gICAgICAgIHMgPSBzLnN1YnN0cmluZygzMCwgcy5sZW5ndGgpXG4gICAgICBzYnIgPSBzYnIgKyBzXG4gICAgICBzYnJcblxuICAgIGNyZWF0ZU5vZGUgPSAoZywgZGF0YSwgZWwsIGlzUGFyZW50ID0gZmFsc2UsIG1heFcsIG1heEgpIC0+XG4gICAgICAjIGNyZWF0ZSBub2RlLCBzZW5kIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25zIGFib3V0IHRoZSBub2RlIGlmIGl0IGlzIGEgc3BlY2lhbCBvbmVcbiAgICAgIGlmIGVsLmlkIGlzIGRhdGEucGFydGlhbF9zb2x1dGlvblxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIiwgbWF4VywgbWF4SClcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICAgIGNsYXNzOiBnZXROb2RlVHlwZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLm5leHRfcGFydGlhbF9zb2x1dGlvblxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJuZXh0UGFydGlhbFNvbHV0aW9uXCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiKVxuXG4gICAgICBlbHNlIGlmIGVsLmlkIGlzIGRhdGEud29ya3NldFxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJ3b3Jrc2V0XCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwid29ya3NldFwiKVxuXG4gICAgICBlbHNlIGlmIGVsLmlkIGlzIGRhdGEubmV4dF93b3Jrc2V0XG4gICAgICAgIGcuc2V0Tm9kZSBlbC5pZCxcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIm5leHRXb3Jrc2V0XCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFdvcmtzZXRcIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLnNvbHV0aW9uX3NldFxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJzb2x1dGlvblNldFwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uU2V0XCIpXG5cbiAgICAgIGVsc2UgaWYgZWwuaWQgaXMgZGF0YS5zb2x1dGlvbl9kZWx0YVxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJzb2x1dGlvbkRlbHRhXCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwic29sdXRpb25EZWx0YVwiKVxuXG4gICAgICBlbHNlXG4gICAgICAgIGcuc2V0Tm9kZSBlbC5pZCxcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIlwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIlwiKVxuXG4gICAgY3JlYXRlRWRnZSA9IChnLCBkYXRhLCBlbCwgZXhpc3RpbmdOb2RlcywgcHJlZCkgLT5cbiAgICAgIGcuc2V0RWRnZSBwcmVkLmlkLCBlbC5pZCxcbiAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsRWRnZShwcmVkKVxuICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG5cbiAgICBsb2FkSnNvblRvRGFncmUgPSAoZywgZGF0YSkgLT5cbiAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXVxuXG4gICAgICBpZiBkYXRhLm5vZGVzP1xuICAgICAgICAjIFRoaXMgaXMgdGhlIG5vcm1hbCBqc29uIGRhdGFcbiAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5ub2Rlc1xuXG4gICAgICBlbHNlXG4gICAgICAgICMgVGhpcyBpcyBhbiBpdGVyYXRpb24sIHdlIG5vdyBzdG9yZSBzcGVjaWFsIGl0ZXJhdGlvbiBub2RlcyBpZiBwb3NzaWJsZVxuICAgICAgICB0b0l0ZXJhdGUgPSBkYXRhLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgaXNQYXJlbnQgPSB0cnVlXG5cbiAgICAgIGZvciBlbCBpbiB0b0l0ZXJhdGVcbiAgICAgICAgbWF4VyA9IDBcbiAgICAgICAgbWF4SCA9IDBcblxuICAgICAgICBpZiBlbC5zdGVwX2Z1bmN0aW9uXG4gICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICAgIG5vZGVzZXA6IDIwXG4gICAgICAgICAgICBlZGdlc2VwOiAwXG4gICAgICAgICAgICByYW5rc2VwOiAyMFxuICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiXG4gICAgICAgICAgICBtYXJnaW54OiAxMFxuICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICBzdWJncmFwaHNbZWwuaWRdID0gc2dcblxuICAgICAgICAgIGxvYWRKc29uVG9EYWdyZShzZywgZWwpXG5cbiAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKClcbiAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKVxuICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoXG4gICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0XG5cbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQobWFpblRtcEVsZW1lbnQpLmVtcHR5KClcblxuICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SClcblxuICAgICAgICBleGlzdGluZ05vZGVzLnB1c2ggZWwuaWRcblxuICAgICAgICAjIGNyZWF0ZSBlZGdlcyBmcm9tIGlucHV0cyB0byBjdXJyZW50IG5vZGVcbiAgICAgICAgaWYgZWwuaW5wdXRzP1xuICAgICAgICAgIGZvciBwcmVkIGluIGVsLmlucHV0c1xuICAgICAgICAgICAgY3JlYXRlRWRnZShnLCBkYXRhLCBlbCwgZXhpc3RpbmdOb2RlcywgcHJlZClcblxuICAgICAgZ1xuXG4gICAgIyBzZWFyY2hlcyBpbiB0aGUgZ2xvYmFsIEpTT05EYXRhIGZvciB0aGUgbm9kZSB3aXRoIHRoZSBnaXZlbiBpZFxuICAgIHNlYXJjaEZvck5vZGUgPSAoZGF0YSwgbm9kZUlEKSAtPlxuICAgICAgZm9yIGkgb2YgZGF0YS5ub2Rlc1xuICAgICAgICBlbCA9IGRhdGEubm9kZXNbaV1cbiAgICAgICAgcmV0dXJuIGVsICBpZiBlbC5pZCBpcyBub2RlSURcblxuICAgICAgICAjIGxvb2sgZm9yIG5vZGVzIHRoYXQgYXJlIGluIGl0ZXJhdGlvbnNcbiAgICAgICAgaWYgZWwuc3RlcF9mdW5jdGlvbj9cbiAgICAgICAgICBmb3IgaiBvZiBlbC5zdGVwX2Z1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm4gZWwuc3RlcF9mdW5jdGlvbltqXSAgaWYgZWwuc3RlcF9mdW5jdGlvbltqXS5pZCBpcyBub2RlSURcblxuICAgIG1lcmdlV2F0ZXJtYXJrcyA9IChkYXRhLCB3YXRlcm1hcmtzKSAtPlxuICAgICAgaWYgKCFfLmlzRW1wdHkod2F0ZXJtYXJrcykpXG4gICAgICAgIGZvciBub2RlIGluIGRhdGEubm9kZXNcbiAgICAgICAgICBpZiAod2F0ZXJtYXJrc1tub2RlLmlkXSAmJiAhaXNOYU4od2F0ZXJtYXJrc1tub2RlLmlkXVtcImxvd1dhdGVybWFya1wiXSkpXG4gICAgICAgICAgICBub2RlLmxvd1dhdGVybWFyayA9IHdhdGVybWFya3Nbbm9kZS5pZF1bXCJsb3dXYXRlcm1hcmtcIl1cblxuICAgICAgcmV0dXJuIGRhdGFcblxuICAgIGxhc3RQb3NpdGlvbiA9IDBcbiAgICBsYXN0Wm9vbVNjYWxlID0gMFxuXG4gICAgZHJhd0dyYXBoID0gKCkgLT5cbiAgICAgIGlmIHNjb3BlLnBsYW5cbiAgICAgICAgZyA9IG5ldyBkYWdyZUQzLmdyYXBobGliLkdyYXBoKHsgbXVsdGlncmFwaDogdHJ1ZSwgY29tcG91bmQ6IHRydWUgfSkuc2V0R3JhcGgoe1xuICAgICAgICAgIG5vZGVzZXA6IDcwXG4gICAgICAgICAgZWRnZXNlcDogMFxuICAgICAgICAgIHJhbmtzZXA6IDUwXG4gICAgICAgICAgcmFua2RpcjogXCJMUlwiXG4gICAgICAgICAgbWFyZ2lueDogNDBcbiAgICAgICAgICBtYXJnaW55OiA0MFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIG1lcmdlV2F0ZXJtYXJrcyhzY29wZS5wbGFuLCBzY29wZS53YXRlcm1hcmtzKSlcblxuICAgICAgICBkM21haW5TdmdHLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKClcblxuICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJzY2FsZShcIiArIDEgKyBcIilcIilcblxuICAgICAgICByZW5kZXJlciA9IG5ldyBkYWdyZUQzLnJlbmRlcigpXG4gICAgICAgIGQzbWFpblN2Z0cuY2FsbChyZW5kZXJlciwgZylcblxuICAgICAgICBmb3IgaSwgc2cgb2Ygc3ViZ3JhcGhzXG4gICAgICAgICAgZDNtYWluU3ZnLnNlbGVjdCgnc3ZnLnN2Zy0nICsgaSArICcgZycpLmNhbGwocmVuZGVyZXIsIHNnKVxuXG4gICAgICAgIG5ld1NjYWxlID0gMC41XG5cbiAgICAgICAgeENlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkud2lkdGgoKSAtIGcuZ3JhcGgoKS53aWR0aCAqIG5ld1NjYWxlKSAvIDIpXG4gICAgICAgIHlDZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKChhbmd1bGFyLmVsZW1lbnQobWFpblN2Z0VsZW1lbnQpLmhlaWdodCgpIC0gZy5ncmFwaCgpLmhlaWdodCAqIG5ld1NjYWxlKSAvIDIpXG5cbiAgICAgICAgaWYgbGFzdFpvb21TY2FsZSAhPSAwICYmIGxhc3RQb3NpdGlvbiAhPSAwXG4gICAgICAgICAgbWFpblpvb20uc2NhbGUobGFzdFpvb21TY2FsZSkudHJhbnNsYXRlKGxhc3RQb3NpdGlvbilcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBsYXN0UG9zaXRpb24gKyBcIikgc2NhbGUoXCIgKyBsYXN0Wm9vbVNjYWxlICsgXCIpXCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYWluWm9vbS5zY2FsZShuZXdTY2FsZSkudHJhbnNsYXRlKFt4Q2VudGVyT2Zmc2V0LCB5Q2VudGVyT2Zmc2V0XSlcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB4Q2VudGVyT2Zmc2V0ICsgXCIsIFwiICsgeUNlbnRlck9mZnNldCArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIilcblxuICAgICAgICBtYWluWm9vbS5vbihcInpvb21cIiwgLT5cbiAgICAgICAgICBldiA9IGQzLmV2ZW50XG4gICAgICAgICAgbGFzdFpvb21TY2FsZSA9IGV2LnNjYWxlXG4gICAgICAgICAgbGFzdFBvc2l0aW9uID0gZXYudHJhbnNsYXRlXG4gICAgICAgICAgZDNtYWluU3ZnRy5hdHRyIFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbGFzdFBvc2l0aW9uICsgXCIpIHNjYWxlKFwiICsgbGFzdFpvb21TY2FsZSArIFwiKVwiXG4gICAgICAgIClcbiAgICAgICAgbWFpblpvb20oZDNtYWluU3ZnKVxuXG4gICAgICAgIGQzbWFpblN2Z0cuc2VsZWN0QWxsKCcubm9kZScpLm9uICdjbGljaycsIChkKSAtPlxuICAgICAgICAgIHNjb3BlLnNldE5vZGUoeyBub2RlaWQ6IGQgfSlcblxuICAgIHNjb3BlLiR3YXRjaCBhdHRycy5wbGFuLCAobmV3UGxhbikgLT5cbiAgICAgIGRyYXdHcmFwaCgpIGlmIG5ld1BsYW5cblxuICAgIHNjb3BlLiR3YXRjaCBhdHRycy53YXRlcm1hcmtzLCAobmV3V2F0ZXJtYXJrcykgLT5cbiAgICAgIGRyYXdHcmFwaCgpIGlmIG5ld1dhdGVybWFya3MgJiYgc2NvcGUucGxhblxuXG4gICAgcmV0dXJuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdnbG9iYWxPdmVydmlldycsICgkdGltZW91dCwgQnl0ZXNTZXJ2aWNlKSAtPlxuICB0ZW1wbGF0ZTogXCJcbiAgICA8ZGl2IGNsYXNzPSdnbG9iYWwtb3ZlcnZpZXcnPlxuICAgICAgPGRpdiBjbGFzcz0ncm93Jz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdjb2wteHMtNSc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdyb3cnPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdjb2wteHMtMTInPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J21ldGEgdGl0bGUnPkluZ3Jlc3MgVGhyb3VnaHB1dDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0ncm93Jz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nY29sLXhzLTYnPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2RhdGEnPnt7aW5jb21pbmdbMF19fTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J21ldGEgdW5pdCc+e3tpbmNvbWluZ1sxXX19L3M8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2NvbC14cy02Jz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdkYXRhJz57e2luY29taW5nUn19PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWV0YSB1bml0Jz5yZWNvcmRzL3M8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPSdjb2wteHMtNSc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdyb3cnPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdjb2wteHMtMTInPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J21ldGEgdGl0bGUnPkVncmVzcyBUaHJvdWdocHV0PC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPSdyb3cnPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdjb2wteHMtNic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nZGF0YSc+e3tvdXRnb2luZ1swXX19PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWV0YSB1bml0Jz57e291dGdvaW5nWzFdfX0vczwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nY29sLXhzLTYnPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2RhdGEnPnt7b3V0Z29pbmdSfX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZXRhIHVuaXQnPnJlY29yZHMvczwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9J2NvbC14cy0yJz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J21ldGEnPkVuZC10by1lbmQgTGF0ZW5jeTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nZGF0YSc+e3tsYXRlbmN5fX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J21ldGEgdW5pdCc+bXM8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlwiXG5cbiAgc2NvcGU6XG4gICAgZ29kYXRhOiAnPSdcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHNjb3BlLmluY29taW5nID0gWzAsIFwiYlwiXVxuICAgIHNjb3BlLm91dGdvaW5nID0gWzAsIFwiYlwiXVxuICAgIHNjb3BlLmluY29taW5nUiA9IDBcbiAgICBzY29wZS5vdXRnb2luZ1IgPSAwXG4gICAgc2NvcGUubGF0ZW5jeSA9IDBcblxuICAgIHNjb3BlLiR3YXRjaCBhdHRycy5nb2RhdGEsIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YVxuICAgICAgICBzY29wZS5pbmNvbWluZyA9IEJ5dGVzU2VydmljZS5odW1hbml6ZShkYXRhLmluY29taW5nKVxuICAgICAgICBzY29wZS5vdXRnb2luZyA9IEJ5dGVzU2VydmljZS5odW1hbml6ZShkYXRhLm91dGdvaW5nKVxuICAgICAgICBzY29wZS5pbmNvbWluZ1IgPSBkYXRhLmluY29taW5nUlxuICAgICAgICBzY29wZS5vdXRnb2luZ1IgPSBkYXRhLm91dGdvaW5nUlxuICAgICAgICBzY29wZS5sYXRlbmN5ID0gZGF0YS5sYXRlbmN5XG5cbiAgICByZXR1cm5cbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmRpcmVjdGl2ZSgndmVydGV4JywgZnVuY3Rpb24oJHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6IFwiPHN2ZyBjbGFzcz0ndGltZWxpbmUgc2Vjb25kYXJ5JyB3aWR0aD0nMCcgaGVpZ2h0PScwJz48L3N2Zz5cIixcbiAgICBzY29wZToge1xuICAgICAgZGF0YTogXCI9XCJcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xuICAgICAgdmFyIGFuYWx5emVUaW1lLCBjb250YWluZXJXLCBzdmdFbDtcbiAgICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdO1xuICAgICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChzdmdFbCkuYXR0cignd2lkdGgnLCBjb250YWluZXJXKTtcbiAgICAgIGFuYWx5emVUaW1lID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgY2hhcnQsIHN2ZywgdGVzdERhdGE7XG4gICAgICAgIGQzLnNlbGVjdChzdmdFbCkuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgICAgICAgdGVzdERhdGEgPSBbXTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEuc3VidGFza3MsIGZ1bmN0aW9uKHN1YnRhc2ssIGkpIHtcbiAgICAgICAgICB2YXIgdGltZXM7XG4gICAgICAgICAgdGltZXMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIlNjaGVkdWxlZFwiLFxuICAgICAgICAgICAgICBjb2xvcjogXCIjNjY2XCIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIixcbiAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiU0NIRURVTEVEXCJdLFxuICAgICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdLFxuICAgICAgICAgICAgICB0eXBlOiAncmVndWxhcidcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiRGVwbG95aW5nXCIsXG4gICAgICAgICAgICAgIGNvbG9yOiBcIiNhYWFcIixcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiLFxuICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJERVBMT1lJTkdcIl0sXG4gICAgICAgICAgICAgIGVuZGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJSVU5OSU5HXCJdLFxuICAgICAgICAgICAgICB0eXBlOiAncmVndWxhcidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdO1xuICAgICAgICAgIGlmIChzdWJ0YXNrLnRpbWVzdGFtcHNbXCJGSU5JU0hFRFwiXSA+IDApIHtcbiAgICAgICAgICAgIHRpbWVzLnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogXCJSdW5uaW5nXCIsXG4gICAgICAgICAgICAgIGNvbG9yOiBcIiNkZGRcIixcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiLFxuICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJSVU5OSU5HXCJdLFxuICAgICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0sXG4gICAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0ZXN0RGF0YS5wdXNoKHtcbiAgICAgICAgICAgIGxhYmVsOiBcIihcIiArIHN1YnRhc2suc3VidGFzayArIFwiKSBcIiArIHN1YnRhc2suaG9zdCxcbiAgICAgICAgICAgIHRpbWVzOiB0aW1lc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY2hhcnQgPSBkMy50aW1lbGluZSgpLnN0YWNrKCkudGlja0Zvcm1hdCh7XG4gICAgICAgICAgZm9ybWF0OiBkMy50aW1lLmZvcm1hdChcIiVMXCIpLFxuICAgICAgICAgIHRpY2tTaXplOiAxXG4gICAgICAgIH0pLnByZWZpeChcInNpbmdsZVwiKS5sYWJlbEZvcm1hdChmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICAgIHJldHVybiBsYWJlbDtcbiAgICAgICAgfSkubWFyZ2luKHtcbiAgICAgICAgICBsZWZ0OiAxMDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGJvdHRvbTogMFxuICAgICAgICB9KS5pdGVtSGVpZ2h0KDMwKS5yZWxhdGl2ZVRpbWUoKTtcbiAgICAgICAgcmV0dXJuIHN2ZyA9IGQzLnNlbGVjdChzdmdFbCkuZGF0dW0odGVzdERhdGEpLmNhbGwoY2hhcnQpO1xuICAgICAgfTtcbiAgICAgIGFuYWx5emVUaW1lKHNjb3BlLmRhdGEpO1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgndGltZWxpbmUnLCBmdW5jdGlvbigkc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIHZlcnRpY2VzOiBcIj1cIixcbiAgICAgIGpvYmlkOiBcIj1cIlxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzKSB7XG4gICAgICB2YXIgYW5hbHl6ZVRpbWUsIGNvbnRhaW5lclcsIHN2Z0VsLCB0cmFuc2xhdGVMYWJlbDtcbiAgICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdO1xuICAgICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChzdmdFbCkuYXR0cignd2lkdGgnLCBjb250YWluZXJXKTtcbiAgICAgIHRyYW5zbGF0ZUxhYmVsID0gZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIGxhYmVsLnJlcGxhY2UoXCImZ3Q7XCIsIFwiPlwiKTtcbiAgICAgIH07XG4gICAgICBhbmFseXplVGltZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGNoYXJ0LCBzdmcsIHRlc3REYXRhO1xuICAgICAgICBkMy5zZWxlY3Qoc3ZnRWwpLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XG4gICAgICAgIHRlc3REYXRhID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgICAgICBpZiAodmVydGV4WydzdGFydC10aW1lJ10gPiAtMSkge1xuICAgICAgICAgICAgaWYgKHZlcnRleC50eXBlID09PSAnc2NoZWR1bGVkJykge1xuICAgICAgICAgICAgICByZXR1cm4gdGVzdERhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgdGltZXM6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZUxhYmVsKHZlcnRleC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwiI2NjY2NjY1wiLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1NTU1XCIsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHZlcnRleFsnc3RhcnQtdGltZSddLFxuICAgICAgICAgICAgICAgICAgICBlbmRpbmdfdGltZTogdmVydGV4WydlbmQtdGltZSddLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB2ZXJ0ZXgudHlwZVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gdGVzdERhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgdGltZXM6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRyYW5zbGF0ZUxhYmVsKHZlcnRleC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwiI2Q5ZjFmN1wiLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNjJjZGVhXCIsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHZlcnRleFsnc3RhcnQtdGltZSddLFxuICAgICAgICAgICAgICAgICAgICBlbmRpbmdfdGltZTogdmVydGV4WydlbmQtdGltZSddLFxuICAgICAgICAgICAgICAgICAgICBsaW5rOiB2ZXJ0ZXguaWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHZlcnRleC50eXBlXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjaGFydCA9IGQzLnRpbWVsaW5lKCkuc3RhY2soKS5jbGljayhmdW5jdGlvbihkLCBpLCBkYXR1bSkge1xuICAgICAgICAgIGlmIChkLmxpbmspIHtcbiAgICAgICAgICAgIHJldHVybiAkc3RhdGUuZ28oXCJzaW5nbGUtam9iLnRpbWVsaW5lLnZlcnRleFwiLCB7XG4gICAgICAgICAgICAgIGpvYmlkOiBzY29wZS5qb2JpZCxcbiAgICAgICAgICAgICAgdmVydGV4SWQ6IGQubGlua1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS50aWNrRm9ybWF0KHtcbiAgICAgICAgICBmb3JtYXQ6IGQzLnRpbWUuZm9ybWF0KFwiJUxcIiksXG4gICAgICAgICAgdGlja1NpemU6IDFcbiAgICAgICAgfSkucHJlZml4KFwibWFpblwiKS5tYXJnaW4oe1xuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGJvdHRvbTogMFxuICAgICAgICB9KS5pdGVtSGVpZ2h0KDMwKS5zaG93Qm9yZGVyTGluZSgpLnNob3dIb3VyVGltZWxpbmUoKTtcbiAgICAgICAgcmV0dXJuIHN2ZyA9IGQzLnNlbGVjdChzdmdFbCkuZGF0dW0odGVzdERhdGEpLmNhbGwoY2hhcnQpO1xuICAgICAgfTtcbiAgICAgIHNjb3BlLiR3YXRjaChhdHRycy52ZXJ0aWNlcywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIHJldHVybiBhbmFseXplVGltZShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSkuZGlyZWN0aXZlKCdzcGxpdCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtLCB0QXR0cnMpIHtcbiAgICAgIHJldHVybiBTcGxpdCh0RWxlbS5jaGlsZHJlbigpLCB7XG4gICAgICAgIHNpemVzOiBbNTAsIDUwXSxcbiAgICAgICAgZGlyZWN0aW9uOiAndmVydGljYWwnXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ2pvYlBsYW4nLCBmdW5jdGlvbigkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBcIjxzdmcgY2xhc3M9J2dyYXBoJz48ZyAvPjwvc3ZnPiA8c3ZnIGNsYXNzPSd0bXAnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxnIC8+PC9zdmc+IDxkaXYgY2xhc3M9J2J0bi1ncm91cCB6b29tLWJ1dHRvbnMnPiA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20taW4nIG5nLWNsaWNrPSd6b29tSW4oKSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMnIC8+PC9hPiA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20tb3V0JyBuZy1jbGljaz0nem9vbU91dCgpJz48aSBjbGFzcz0nZmEgZmEtbWludXMnIC8+PC9hPiA8L2Rpdj5cIixcbiAgICBzY29wZToge1xuICAgICAgcGxhbjogJz0nLFxuICAgICAgd2F0ZXJtYXJrczogJz0nLFxuICAgICAgc2V0Tm9kZTogJyYnXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBjb250YWluZXJXLCBjcmVhdGVFZGdlLCBjcmVhdGVMYWJlbEVkZ2UsIGNyZWF0ZUxhYmVsTm9kZSwgY3JlYXRlTm9kZSwgZDNtYWluU3ZnLCBkM21haW5TdmdHLCBkM3RtcFN2ZywgZHJhd0dyYXBoLCBleHRlbmRMYWJlbE5vZGVGb3JJdGVyYXRpb24sIGcsIGdldE5vZGVUeXBlLCBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlLCBqb2JpZCwgbGFzdFBvc2l0aW9uLCBsYXN0Wm9vbVNjYWxlLCBsb2FkSnNvblRvRGFncmUsIG1haW5HLCBtYWluU3ZnRWxlbWVudCwgbWFpblRtcEVsZW1lbnQsIG1haW5ab29tLCBtZXJnZVdhdGVybWFya3MsIHNlYXJjaEZvck5vZGUsIHNob3J0ZW5TdHJpbmcsIHN1YmdyYXBocztcbiAgICAgIGcgPSBudWxsO1xuICAgICAgbWFpblpvb20gPSBkMy5iZWhhdmlvci56b29tKCk7XG4gICAgICBzdWJncmFwaHMgPSBbXTtcbiAgICAgIGpvYmlkID0gYXR0cnMuam9iaWQ7XG4gICAgICBtYWluU3ZnRWxlbWVudCA9IGVsZW0uY2hpbGRyZW4oKVswXTtcbiAgICAgIG1haW5HID0gZWxlbS5jaGlsZHJlbigpLmNoaWxkcmVuKClbMF07XG4gICAgICBtYWluVG1wRWxlbWVudCA9IGVsZW0uY2hpbGRyZW4oKVsxXTtcbiAgICAgIGQzbWFpblN2ZyA9IGQzLnNlbGVjdChtYWluU3ZnRWxlbWVudCk7XG4gICAgICBkM21haW5TdmdHID0gZDMuc2VsZWN0KG1haW5HKTtcbiAgICAgIGQzdG1wU3ZnID0gZDMuc2VsZWN0KG1haW5UbXBFbGVtZW50KTtcbiAgICAgIGNvbnRhaW5lclcgPSBlbGVtLndpZHRoKCk7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbS5jaGlsZHJlbigpWzBdKS53aWR0aChjb250YWluZXJXKTtcbiAgICAgIGxhc3Rab29tU2NhbGUgPSAwO1xuICAgICAgbGFzdFBvc2l0aW9uID0gMDtcbiAgICAgIHNjb3BlLnpvb21JbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdHJhbnNsYXRlLCB2MSwgdjI7XG4gICAgICAgIGlmIChtYWluWm9vbS5zY2FsZSgpIDwgMi45OSkge1xuICAgICAgICAgIHRyYW5zbGF0ZSA9IG1haW5ab29tLnRyYW5zbGF0ZSgpO1xuICAgICAgICAgIHYxID0gdHJhbnNsYXRlWzBdICogKG1haW5ab29tLnNjYWxlKCkgKyAwLjEgLyAobWFpblpvb20uc2NhbGUoKSkpO1xuICAgICAgICAgIHYyID0gdHJhbnNsYXRlWzFdICogKG1haW5ab29tLnNjYWxlKCkgKyAwLjEgLyAobWFpblpvb20uc2NhbGUoKSkpO1xuICAgICAgICAgIG1haW5ab29tLnNjYWxlKG1haW5ab29tLnNjYWxlKCkgKyAwLjEpO1xuICAgICAgICAgIG1haW5ab29tLnRyYW5zbGF0ZShbdjEsIHYyXSk7XG4gICAgICAgICAgZDNtYWluU3ZnRy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiKTtcbiAgICAgICAgICBsYXN0Wm9vbVNjYWxlID0gbWFpblpvb20uc2NhbGUoKTtcbiAgICAgICAgICByZXR1cm4gbGFzdFBvc2l0aW9uID0gbWFpblpvb20udHJhbnNsYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS56b29tT3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0cmFuc2xhdGUsIHYxLCB2MjtcbiAgICAgICAgaWYgKG1haW5ab29tLnNjYWxlKCkgPiAwLjMxKSB7XG4gICAgICAgICAgbWFpblpvb20uc2NhbGUobWFpblpvb20uc2NhbGUoKSAtIDAuMSk7XG4gICAgICAgICAgdHJhbnNsYXRlID0gbWFpblpvb20udHJhbnNsYXRlKCk7XG4gICAgICAgICAgdjEgPSB0cmFuc2xhdGVbMF0gKiAobWFpblpvb20uc2NhbGUoKSAtIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgdjIgPSB0cmFuc2xhdGVbMV0gKiAobWFpblpvb20uc2NhbGUoKSAtIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgbWFpblpvb20udHJhbnNsYXRlKFt2MSwgdjJdKTtcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB2MSArIFwiLFwiICsgdjIgKyBcIikgc2NhbGUoXCIgKyBtYWluWm9vbS5zY2FsZSgpICsgXCIpXCIpO1xuICAgICAgICAgIGxhc3Rab29tU2NhbGUgPSBtYWluWm9vbS5zY2FsZSgpO1xuICAgICAgICAgIHJldHVybiBsYXN0UG9zaXRpb24gPSBtYWluWm9vbS50cmFuc2xhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNyZWF0ZUxhYmVsRWRnZSA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlO1xuICAgICAgICBsYWJlbFZhbHVlID0gXCJcIjtcbiAgICAgICAgaWYgKChlbC5zaGlwX3N0cmF0ZWd5ICE9IG51bGwpIHx8IChlbC5sb2NhbF9zdHJhdGVneSAhPSBudWxsKSkge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8ZGl2IGNsYXNzPSdlZGdlLWxhYmVsJz5cIjtcbiAgICAgICAgICBpZiAoZWwuc2hpcF9zdHJhdGVneSAhPSBudWxsKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IGVsLnNoaXBfc3RyYXRlZ3k7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbC50ZW1wX21vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiAoXCIgKyBlbC50ZW1wX21vZGUgKyBcIilcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLmxvY2FsX3N0cmF0ZWd5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCIsPGJyPlwiICsgZWwubG9jYWxfc3RyYXRlZ3k7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8L2Rpdj5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGFiZWxWYWx1ZTtcbiAgICAgIH07XG4gICAgICBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlID0gZnVuY3Rpb24oaW5mbykge1xuICAgICAgICByZXR1cm4gaW5mbyA9PT0gXCJwYXJ0aWFsU29sdXRpb25cIiB8fCBpbmZvID09PSBcIm5leHRQYXJ0aWFsU29sdXRpb25cIiB8fCBpbmZvID09PSBcIndvcmtzZXRcIiB8fCBpbmZvID09PSBcIm5leHRXb3Jrc2V0XCIgfHwgaW5mbyA9PT0gXCJzb2x1dGlvblNldFwiIHx8IGluZm8gPT09IFwic29sdXRpb25EZWx0YVwiO1xuICAgICAgfTtcbiAgICAgIGdldE5vZGVUeXBlID0gZnVuY3Rpb24oZWwsIGluZm8pIHtcbiAgICAgICAgaWYgKGluZm8gPT09IFwibWlycm9yXCIpIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtbWlycm9yJztcbiAgICAgICAgfSBlbHNlIGlmIChpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pKSB7XG4gICAgICAgICAgcmV0dXJuICdub2RlLWl0ZXJhdGlvbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICdub2RlLW5vcm1hbCc7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjcmVhdGVMYWJlbE5vZGUgPSBmdW5jdGlvbihlbCwgaW5mbywgbWF4VywgbWF4SCkge1xuICAgICAgICB2YXIgbGFiZWxWYWx1ZSwgc3RlcE5hbWU7XG4gICAgICAgIGxhYmVsVmFsdWUgPSBcIjxkaXYgaHJlZj0nIy9qb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0ZXgvXCIgKyBlbC5pZCArIFwiJyBjbGFzcz0nbm9kZS1sYWJlbCBcIiArIGdldE5vZGVUeXBlKGVsLCBpbmZvKSArIFwiJz5cIjtcbiAgICAgICAgaWYgKGluZm8gPT09IFwibWlycm9yXCIpIHtcbiAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGgzIGNsYXNzPSdub2RlLW5hbWUnPk1pcnJvciBvZiBcIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+XCIgKyBlbC5vcGVyYXRvciArIFwiPC9oMz5cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWwuZGVzY3JpcHRpb24gPT09IFwiXCIpIHtcbiAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RlcE5hbWUgPSBlbC5kZXNjcmlwdGlvbjtcbiAgICAgICAgICBzdGVwTmFtZSA9IHNob3J0ZW5TdHJpbmcoc3RlcE5hbWUpO1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDQgY2xhc3M9J3N0ZXAtbmFtZSc+XCIgKyBzdGVwTmFtZSArIFwiPC9oND5cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWwuc3RlcF9mdW5jdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBleHRlbmRMYWJlbE5vZGVGb3JJdGVyYXRpb24oZWwuaWQsIG1heFcsIG1heEgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1PlwiICsgaW5mbyArIFwiIE5vZGU8L2g1PlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWwucGFyYWxsZWxpc20gIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+UGFyYWxsZWxpc206IFwiICsgZWwucGFyYWxsZWxpc20gKyBcIjwvaDU+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbC5sb3dXYXRlcm1hcmsgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5Mb3cgV2F0ZXJtYXJrOiBcIiArIGVsLmxvd1dhdGVybWFyayArIFwiPC9oNT5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEoZWwub3BlcmF0b3IgPT09IHVuZGVmaW5lZCB8fCAhZWwub3BlcmF0b3Jfc3RyYXRlZ3kpKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1Pk9wZXJhdGlvbjogXCIgKyBzaG9ydGVuU3RyaW5nKGVsLm9wZXJhdG9yX3N0cmF0ZWd5KSArIFwiPC9oNT5cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjwvZGl2PlwiO1xuICAgICAgICByZXR1cm4gbGFiZWxWYWx1ZTtcbiAgICAgIH07XG4gICAgICBleHRlbmRMYWJlbE5vZGVGb3JJdGVyYXRpb24gPSBmdW5jdGlvbihpZCwgbWF4VywgbWF4SCkge1xuICAgICAgICB2YXIgbGFiZWxWYWx1ZSwgc3ZnSUQ7XG4gICAgICAgIHN2Z0lEID0gXCJzdmctXCIgKyBpZDtcbiAgICAgICAgbGFiZWxWYWx1ZSA9IFwiPHN2ZyBjbGFzcz0nXCIgKyBzdmdJRCArIFwiJyB3aWR0aD1cIiArIG1heFcgKyBcIiBoZWlnaHQ9XCIgKyBtYXhIICsgXCI+PGcgLz48L3N2Zz5cIjtcbiAgICAgICAgcmV0dXJuIGxhYmVsVmFsdWU7XG4gICAgICB9O1xuICAgICAgc2hvcnRlblN0cmluZyA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgdmFyIHNicjtcbiAgICAgICAgaWYgKHMuY2hhckF0KDApID09PSBcIjxcIikge1xuICAgICAgICAgIHMgPSBzLnJlcGxhY2UoXCI8XCIsIFwiJmx0O1wiKTtcbiAgICAgICAgICBzID0gcy5yZXBsYWNlKFwiPlwiLCBcIiZndDtcIik7XG4gICAgICAgIH1cbiAgICAgICAgc2JyID0gXCJcIjtcbiAgICAgICAgd2hpbGUgKHMubGVuZ3RoID4gMzApIHtcbiAgICAgICAgICBzYnIgPSBzYnIgKyBzLnN1YnN0cmluZygwLCAzMCkgKyBcIjxicj5cIjtcbiAgICAgICAgICBzID0gcy5zdWJzdHJpbmcoMzAsIHMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBzYnIgPSBzYnIgKyBzO1xuICAgICAgICByZXR1cm4gc2JyO1xuICAgICAgfTtcbiAgICAgIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbihnLCBkYXRhLCBlbCwgaXNQYXJlbnQsIG1heFcsIG1heEgpIHtcbiAgICAgICAgaWYgKGlzUGFyZW50ID09IG51bGwpIHtcbiAgICAgICAgICBpc1BhcmVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5pZCA9PT0gZGF0YS5wYXJ0aWFsX3NvbHV0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGcuc2V0Tm9kZShlbC5pZCwge1xuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwicGFydGlhbFNvbHV0aW9uXCIpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuaWQgPT09IGRhdGEubmV4dF9wYXJ0aWFsX3NvbHV0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGcuc2V0Tm9kZShlbC5pZCwge1xuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJuZXh0UGFydGlhbFNvbHV0aW9uXCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcIm5leHRQYXJ0aWFsU29sdXRpb25cIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS53b3Jrc2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGcuc2V0Tm9kZShlbC5pZCwge1xuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJ3b3Jrc2V0XCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcIndvcmtzZXRcIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5uZXh0X3dvcmtzZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIm5leHRXb3Jrc2V0XCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcIm5leHRXb3Jrc2V0XCIpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuaWQgPT09IGRhdGEuc29sdXRpb25fc2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGcuc2V0Tm9kZShlbC5pZCwge1xuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJzb2x1dGlvblNldFwiLCBtYXhXLCBtYXhIKSxcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgXCJjbGFzc1wiOiBnZXROb2RlVHlwZShlbCwgXCJzb2x1dGlvblNldFwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLnNvbHV0aW9uX2RlbHRhKSB7XG4gICAgICAgICAgcmV0dXJuIGcuc2V0Tm9kZShlbC5pZCwge1xuICAgICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJzb2x1dGlvbkRlbHRhXCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uRGVsdGFcIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIlwiLCBtYXhXLCBtYXhIKSxcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgXCJjbGFzc1wiOiBnZXROb2RlVHlwZShlbCwgXCJcIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNyZWF0ZUVkZ2UgPSBmdW5jdGlvbihnLCBkYXRhLCBlbCwgZXhpc3RpbmdOb2RlcywgcHJlZCkge1xuICAgICAgICByZXR1cm4gZy5zZXRFZGdlKHByZWQuaWQsIGVsLmlkLCB7XG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsRWRnZShwcmVkKSxcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGxvYWRKc29uVG9EYWdyZSA9IGZ1bmN0aW9uKGcsIGRhdGEpIHtcbiAgICAgICAgdmFyIGVsLCBleGlzdGluZ05vZGVzLCBpc1BhcmVudCwgaywgbCwgbGVuLCBsZW4xLCBtYXhILCBtYXhXLCBwcmVkLCByLCByZWYsIHNnLCB0b0l0ZXJhdGU7XG4gICAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXTtcbiAgICAgICAgaWYgKGRhdGEubm9kZXMgIT0gbnVsbCkge1xuICAgICAgICAgIHRvSXRlcmF0ZSA9IGRhdGEubm9kZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5zdGVwX2Z1bmN0aW9uO1xuICAgICAgICAgIGlzUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSB0b0l0ZXJhdGUubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICBlbCA9IHRvSXRlcmF0ZVtrXTtcbiAgICAgICAgICBtYXhXID0gMDtcbiAgICAgICAgICBtYXhIID0gMDtcbiAgICAgICAgICBpZiAoZWwuc3RlcF9mdW5jdGlvbikge1xuICAgICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7XG4gICAgICAgICAgICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgICAgICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICAgICAgICB9KS5zZXRHcmFwaCh7XG4gICAgICAgICAgICAgIG5vZGVzZXA6IDIwLFxuICAgICAgICAgICAgICBlZGdlc2VwOiAwLFxuICAgICAgICAgICAgICByYW5rc2VwOiAyMCxcbiAgICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiLFxuICAgICAgICAgICAgICBtYXJnaW54OiAxMCxcbiAgICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3ViZ3JhcGhzW2VsLmlkXSA9IHNnO1xuICAgICAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKHNnLCBlbCk7XG4gICAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKCk7XG4gICAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKTtcbiAgICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoO1xuICAgICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0O1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KG1haW5UbXBFbGVtZW50KS5lbXB0eSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SCk7XG4gICAgICAgICAgZXhpc3RpbmdOb2Rlcy5wdXNoKGVsLmlkKTtcbiAgICAgICAgICBpZiAoZWwuaW5wdXRzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlZiA9IGVsLmlucHV0cztcbiAgICAgICAgICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBsIDwgbGVuMTsgbCsrKSB7XG4gICAgICAgICAgICAgIHByZWQgPSByZWZbbF07XG4gICAgICAgICAgICAgIGNyZWF0ZUVkZ2UoZywgZGF0YSwgZWwsIGV4aXN0aW5nTm9kZXMsIHByZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZztcbiAgICAgIH07XG4gICAgICBzZWFyY2hGb3JOb2RlID0gZnVuY3Rpb24oZGF0YSwgbm9kZUlEKSB7XG4gICAgICAgIHZhciBlbCwgaSwgajtcbiAgICAgICAgZm9yIChpIGluIGRhdGEubm9kZXMpIHtcbiAgICAgICAgICBlbCA9IGRhdGEubm9kZXNbaV07XG4gICAgICAgICAgaWYgKGVsLmlkID09PSBub2RlSUQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLnN0ZXBfZnVuY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yIChqIGluIGVsLnN0ZXBfZnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgaWYgKGVsLnN0ZXBfZnVuY3Rpb25bal0uaWQgPT09IG5vZGVJRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5zdGVwX2Z1bmN0aW9uW2pdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgbWVyZ2VXYXRlcm1hcmtzID0gZnVuY3Rpb24oZGF0YSwgd2F0ZXJtYXJrcykge1xuICAgICAgICB2YXIgaywgbGVuLCBub2RlLCByZWY7XG4gICAgICAgIGlmICghXy5pc0VtcHR5KHdhdGVybWFya3MpKSB7XG4gICAgICAgICAgcmVmID0gZGF0YS5ub2RlcztcbiAgICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSByZWZba107XG4gICAgICAgICAgICBpZiAod2F0ZXJtYXJrc1tub2RlLmlkXSAmJiAhaXNOYU4od2F0ZXJtYXJrc1tub2RlLmlkXVtcImxvd1dhdGVybWFya1wiXSkpIHtcbiAgICAgICAgICAgICAgbm9kZS5sb3dXYXRlcm1hcmsgPSB3YXRlcm1hcmtzW25vZGUuaWRdW1wibG93V2F0ZXJtYXJrXCJdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH07XG4gICAgICBsYXN0UG9zaXRpb24gPSAwO1xuICAgICAgbGFzdFpvb21TY2FsZSA9IDA7XG4gICAgICBkcmF3R3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGksIG5ld1NjYWxlLCByZW5kZXJlciwgc2csIHhDZW50ZXJPZmZzZXQsIHlDZW50ZXJPZmZzZXQ7XG4gICAgICAgIGlmIChzY29wZS5wbGFuKSB7XG4gICAgICAgICAgZyA9IG5ldyBkYWdyZUQzLmdyYXBobGliLkdyYXBoKHtcbiAgICAgICAgICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgICAgICAgICBjb21wb3VuZDogdHJ1ZVxuICAgICAgICAgIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICAgIG5vZGVzZXA6IDcwLFxuICAgICAgICAgICAgZWRnZXNlcDogMCxcbiAgICAgICAgICAgIHJhbmtzZXA6IDUwLFxuICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiLFxuICAgICAgICAgICAgbWFyZ2lueDogNDAsXG4gICAgICAgICAgICBtYXJnaW55OiA0MFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxvYWRKc29uVG9EYWdyZShnLCBtZXJnZVdhdGVybWFya3Moc2NvcGUucGxhbiwgc2NvcGUud2F0ZXJtYXJrcykpO1xuICAgICAgICAgIGQzbWFpblN2Z0cuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJzY2FsZShcIiArIDEgKyBcIilcIik7XG4gICAgICAgICAgcmVuZGVyZXIgPSBuZXcgZGFncmVEMy5yZW5kZXIoKTtcbiAgICAgICAgICBkM21haW5TdmdHLmNhbGwocmVuZGVyZXIsIGcpO1xuICAgICAgICAgIGZvciAoaSBpbiBzdWJncmFwaHMpIHtcbiAgICAgICAgICAgIHNnID0gc3ViZ3JhcGhzW2ldO1xuICAgICAgICAgICAgZDNtYWluU3ZnLnNlbGVjdCgnc3ZnLnN2Zy0nICsgaSArICcgZycpLmNhbGwocmVuZGVyZXIsIHNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3U2NhbGUgPSAwLjU7XG4gICAgICAgICAgeENlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkud2lkdGgoKSAtIGcuZ3JhcGgoKS53aWR0aCAqIG5ld1NjYWxlKSAvIDIpO1xuICAgICAgICAgIHlDZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKChhbmd1bGFyLmVsZW1lbnQobWFpblN2Z0VsZW1lbnQpLmhlaWdodCgpIC0gZy5ncmFwaCgpLmhlaWdodCAqIG5ld1NjYWxlKSAvIDIpO1xuICAgICAgICAgIGlmIChsYXN0Wm9vbVNjYWxlICE9PSAwICYmIGxhc3RQb3NpdGlvbiAhPT0gMCkge1xuICAgICAgICAgICAgbWFpblpvb20uc2NhbGUobGFzdFpvb21TY2FsZSkudHJhbnNsYXRlKGxhc3RQb3NpdGlvbik7XG4gICAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBsYXN0UG9zaXRpb24gKyBcIikgc2NhbGUoXCIgKyBsYXN0Wm9vbVNjYWxlICsgXCIpXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYWluWm9vbS5zY2FsZShuZXdTY2FsZSkudHJhbnNsYXRlKFt4Q2VudGVyT2Zmc2V0LCB5Q2VudGVyT2Zmc2V0XSk7XG4gICAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB4Q2VudGVyT2Zmc2V0ICsgXCIsIFwiICsgeUNlbnRlck9mZnNldCArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1haW5ab29tLm9uKFwiem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBldjtcbiAgICAgICAgICAgIGV2ID0gZDMuZXZlbnQ7XG4gICAgICAgICAgICBsYXN0Wm9vbVNjYWxlID0gZXYuc2NhbGU7XG4gICAgICAgICAgICBsYXN0UG9zaXRpb24gPSBldi50cmFuc2xhdGU7XG4gICAgICAgICAgICByZXR1cm4gZDNtYWluU3ZnRy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbGFzdFBvc2l0aW9uICsgXCIpIHNjYWxlKFwiICsgbGFzdFpvb21TY2FsZSArIFwiKVwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBtYWluWm9vbShkM21haW5TdmcpO1xuICAgICAgICAgIHJldHVybiBkM21haW5TdmdHLnNlbGVjdEFsbCgnLm5vZGUnKS5vbignY2xpY2snLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2V0Tm9kZSh7XG4gICAgICAgICAgICAgIG5vZGVpZDogZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS4kd2F0Y2goYXR0cnMucGxhbiwgZnVuY3Rpb24obmV3UGxhbikge1xuICAgICAgICBpZiAobmV3UGxhbikge1xuICAgICAgICAgIHJldHVybiBkcmF3R3JhcGgoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzY29wZS4kd2F0Y2goYXR0cnMud2F0ZXJtYXJrcywgZnVuY3Rpb24obmV3V2F0ZXJtYXJrcykge1xuICAgICAgICBpZiAobmV3V2F0ZXJtYXJrcyAmJiBzY29wZS5wbGFuKSB7XG4gICAgICAgICAgcmV0dXJuIGRyYXdHcmFwaCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ2dsb2JhbE92ZXJ2aWV3JywgZnVuY3Rpb24oJHRpbWVvdXQsIEJ5dGVzU2VydmljZSkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9J2dsb2JhbC1vdmVydmlldyc+IDxkaXYgY2xhc3M9J3Jvdyc+IDxkaXYgY2xhc3M9J2NvbC14cy01Jz4gPGRpdiBjbGFzcz0ncm93Jz4gPGRpdiBjbGFzcz0nY29sLXhzLTEyJz4gPGRpdiBjbGFzcz0nbWV0YSB0aXRsZSc+SW5ncmVzcyBUaHJvdWdocHV0PC9kaXY+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz0ncm93Jz4gPGRpdiBjbGFzcz0nY29sLXhzLTYnPiA8ZGl2IGNsYXNzPSdkYXRhJz57e2luY29taW5nWzBdfX08L2Rpdj4gPGRpdiBjbGFzcz0nbWV0YSB1bml0Jz57e2luY29taW5nWzFdfX0vczwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz0nY29sLXhzLTYnPiA8ZGl2IGNsYXNzPSdkYXRhJz57e2luY29taW5nUn19PC9kaXY+IDxkaXYgY2xhc3M9J21ldGEgdW5pdCc+cmVjb3Jkcy9zPC9kaXY+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9J2NvbC14cy01Jz4gPGRpdiBjbGFzcz0ncm93Jz4gPGRpdiBjbGFzcz0nY29sLXhzLTEyJz4gPGRpdiBjbGFzcz0nbWV0YSB0aXRsZSc+RWdyZXNzIFRocm91Z2hwdXQ8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPSdyb3cnPiA8ZGl2IGNsYXNzPSdjb2wteHMtNic+IDxkaXYgY2xhc3M9J2RhdGEnPnt7b3V0Z29pbmdbMF19fTwvZGl2PiA8ZGl2IGNsYXNzPSdtZXRhIHVuaXQnPnt7b3V0Z29pbmdbMV19fS9zPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPSdjb2wteHMtNic+IDxkaXYgY2xhc3M9J2RhdGEnPnt7b3V0Z29pbmdSfX08L2Rpdj4gPGRpdiBjbGFzcz0nbWV0YSB1bml0Jz5yZWNvcmRzL3M8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz0nY29sLXhzLTInPiA8ZGl2IGNsYXNzPSdtZXRhJz5FbmQtdG8tZW5kIExhdGVuY3k8L2Rpdj4gPGRpdiBjbGFzcz0nZGF0YSc+e3tsYXRlbmN5fX08L2Rpdj4gPGRpdiBjbGFzcz0nbWV0YSB1bml0Jz5tczwvZGl2PiA8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiLFxuICAgIHNjb3BlOiB7XG4gICAgICBnb2RhdGE6ICc9J1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzKSB7XG4gICAgICBzY29wZS5pbmNvbWluZyA9IFswLCBcImJcIl07XG4gICAgICBzY29wZS5vdXRnb2luZyA9IFswLCBcImJcIl07XG4gICAgICBzY29wZS5pbmNvbWluZ1IgPSAwO1xuICAgICAgc2NvcGUub3V0Z29pbmdSID0gMDtcbiAgICAgIHNjb3BlLmxhdGVuY3kgPSAwO1xuICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmdvZGF0YSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIHNjb3BlLmluY29taW5nID0gQnl0ZXNTZXJ2aWNlLmh1bWFuaXplKGRhdGEuaW5jb21pbmcpO1xuICAgICAgICAgIHNjb3BlLm91dGdvaW5nID0gQnl0ZXNTZXJ2aWNlLmh1bWFuaXplKGRhdGEub3V0Z29pbmcpO1xuICAgICAgICAgIHNjb3BlLmluY29taW5nUiA9IGRhdGEuaW5jb21pbmdSO1xuICAgICAgICAgIHNjb3BlLm91dGdvaW5nUiA9IGRhdGEub3V0Z29pbmdSO1xuICAgICAgICAgIHJldHVybiBzY29wZS5sYXRlbmN5ID0gZGF0YS5sYXRlbmN5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnSm9ic1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkbG9nLCBhbU1vbWVudCwgJHEsICR0aW1lb3V0KSAtPlxuICBjdXJyZW50Sm9iID0gbnVsbFxuICBjdXJyZW50UGxhbiA9IG51bGxcblxuICBkZWZlcnJlZHMgPSB7fVxuICBqb2JzID0ge1xuICAgIHJ1bm5pbmc6IFtdXG4gICAgZmluaXNoZWQ6IFtdXG4gICAgY2FuY2VsbGVkOiBbXVxuICAgIGZhaWxlZDogW11cbiAgfVxuXG4gIGpvYk9ic2VydmVycyA9IFtdXG5cbiAgbm90aWZ5T2JzZXJ2ZXJzID0gLT5cbiAgICBhbmd1bGFyLmZvckVhY2ggam9iT2JzZXJ2ZXJzLCAoY2FsbGJhY2spIC0+XG4gICAgICBjYWxsYmFjaygpXG5cbiAgQHJlZ2lzdGVyT2JzZXJ2ZXIgPSAoY2FsbGJhY2spIC0+XG4gICAgam9iT2JzZXJ2ZXJzLnB1c2goY2FsbGJhY2spXG5cbiAgQHVuUmVnaXN0ZXJPYnNlcnZlciA9IChjYWxsYmFjaykgLT5cbiAgICBpbmRleCA9IGpvYk9ic2VydmVycy5pbmRleE9mKGNhbGxiYWNrKVxuICAgIGpvYk9ic2VydmVycy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgQHN0YXRlTGlzdCA9IC0+XG4gICAgWyBcbiAgICAgICMgJ0NSRUFURUQnXG4gICAgICAnU0NIRURVTEVEJ1xuICAgICAgJ0RFUExPWUlORydcbiAgICAgICdSVU5OSU5HJ1xuICAgICAgJ0ZJTklTSEVEJ1xuICAgICAgJ0ZBSUxFRCdcbiAgICAgICdDQU5DRUxJTkcnXG4gICAgICAnQ0FOQ0VMRUQnXG4gICAgXVxuXG4gIEB0cmFuc2xhdGVMYWJlbFN0YXRlID0gKHN0YXRlKSAtPlxuICAgIHN3aXRjaCBzdGF0ZS50b0xvd2VyQ2FzZSgpXG4gICAgICB3aGVuICdmaW5pc2hlZCcgdGhlbiAnc3VjY2VzcydcbiAgICAgIHdoZW4gJ2ZhaWxlZCcgdGhlbiAnZGFuZ2VyJ1xuICAgICAgd2hlbiAnc2NoZWR1bGVkJyB0aGVuICdkZWZhdWx0J1xuICAgICAgd2hlbiAnZGVwbG95aW5nJyB0aGVuICdpbmZvJ1xuICAgICAgd2hlbiAncnVubmluZycgdGhlbiAncHJpbWFyeSdcbiAgICAgIHdoZW4gJ2NhbmNlbGluZycgdGhlbiAnd2FybmluZydcbiAgICAgIHdoZW4gJ3BlbmRpbmcnIHRoZW4gJ2luZm8nXG4gICAgICB3aGVuICd0b3RhbCcgdGhlbiAnYmxhY2snXG4gICAgICBlbHNlICdkZWZhdWx0J1xuXG4gIEBzZXRFbmRUaW1lcyA9IChsaXN0KSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBsaXN0LCAoaXRlbSwgam9iS2V5KSAtPlxuICAgICAgdW5sZXNzIGl0ZW1bJ2VuZC10aW1lJ10gPiAtMVxuICAgICAgICBpdGVtWydlbmQtdGltZSddID0gaXRlbVsnc3RhcnQtdGltZSddICsgaXRlbVsnZHVyYXRpb24nXVxuXG4gIEBwcm9jZXNzVmVydGljZXMgPSAoZGF0YSkgLT5cbiAgICBhbmd1bGFyLmZvckVhY2ggZGF0YS52ZXJ0aWNlcywgKHZlcnRleCwgaSkgLT5cbiAgICAgIHZlcnRleC50eXBlID0gJ3JlZ3VsYXInXG5cbiAgICBkYXRhLnZlcnRpY2VzLnVuc2hpZnQoe1xuICAgICAgbmFtZTogJ1NjaGVkdWxlZCdcbiAgICAgICdzdGFydC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ11cbiAgICAgICdlbmQtdGltZSc6IGRhdGEudGltZXN0YW1wc1snQ1JFQVRFRCddICsgMVxuICAgICAgdHlwZTogJ3NjaGVkdWxlZCdcbiAgICB9KVxuXG4gIEBsaXN0Sm9icyA9IC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JvdmVydmlld1wiXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSA9PlxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEsIChsaXN0LCBsaXN0S2V5KSA9PlxuICAgICAgICBzd2l0Y2ggbGlzdEtleVxuICAgICAgICAgIHdoZW4gJ3J1bm5pbmcnIHRoZW4gam9icy5ydW5uaW5nID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnZmluaXNoZWQnIHRoZW4gam9icy5maW5pc2hlZCA9IEBzZXRFbmRUaW1lcyhsaXN0KVxuICAgICAgICAgIHdoZW4gJ2NhbmNlbGxlZCcgdGhlbiBqb2JzLmNhbmNlbGxlZCA9IEBzZXRFbmRUaW1lcyhsaXN0KVxuICAgICAgICAgIHdoZW4gJ2ZhaWxlZCcgdGhlbiBqb2JzLmZhaWxlZCA9IEBzZXRFbmRUaW1lcyhsaXN0KVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYnMpXG4gICAgICBub3RpZnlPYnNlcnZlcnMoKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRKb2JzID0gKHR5cGUpIC0+XG4gICAgam9ic1t0eXBlXVxuXG4gIEBnZXRBbGxKb2JzID0gLT5cbiAgICBqb2JzXG5cbiAgQGxvYWRKb2IgPSAoam9iaWQpIC0+XG4gICAgY3VycmVudEpvYiA9IG51bGxcbiAgICBkZWZlcnJlZHMuam9iID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSA9PlxuICAgICAgQHNldEVuZFRpbWVzKGRhdGEudmVydGljZXMpXG4gICAgICBAcHJvY2Vzc1ZlcnRpY2VzKGRhdGEpXG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL2NvbmZpZ1wiXG4gICAgICAuc3VjY2VzcyAoam9iQ29uZmlnKSAtPlxuICAgICAgICBkYXRhID0gYW5ndWxhci5leHRlbmQoZGF0YSwgam9iQ29uZmlnKVxuXG4gICAgICAgIGN1cnJlbnRKb2IgPSBkYXRhXG5cbiAgICAgICAgZGVmZXJyZWRzLmpvYi5yZXNvbHZlKGN1cnJlbnRKb2IpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2VcblxuICBAZ2V0Tm9kZSA9IChub2RlaWQpIC0+XG4gICAgc2Vla05vZGUgPSAobm9kZWlkLCBkYXRhKSAtPlxuICAgICAgZm9yIG5vZGUgaW4gZGF0YVxuICAgICAgICByZXR1cm4gbm9kZSBpZiBub2RlLmlkIGlzIG5vZGVpZFxuICAgICAgICBzdWIgPSBzZWVrTm9kZShub2RlaWQsIG5vZGUuc3RlcF9mdW5jdGlvbikgaWYgbm9kZS5zdGVwX2Z1bmN0aW9uXG4gICAgICAgIHJldHVybiBzdWIgaWYgc3ViXG5cbiAgICAgIG51bGxcblxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICBmb3VuZE5vZGUgPSBzZWVrTm9kZShub2RlaWQsIGN1cnJlbnRKb2IucGxhbi5ub2RlcylcblxuICAgICAgZm91bmROb2RlLnZlcnRleCA9IEBzZWVrVmVydGV4KG5vZGVpZClcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmb3VuZE5vZGUpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQHNlZWtWZXJ0ZXggPSAobm9kZWlkKSAtPlxuICAgIGZvciB2ZXJ0ZXggaW4gY3VycmVudEpvYi52ZXJ0aWNlc1xuICAgICAgcmV0dXJuIHZlcnRleCBpZiB2ZXJ0ZXguaWQgaXMgbm9kZWlkXG5cbiAgICByZXR1cm4gbnVsbFxuXG4gIEBnZXRWZXJ0ZXggPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3RpbWVzXCJcbiAgICAgIC5zdWNjZXNzIChkYXRhKSA9PlxuICAgICAgICAjIFRPRE86IGNoYW5nZSB0byBzdWJ0YXNrdGltZXNcbiAgICAgICAgdmVydGV4LnN1YnRhc2tzID0gZGF0YS5zdWJ0YXNrc1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodmVydGV4KVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRTdWJ0YXNrcyA9ICh2ZXJ0ZXhpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgIyB2ZXJ0ZXggPSBAc2Vla1ZlcnRleCh2ZXJ0ZXhpZClcblxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZFxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgIHN1YnRhc2tzID0gZGF0YS5zdWJ0YXNrc1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoc3VidGFza3MpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldFRhc2tNYW5hZ2VycyA9ICh2ZXJ0ZXhpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgIyB2ZXJ0ZXggPSBAc2Vla1ZlcnRleCh2ZXJ0ZXhpZClcblxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL3Rhc2ttYW5hZ2Vyc1wiXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgdGFza21hbmFnZXJzID0gZGF0YS50YXNrbWFuYWdlcnNcblxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRhc2ttYW5hZ2VycylcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZ2V0QWNjdW11bGF0b3JzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuICAgICAgY29uc29sZS5sb2coY3VycmVudEpvYi5qaWQpXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvYWNjdW11bGF0b3JzXCJcbiAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICBhY2N1bXVsYXRvcnMgPSBkYXRhWyd1c2VyLWFjY3VtdWxhdG9ycyddXG5cbiAgICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL3N1YnRhc2tzL2FjY3VtdWxhdG9yc1wiXG4gICAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICAgIHN1YnRhc2tBY2N1bXVsYXRvcnMgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsgbWFpbjogYWNjdW11bGF0b3JzLCBzdWJ0YXNrczogc3VidGFza0FjY3VtdWxhdG9ycyB9KVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgQ2hlY2twb2ludCBjb25maWdcbiAgQGdldENoZWNrcG9pbnRDb25maWcgPSAgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvY2hlY2twb2ludHMvY29uZmlnXCJcbiAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobnVsbClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIEdlbmVyYWwgY2hlY2twb2ludCBzdGF0cyBsaWtlIGNvdW50cywgaGlzdG9yeSwgZXRjLlxuICBAZ2V0Q2hlY2twb2ludFN0YXRzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvY2hlY2twb2ludHNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSA9PlxuICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobnVsbClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIERldGFpbGVkIGNoZWNrcG9pbnQgc3RhdHMgZm9yIGEgc2luZ2xlIGNoZWNrcG9pbnRcbiAgQGdldENoZWNrcG9pbnREZXRhaWxzID0gKGNoZWNrcG9pbnRpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvY2hlY2twb2ludHMvZGV0YWlscy9cIiArIGNoZWNrcG9pbnRpZFxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgICMgSWYgbm8gZGF0YSBhdmFpbGFibGUsIHdlIGFyZSBkb25lLlxuICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobnVsbClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIERldGFpbGVkIHN1YnRhc2sgc3RhdHMgZm9yIGEgc2luZ2xlIGNoZWNrcG9pbnRcbiAgQGdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscyA9IChjaGVja3BvaW50aWQsIHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9jaGVja3BvaW50cy9kZXRhaWxzL1wiICsgY2hlY2twb2ludGlkICsgXCIvc3VidGFza3MvXCIgKyB2ZXJ0ZXhpZFxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgICMgSWYgbm8gZGF0YSBhdmFpbGFibGUsIHdlIGFyZSBkb25lLlxuICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobnVsbClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIE9wZXJhdG9yLWxldmVsIGJhY2sgcHJlc3N1cmUgc3RhdHNcbiAgQGdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2JhY2twcmVzc3VyZVwiXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQHRyYW5zbGF0ZUJhY2tQcmVzc3VyZUxhYmVsU3RhdGUgPSAoc3RhdGUpIC0+XG4gICAgc3dpdGNoIHN0YXRlLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoZW4gJ2luLXByb2dyZXNzJyB0aGVuICdkYW5nZXInXG4gICAgICB3aGVuICdvaycgdGhlbiAnc3VjY2VzcydcbiAgICAgIHdoZW4gJ2xvdycgdGhlbiAnd2FybmluZydcbiAgICAgIHdoZW4gJ2hpZ2gnIHRoZW4gJ2RhbmdlcidcbiAgICAgIGVsc2UgJ2RlZmF1bHQnXG5cbiAgQGxvYWRFeGNlcHRpb25zID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9leGNlcHRpb25zXCJcbiAgICAgIC5zdWNjZXNzIChleGNlcHRpb25zKSAtPlxuICAgICAgICBjdXJyZW50Sm9iLmV4Y2VwdGlvbnMgPSBleGNlcHRpb25zXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShleGNlcHRpb25zKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBjYW5jZWxKb2IgPSAoam9iaWQpIC0+XG4gICAgIyB1c2VzIHRoZSBub24gUkVTVC1jb21wbGlhbnQgR0VUIHlhcm4tY2FuY2VsIGhhbmRsZXIgd2hpY2ggaXMgYXZhaWxhYmxlIGluIGFkZGl0aW9uIHRvIHRoZVxuICAgICMgcHJvcGVyIFwiREVMRVRFIGpvYnMvPGpvYmlkPi9cIlxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3lhcm4tY2FuY2VsXCJcblxuICBAc3RvcEpvYiA9IChqb2JpZCkgLT5cbiAgICAjIHVzZXMgdGhlIG5vbiBSRVNULWNvbXBsaWFudCBHRVQgeWFybi1jYW5jZWwgaGFuZGxlciB3aGljaCBpcyBhdmFpbGFibGUgaW4gYWRkaXRpb24gdG8gdGhlXG4gICAgIyBwcm9wZXIgXCJERUxFVEUgam9icy88am9iaWQ+L1wiXG4gICAgJGh0dHAuZ2V0IFwiam9icy9cIiArIGpvYmlkICsgXCIveWFybi1zdG9wXCJcblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdKb2JzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJGxvZywgYW1Nb21lbnQsICRxLCAkdGltZW91dCkge1xuICB2YXIgY3VycmVudEpvYiwgY3VycmVudFBsYW4sIGRlZmVycmVkcywgam9iT2JzZXJ2ZXJzLCBqb2JzLCBub3RpZnlPYnNlcnZlcnM7XG4gIGN1cnJlbnRKb2IgPSBudWxsO1xuICBjdXJyZW50UGxhbiA9IG51bGw7XG4gIGRlZmVycmVkcyA9IHt9O1xuICBqb2JzID0ge1xuICAgIHJ1bm5pbmc6IFtdLFxuICAgIGZpbmlzaGVkOiBbXSxcbiAgICBjYW5jZWxsZWQ6IFtdLFxuICAgIGZhaWxlZDogW11cbiAgfTtcbiAgam9iT2JzZXJ2ZXJzID0gW107XG4gIG5vdGlmeU9ic2VydmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2goam9iT2JzZXJ2ZXJzLCBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH07XG4gIHRoaXMucmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGpvYk9ic2VydmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgfTtcbiAgdGhpcy51blJlZ2lzdGVyT2JzZXJ2ZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IGpvYk9ic2VydmVycy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gam9iT2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH07XG4gIHRoaXMuc3RhdGVMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFsnU0NIRURVTEVEJywgJ0RFUExPWUlORycsICdSVU5OSU5HJywgJ0ZJTklTSEVEJywgJ0ZBSUxFRCcsICdDQU5DRUxJTkcnLCAnQ0FOQ0VMRUQnXTtcbiAgfTtcbiAgdGhpcy50cmFuc2xhdGVMYWJlbFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2ZpbmlzaGVkJzpcbiAgICAgICAgcmV0dXJuICdzdWNjZXNzJztcbiAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgIHJldHVybiAnZGFuZ2VyJztcbiAgICAgIGNhc2UgJ3NjaGVkdWxlZCc6XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCc7XG4gICAgICBjYXNlICdkZXBsb3lpbmcnOlxuICAgICAgICByZXR1cm4gJ2luZm8nO1xuICAgICAgY2FzZSAncnVubmluZyc6XG4gICAgICAgIHJldHVybiAncHJpbWFyeSc7XG4gICAgICBjYXNlICdjYW5jZWxpbmcnOlxuICAgICAgICByZXR1cm4gJ3dhcm5pbmcnO1xuICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgICBjYXNlICd0b3RhbCc6XG4gICAgICAgIHJldHVybiAnYmxhY2snO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0JztcbiAgICB9XG4gIH07XG4gIHRoaXMuc2V0RW5kVGltZXMgPSBmdW5jdGlvbihsaXN0KSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihpdGVtLCBqb2JLZXkpIHtcbiAgICAgIGlmICghKGl0ZW1bJ2VuZC10aW1lJ10gPiAtMSkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1bJ2VuZC10aW1lJ10gPSBpdGVtWydzdGFydC10aW1lJ10gKyBpdGVtWydkdXJhdGlvbiddO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICB0aGlzLnByb2Nlc3NWZXJ0aWNlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBhbmd1bGFyLmZvckVhY2goZGF0YS52ZXJ0aWNlcywgZnVuY3Rpb24odmVydGV4LCBpKSB7XG4gICAgICByZXR1cm4gdmVydGV4LnR5cGUgPSAncmVndWxhcic7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGEudmVydGljZXMudW5zaGlmdCh7XG4gICAgICBuYW1lOiAnU2NoZWR1bGVkJyxcbiAgICAgICdzdGFydC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ10sXG4gICAgICAnZW5kLXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXSArIDEsXG4gICAgICB0eXBlOiAnc2NoZWR1bGVkJ1xuICAgIH0pO1xuICB9O1xuICB0aGlzLmxpc3RKb2JzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JvdmVydmlld1wiKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbihsaXN0LCBsaXN0S2V5KSB7XG4gICAgICAgICAgc3dpdGNoIChsaXN0S2V5KSB7XG4gICAgICAgICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgICAgICAgcmV0dXJuIGpvYnMucnVubmluZyA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgICAgY2FzZSAnZmluaXNoZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5maW5pc2hlZCA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgICAgICAgcmV0dXJuIGpvYnMuY2FuY2VsbGVkID0gX3RoaXMuc2V0RW5kVGltZXMobGlzdCk7XG4gICAgICAgICAgICBjYXNlICdmYWlsZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5mYWlsZWQgPSBfdGhpcy5zZXRFbmRUaW1lcyhsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYnMpO1xuICAgICAgICByZXR1cm4gbm90aWZ5T2JzZXJ2ZXJzKCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRKb2JzID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHJldHVybiBqb2JzW3R5cGVdO1xuICB9O1xuICB0aGlzLmdldEFsbEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gam9icztcbiAgfTtcbiAgdGhpcy5sb2FkSm9iID0gZnVuY3Rpb24oam9iaWQpIHtcbiAgICBjdXJyZW50Sm9iID0gbnVsbDtcbiAgICBkZWZlcnJlZHMuam9iID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgX3RoaXMuc2V0RW5kVGltZXMoZGF0YS52ZXJ0aWNlcyk7XG4gICAgICAgIF90aGlzLnByb2Nlc3NWZXJ0aWNlcyhkYXRhKTtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGpvYkNvbmZpZykge1xuICAgICAgICAgIGRhdGEgPSBhbmd1bGFyLmV4dGVuZChkYXRhLCBqb2JDb25maWcpO1xuICAgICAgICAgIGN1cnJlbnRKb2IgPSBkYXRhO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZHMuam9iLnJlc29sdmUoY3VycmVudEpvYik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkcy5qb2IucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXROb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgdmFyIGRlZmVycmVkLCBzZWVrTm9kZTtcbiAgICBzZWVrTm9kZSA9IGZ1bmN0aW9uKG5vZGVpZCwgZGF0YSkge1xuICAgICAgdmFyIGosIGxlbiwgbm9kZSwgc3ViO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBub2RlID0gZGF0YVtqXTtcbiAgICAgICAgaWYgKG5vZGUuaWQgPT09IG5vZGVpZCkge1xuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnN0ZXBfZnVuY3Rpb24pIHtcbiAgICAgICAgICBzdWIgPSBzZWVrTm9kZShub2RlaWQsIG5vZGUuc3RlcF9mdW5jdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIHJldHVybiBzdWI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGZvdW5kTm9kZTtcbiAgICAgICAgZm91bmROb2RlID0gc2Vla05vZGUobm9kZWlkLCBjdXJyZW50Sm9iLnBsYW4ubm9kZXMpO1xuICAgICAgICBmb3VuZE5vZGUudmVydGV4ID0gX3RoaXMuc2Vla1ZlcnRleChub2RlaWQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShmb3VuZE5vZGUpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuc2Vla1ZlcnRleCA9IGZ1bmN0aW9uKG5vZGVpZCkge1xuICAgIHZhciBqLCBsZW4sIHJlZiwgdmVydGV4O1xuICAgIHJlZiA9IGN1cnJlbnRKb2IudmVydGljZXM7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2ZXJ0ZXggPSByZWZbal07XG4gICAgICBpZiAodmVydGV4LmlkID09PSBub2RlaWQpIHtcbiAgICAgICAgcmV0dXJuIHZlcnRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIHRoaXMuZ2V0VmVydGV4ID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHZlcnRleDtcbiAgICAgICAgdmVydGV4ID0gX3RoaXMuc2Vla1ZlcnRleCh2ZXJ0ZXhpZCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3RpbWVzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZlcnRleC5zdWJ0YXNrcyA9IGRhdGEuc3VidGFza3M7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUodmVydGV4KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRTdWJ0YXNrcyA9IGZ1bmN0aW9uKHZlcnRleGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgc3VidGFza3M7XG4gICAgICAgICAgc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHN1YnRhc2tzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRUYXNrTWFuYWdlcnMgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL3Rhc2ttYW5hZ2Vyc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgdGFza21hbmFnZXJzO1xuICAgICAgICAgIHRhc2ttYW5hZ2VycyA9IGRhdGEudGFza21hbmFnZXJzO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHRhc2ttYW5hZ2Vycyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0QWNjdW11bGF0b3JzID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coY3VycmVudEpvYi5qaWQpO1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2FjY3VtdWxhdG9yc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgYWNjdW11bGF0b3JzO1xuICAgICAgICAgIGFjY3VtdWxhdG9ycyA9IGRhdGFbJ3VzZXItYWNjdW11bGF0b3JzJ107XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9zdWJ0YXNrcy9hY2N1bXVsYXRvcnNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgc3VidGFza0FjY3VtdWxhdG9ycztcbiAgICAgICAgICAgIHN1YnRhc2tBY2N1bXVsYXRvcnMgPSBkYXRhLnN1YnRhc2tzO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgICBtYWluOiBhY2N1bXVsYXRvcnMsXG4gICAgICAgICAgICAgIHN1YnRhc2tzOiBzdWJ0YXNrQWNjdW11bGF0b3JzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRDaGVja3BvaW50Q29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9jaGVja3BvaW50cy9jb25maWdcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHt9LCBkYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUobnVsbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRDaGVja3BvaW50U3RhdHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2NoZWNrcG9pbnRzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldENoZWNrcG9pbnREZXRhaWxzID0gZnVuY3Rpb24oY2hlY2twb2ludGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9jaGVja3BvaW50cy9kZXRhaWxzL1wiICsgY2hlY2twb2ludGlkKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscyA9IGZ1bmN0aW9uKGNoZWNrcG9pbnRpZCwgdmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2NoZWNrcG9pbnRzL2RldGFpbHMvXCIgKyBjaGVja3BvaW50aWQgKyBcIi9zdWJ0YXNrcy9cIiArIHZlcnRleGlkKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9iYWNrcHJlc3N1cmVcIikuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMudHJhbnNsYXRlQmFja1ByZXNzdXJlTGFiZWxTdGF0ZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgc3dpdGNoIChzdGF0ZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICdpbi1wcm9ncmVzcyc6XG4gICAgICAgIHJldHVybiAnZGFuZ2VyJztcbiAgICAgIGNhc2UgJ29rJzpcbiAgICAgICAgcmV0dXJuICdzdWNjZXNzJztcbiAgICAgIGNhc2UgJ2xvdyc6XG4gICAgICAgIHJldHVybiAnd2FybmluZyc7XG4gICAgICBjYXNlICdoaWdoJzpcbiAgICAgICAgcmV0dXJuICdkYW5nZXInO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0JztcbiAgICB9XG4gIH07XG4gIHRoaXMubG9hZEV4Y2VwdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2V4Y2VwdGlvbnNcIikuc3VjY2VzcyhmdW5jdGlvbihleGNlcHRpb25zKSB7XG4gICAgICAgICAgY3VycmVudEpvYi5leGNlcHRpb25zID0gZXhjZXB0aW9ucztcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShleGNlcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5jYW5jZWxKb2IgPSBmdW5jdGlvbihqb2JpZCkge1xuICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi95YXJuLWNhbmNlbFwiKTtcbiAgfTtcbiAgdGhpcy5zdG9wSm9iID0gZnVuY3Rpb24oam9iaWQpIHtcbiAgICByZXR1cm4gJGh0dHAuZ2V0KFwiam9icy9cIiArIGpvYmlkICsgXCIveWFybi1zdG9wXCIpO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdtZXRyaWNzR3JhcGgnLCAtPlxuICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0IHBhbmVsLW1ldHJpY1wiPlxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtZXRyaWMtdGl0bGVcIj57e21ldHJpYy5pZH19PC9zcGFuPlxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy5zaXplICE9IFxcJ2JpZ1xcJ31dXCIgbmctY2xpY2s9XCJzZXRTaXplKFxcJ3NtYWxsXFwnKVwiPlNtYWxsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMuc2l6ZSA9PSBcXCdiaWdcXCd9XVwiIG5nLWNsaWNrPVwic2V0U2l6ZShcXCdiaWdcXCcpXCI+QmlnPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgPGEgdGl0bGU9XCJSZW1vdmVcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4teHMgcmVtb3ZlXCIgbmctY2xpY2s9XCJyZW1vdmVNZXRyaWMoKVwiPjxpIGNsYXNzPVwiZmEgZmEtY2xvc2VcIiAvPjwvYT5cbiAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICA8c3ZnIG5nLWlmPVwibWV0cmljLnZpZXcgPT0gXFwnY2hhcnRcXCdcIi8+XG4gICAgICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwibWV0cmljLnZpZXcgIT0gXFwnY2hhcnRcXCdcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWV0cmljLW51bWVyaWNcIiB0aXRsZT1cInt7dmFsdWUgfCBodW1hbml6ZUNoYXJ0TnVtZXJpY1RpdGxlOm1ldHJpY319XCI+e3t2YWx1ZSB8IGh1bWFuaXplQ2hhcnROdW1lcmljOm1ldHJpY319PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy52aWV3ID09IFxcJ2NoYXJ0XFwnfV1cIiBuZy1jbGljaz1cInNldFZpZXcoXFwnY2hhcnRcXCcpXCI+Q2hhcnQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMudmlldyAhPSBcXCdjaGFydFxcJ31dXCIgbmctY2xpY2s9XCJzZXRWaWV3KFxcJ251bWVyaWNcXCcpXCI+TnVtZXJpYzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICA8L2Rpdj4nXG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6XG4gICAgbWV0cmljOiBcIj1cIlxuICAgIHdpbmRvdzogXCI9XCJcbiAgICByZW1vdmVNZXRyaWM6IFwiJlwiXG4gICAgc2V0TWV0cmljU2l6ZTogXCI9XCJcbiAgICBzZXRNZXRyaWNWaWV3OiBcIj1cIlxuICAgIGdldFZhbHVlczogXCImXCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmJ0bkNsYXNzZXMgPSBbJ2J0bicsICdidG4tZGVmYXVsdCcsICdidG4teHMnXVxuXG4gICAgc2NvcGUudmFsdWUgPSBudWxsXG4gICAgc2NvcGUuZGF0YSA9IFt7XG4gICAgICB2YWx1ZXM6IHNjb3BlLmdldFZhbHVlcygpXG4gICAgfV1cblxuICAgIHNjb3BlLm9wdGlvbnMgPSB7XG4gICAgICB4OiAoZCwgaSkgLT5cbiAgICAgICAgZC54XG4gICAgICB5OiAoZCwgaSkgLT5cbiAgICAgICAgZC55XG5cbiAgICAgIHhUaWNrRm9ybWF0OiAoZCkgLT5cbiAgICAgICAgZDMudGltZS5mb3JtYXQoJyVIOiVNOiVTJykobmV3IERhdGUoZCkpXG5cbiAgICAgIHlUaWNrRm9ybWF0OiAoZCkgLT5cbiAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICBwb3cgPSAwXG4gICAgICAgIHN0ZXAgPSAxXG4gICAgICAgIGFic0QgPSBNYXRoLmFicyhkKVxuXG4gICAgICAgIHdoaWxlICFmb3VuZCAmJiBwb3cgPCA1MFxuICAgICAgICAgIGlmIE1hdGgucG93KDEwLCBwb3cpIDw9IGFic0QgJiYgYWJzRCA8IE1hdGgucG93KDEwLCBwb3cgKyBzdGVwKVxuICAgICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcG93ICs9IHN0ZXBcblxuICAgICAgICBpZiBmb3VuZCAmJiBwb3cgPiA2XG4gICAgICAgICAgXCIje2QgLyBNYXRoLnBvdygxMCwgcG93KX1FI3twb3d9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFwiI3tkfVwiXG4gICAgfVxuXG4gICAgc2NvcGUuc2hvd0NoYXJ0ID0gLT5cbiAgICAgIGQzLnNlbGVjdChlbGVtZW50LmZpbmQoXCJzdmdcIilbMF0pXG4gICAgICAuZGF0dW0oc2NvcGUuZGF0YSlcbiAgICAgIC50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjUwKVxuICAgICAgLmNhbGwoc2NvcGUuY2hhcnQpXG5cbiAgICBzY29wZS5jaGFydCA9IG52Lm1vZGVscy5saW5lQ2hhcnQoKVxuICAgICAgLm9wdGlvbnMoc2NvcGUub3B0aW9ucylcbiAgICAgIC5zaG93TGVnZW5kKGZhbHNlKVxuICAgICAgLm1hcmdpbih7XG4gICAgICAgIHRvcDogMTVcbiAgICAgICAgbGVmdDogNjBcbiAgICAgICAgYm90dG9tOiAzMFxuICAgICAgICByaWdodDogMzBcbiAgICAgIH0pXG5cbiAgICBzY29wZS5jaGFydC55QXhpcy5zaG93TWF4TWluKGZhbHNlKVxuICAgIHNjb3BlLmNoYXJ0LnRvb2x0aXAuaGlkZURlbGF5KDApXG4gICAgc2NvcGUuY2hhcnQudG9vbHRpcC5jb250ZW50R2VuZXJhdG9yKChvYmopIC0+XG4gICAgICBcIjxwPiN7ZDMudGltZS5mb3JtYXQoJyVIOiVNOiVTJykobmV3IERhdGUob2JqLnBvaW50LngpKX0gfCAje29iai5wb2ludC55fTwvcD5cIlxuICAgIClcblxuICAgIG52LnV0aWxzLndpbmRvd1Jlc2l6ZShzY29wZS5jaGFydC51cGRhdGUpO1xuXG4gICAgc2NvcGUuc2V0U2l6ZSA9IChzaXplKSAtPlxuICAgICAgc2NvcGUuc2V0TWV0cmljU2l6ZShzY29wZS5tZXRyaWMsIHNpemUpXG5cbiAgICBzY29wZS5zZXRWaWV3ID0gKHZpZXcpIC0+XG4gICAgICBzY29wZS5zZXRNZXRyaWNWaWV3KHNjb3BlLm1ldHJpYywgdmlldylcbiAgICAgIHNjb3BlLnNob3dDaGFydCgpIGlmIHZpZXcgPT0gJ2NoYXJ0J1xuXG4gICAgc2NvcGUuc2hvd0NoYXJ0KCkgaWYgc2NvcGUubWV0cmljLnZpZXcgPT0gJ2NoYXJ0J1xuXG4gICAgc2NvcGUuJG9uICdtZXRyaWNzOmRhdGE6dXBkYXRlJywgKGV2ZW50LCB0aW1lc3RhbXAsIGRhdGEpIC0+XG4gICAgICBzY29wZS52YWx1ZSA9IHBhcnNlRmxvYXQoZGF0YVtzY29wZS5tZXRyaWMuaWRdKVxuXG4gICAgICBzY29wZS5kYXRhWzBdLnZhbHVlcy5wdXNoIHtcbiAgICAgICAgeDogdGltZXN0YW1wXG4gICAgICAgIHk6IHNjb3BlLnZhbHVlXG4gICAgICB9XG5cbiAgICAgIGlmIHNjb3BlLmRhdGFbMF0udmFsdWVzLmxlbmd0aCA+IHNjb3BlLndpbmRvd1xuICAgICAgICBzY29wZS5kYXRhWzBdLnZhbHVlcy5zaGlmdCgpXG5cbiAgICAgIHNjb3BlLnNob3dDaGFydCgpIGlmIHNjb3BlLm1ldHJpYy52aWV3ID09ICdjaGFydCdcbiAgICAgIHNjb3BlLmNoYXJ0LmNsZWFySGlnaGxpZ2h0cygpIGlmIHNjb3BlLm1ldHJpYy52aWV3ID09ICdjaGFydCdcbiAgICAgIHNjb3BlLmNoYXJ0LnRvb2x0aXAuaGlkZGVuKHRydWUpXG5cbiAgICBlbGVtZW50LmZpbmQoXCIubWV0cmljLXRpdGxlXCIpLnF0aXAoe1xuICAgICAgY29udGVudDoge1xuICAgICAgICB0ZXh0OiBzY29wZS5tZXRyaWMuaWRcbiAgICAgIH0sXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICBteTogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgYXQ6ICd0b3AgbGVmdCdcbiAgICAgIH0sXG4gICAgICBzdHlsZToge1xuICAgICAgICBjbGFzc2VzOiAncXRpcC1saWdodCBxdGlwLXRpbWVsaW5lLWJhcidcbiAgICAgIH1cbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5kaXJlY3RpdmUoJ21ldHJpY3NHcmFwaCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHQgcGFuZWwtbWV0cmljXCI+IDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+IDxzcGFuIGNsYXNzPVwibWV0cmljLXRpdGxlXCI+e3ttZXRyaWMuaWR9fTwvc3Bhbj4gPGRpdiBjbGFzcz1cImJ1dHRvbnNcIj4gPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMuc2l6ZSAhPSBcXCdiaWdcXCd9XVwiIG5nLWNsaWNrPVwic2V0U2l6ZShcXCdzbWFsbFxcJylcIj5TbWFsbDwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMuc2l6ZSA9PSBcXCdiaWdcXCd9XVwiIG5nLWNsaWNrPVwic2V0U2l6ZShcXCdiaWdcXCcpXCI+QmlnPC9idXR0b24+IDwvZGl2PiA8YSB0aXRsZT1cIlJlbW92ZVwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyByZW1vdmVcIiBuZy1jbGljaz1cInJlbW92ZU1ldHJpYygpXCI+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiIC8+PC9hPiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+IDxzdmcgbmctaWY9XCJtZXRyaWMudmlldyA9PSBcXCdjaGFydFxcJ1wiLz4gPGRpdiBuZy1pZj1cIm1ldHJpYy52aWV3ICE9IFxcJ2NoYXJ0XFwnXCI+IDxkaXYgY2xhc3M9XCJtZXRyaWMtbnVtZXJpY1wiIHRpdGxlPVwie3t2YWx1ZSB8IGh1bWFuaXplQ2hhcnROdW1lcmljVGl0bGU6bWV0cmljfX1cIj57e3ZhbHVlIHwgaHVtYW5pemVDaGFydE51bWVyaWM6bWV0cmljfX08L2Rpdj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPiA8ZGl2IGNsYXNzPVwiYnRuLWdyb3VwXCI+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy52aWV3ID09IFxcJ2NoYXJ0XFwnfV1cIiBuZy1jbGljaz1cInNldFZpZXcoXFwnY2hhcnRcXCcpXCI+Q2hhcnQ8L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmctY2xhc3M9XCJbYnRuQ2xhc3Nlcywge2FjdGl2ZTogbWV0cmljLnZpZXcgIT0gXFwnY2hhcnRcXCd9XVwiIG5nLWNsaWNrPVwic2V0VmlldyhcXCdudW1lcmljXFwnKVwiPk51bWVyaWM8L2J1dHRvbj4gPC9kaXY+IDwvZGl2PicsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgbWV0cmljOiBcIj1cIixcbiAgICAgIHdpbmRvdzogXCI9XCIsXG4gICAgICByZW1vdmVNZXRyaWM6IFwiJlwiLFxuICAgICAgc2V0TWV0cmljU2l6ZTogXCI9XCIsXG4gICAgICBzZXRNZXRyaWNWaWV3OiBcIj1cIixcbiAgICAgIGdldFZhbHVlczogXCImXCJcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuYnRuQ2xhc3NlcyA9IFsnYnRuJywgJ2J0bi1kZWZhdWx0JywgJ2J0bi14cyddO1xuICAgICAgc2NvcGUudmFsdWUgPSBudWxsO1xuICAgICAgc2NvcGUuZGF0YSA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHZhbHVlczogc2NvcGUuZ2V0VmFsdWVzKClcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICAgIHNjb3BlLm9wdGlvbnMgPSB7XG4gICAgICAgIHg6IGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gZC54O1xuICAgICAgICB9LFxuICAgICAgICB5OiBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIGQueTtcbiAgICAgICAgfSxcbiAgICAgICAgeFRpY2tGb3JtYXQ6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZDMudGltZS5mb3JtYXQoJyVIOiVNOiVTJykobmV3IERhdGUoZCkpO1xuICAgICAgICB9LFxuICAgICAgICB5VGlja0Zvcm1hdDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHZhciBhYnNELCBmb3VuZCwgcG93LCBzdGVwO1xuICAgICAgICAgIGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgcG93ID0gMDtcbiAgICAgICAgICBzdGVwID0gMTtcbiAgICAgICAgICBhYnNEID0gTWF0aC5hYnMoZCk7XG4gICAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiBwb3cgPCA1MCkge1xuICAgICAgICAgICAgaWYgKE1hdGgucG93KDEwLCBwb3cpIDw9IGFic0QgJiYgYWJzRCA8IE1hdGgucG93KDEwLCBwb3cgKyBzdGVwKSkge1xuICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwb3cgKz0gc3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGZvdW5kICYmIHBvdyA+IDYpIHtcbiAgICAgICAgICAgIHJldHVybiAoZCAvIE1hdGgucG93KDEwLCBwb3cpKSArIFwiRVwiICsgcG93O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIiArIGQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2NvcGUuc2hvd0NoYXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkMy5zZWxlY3QoZWxlbWVudC5maW5kKFwic3ZnXCIpWzBdKS5kYXR1bShzY29wZS5kYXRhKS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjUwKS5jYWxsKHNjb3BlLmNoYXJ0KTtcbiAgICAgIH07XG4gICAgICBzY29wZS5jaGFydCA9IG52Lm1vZGVscy5saW5lQ2hhcnQoKS5vcHRpb25zKHNjb3BlLm9wdGlvbnMpLnNob3dMZWdlbmQoZmFsc2UpLm1hcmdpbih7XG4gICAgICAgIHRvcDogMTUsXG4gICAgICAgIGxlZnQ6IDYwLFxuICAgICAgICBib3R0b206IDMwLFxuICAgICAgICByaWdodDogMzBcbiAgICAgIH0pO1xuICAgICAgc2NvcGUuY2hhcnQueUF4aXMuc2hvd01heE1pbihmYWxzZSk7XG4gICAgICBzY29wZS5jaGFydC50b29sdGlwLmhpZGVEZWxheSgwKTtcbiAgICAgIHNjb3BlLmNoYXJ0LnRvb2x0aXAuY29udGVudEdlbmVyYXRvcihmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIFwiPHA+XCIgKyAoZDMudGltZS5mb3JtYXQoJyVIOiVNOiVTJykobmV3IERhdGUob2JqLnBvaW50LngpKSkgKyBcIiB8IFwiICsgb2JqLnBvaW50LnkgKyBcIjwvcD5cIjtcbiAgICAgIH0pO1xuICAgICAgbnYudXRpbHMud2luZG93UmVzaXplKHNjb3BlLmNoYXJ0LnVwZGF0ZSk7XG4gICAgICBzY29wZS5zZXRTaXplID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgICByZXR1cm4gc2NvcGUuc2V0TWV0cmljU2l6ZShzY29wZS5tZXRyaWMsIHNpemUpO1xuICAgICAgfTtcbiAgICAgIHNjb3BlLnNldFZpZXcgPSBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgIHNjb3BlLnNldE1ldHJpY1ZpZXcoc2NvcGUubWV0cmljLCB2aWV3KTtcbiAgICAgICAgaWYgKHZpZXcgPT09ICdjaGFydCcpIHtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuc2hvd0NoYXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoc2NvcGUubWV0cmljLnZpZXcgPT09ICdjaGFydCcpIHtcbiAgICAgICAgc2NvcGUuc2hvd0NoYXJ0KCk7XG4gICAgICB9XG4gICAgICBzY29wZS4kb24oJ21ldHJpY3M6ZGF0YTp1cGRhdGUnLCBmdW5jdGlvbihldmVudCwgdGltZXN0YW1wLCBkYXRhKSB7XG4gICAgICAgIHNjb3BlLnZhbHVlID0gcGFyc2VGbG9hdChkYXRhW3Njb3BlLm1ldHJpYy5pZF0pO1xuICAgICAgICBzY29wZS5kYXRhWzBdLnZhbHVlcy5wdXNoKHtcbiAgICAgICAgICB4OiB0aW1lc3RhbXAsXG4gICAgICAgICAgeTogc2NvcGUudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzY29wZS5kYXRhWzBdLnZhbHVlcy5sZW5ndGggPiBzY29wZS53aW5kb3cpIHtcbiAgICAgICAgICBzY29wZS5kYXRhWzBdLnZhbHVlcy5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29wZS5tZXRyaWMudmlldyA9PT0gJ2NoYXJ0Jykge1xuICAgICAgICAgIHNjb3BlLnNob3dDaGFydCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29wZS5tZXRyaWMudmlldyA9PT0gJ2NoYXJ0Jykge1xuICAgICAgICAgIHNjb3BlLmNoYXJ0LmNsZWFySGlnaGxpZ2h0cygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzY29wZS5jaGFydC50b29sdGlwLmhpZGRlbih0cnVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVsZW1lbnQuZmluZChcIi5tZXRyaWMtdGl0bGVcIikucXRpcCh7XG4gICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICB0ZXh0OiBzY29wZS5tZXRyaWMuaWRcbiAgICAgICAgfSxcbiAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICBteTogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICBhdDogJ3RvcCBsZWZ0J1xuICAgICAgICB9LFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGNsYXNzZXM6ICdxdGlwLWxpZ2h0IHF0aXAtdGltZWxpbmUtYmFyJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnTWV0cmljc1NlcnZpY2UnLCAoJGh0dHAsICRxLCBmbGlua0NvbmZpZywgJGludGVydmFsLCB3YXRlcm1hcmtzQ29uZmlnKSAtPlxuICBAbWV0cmljcyA9IHt9XG4gIEB2YWx1ZXMgPSB7fVxuICBAd2F0Y2hlZCA9IHt9XG4gIEBvYnNlcnZlciA9IHtcbiAgICBqb2JpZDogbnVsbFxuICAgIG5vZGVpZDogbnVsbFxuICAgIGNhbGxiYWNrOiBudWxsXG4gIH1cblxuICBAcmVmcmVzaCA9ICRpbnRlcnZhbCA9PlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBAbWV0cmljcywgKHZlcnRpY2VzLCBqb2JpZCkgPT5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCB2ZXJ0aWNlcywgKG1ldHJpY3MsIG5vZGVpZCkgPT5cbiAgICAgICAgbmFtZXMgPSBbXVxuICAgICAgICBhbmd1bGFyLmZvckVhY2ggbWV0cmljcywgKG1ldHJpYywgaW5kZXgpID0+XG4gICAgICAgICAgbmFtZXMucHVzaCBtZXRyaWMuaWRcblxuICAgICAgICBpZiBuYW1lcy5sZW5ndGggPiAwXG4gICAgICAgICAgQGdldE1ldHJpY3Moam9iaWQsIG5vZGVpZCwgbmFtZXMpLnRoZW4gKHZhbHVlcykgPT5cbiAgICAgICAgICAgIGlmIGpvYmlkID09IEBvYnNlcnZlci5qb2JpZCAmJiBub2RlaWQgPT0gQG9ic2VydmVyLm5vZGVpZFxuICAgICAgICAgICAgICBAb2JzZXJ2ZXIuY2FsbGJhY2sodmFsdWVzKSBpZiBAb2JzZXJ2ZXIuY2FsbGJhY2tcblxuXG4gICwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdXG5cbiAgQHJlZ2lzdGVyT2JzZXJ2ZXIgPSAoam9iaWQsIG5vZGVpZCwgY2FsbGJhY2spIC0+XG4gICAgQG9ic2VydmVyLmpvYmlkID0gam9iaWRcbiAgICBAb2JzZXJ2ZXIubm9kZWlkID0gbm9kZWlkXG4gICAgQG9ic2VydmVyLmNhbGxiYWNrID0gY2FsbGJhY2tcblxuICBAdW5SZWdpc3Rlck9ic2VydmVyID0gLT5cbiAgICBAb2JzZXJ2ZXIgPSB7XG4gICAgICBqb2JpZDogbnVsbFxuICAgICAgbm9kZWlkOiBudWxsXG4gICAgICBjYWxsYmFjazogbnVsbFxuICAgIH1cblxuICBAc2V0dXBNZXRyaWNzID0gKGpvYmlkLCB2ZXJ0aWNlcykgLT5cbiAgICBAc2V0dXBMUygpXG5cbiAgICBAd2F0Y2hlZFtqb2JpZF0gPSBbXVxuICAgIGFuZ3VsYXIuZm9yRWFjaCB2ZXJ0aWNlcywgKHYsIGspID0+XG4gICAgICBAd2F0Y2hlZFtqb2JpZF0ucHVzaCh2LmlkKSBpZiB2LmlkXG5cbiAgQGdldFdpbmRvdyA9IC0+XG4gICAgMTAwXG5cbiAgQHNldHVwTFMgPSAtPlxuICAgIGlmICFzZXNzaW9uU3RvcmFnZS5mbGlua01ldHJpY3M/XG4gICAgICBAc2F2ZVNldHVwKClcblxuICAgIEBtZXRyaWNzID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5mbGlua01ldHJpY3MpXG5cbiAgQHNhdmVTZXR1cCA9IC0+XG4gICAgc2Vzc2lvblN0b3JhZ2UuZmxpbmtNZXRyaWNzID0gSlNPTi5zdHJpbmdpZnkoQG1ldHJpY3MpXG5cbiAgQHNhdmVWYWx1ZSA9IChqb2JpZCwgbm9kZWlkLCB2YWx1ZSkgLT5cbiAgICB1bmxlc3MgQHZhbHVlc1tqb2JpZF0/XG4gICAgICBAdmFsdWVzW2pvYmlkXSA9IHt9XG5cbiAgICB1bmxlc3MgQHZhbHVlc1tqb2JpZF1bbm9kZWlkXT9cbiAgICAgIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0gPSBbXVxuXG4gICAgQHZhbHVlc1tqb2JpZF1bbm9kZWlkXS5wdXNoKHZhbHVlKVxuXG4gICAgaWYgQHZhbHVlc1tqb2JpZF1bbm9kZWlkXS5sZW5ndGggPiBAZ2V0V2luZG93KClcbiAgICAgIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0uc2hpZnQoKVxuXG4gIEBnZXRWYWx1ZXMgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljaWQpIC0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyBAdmFsdWVzW2pvYmlkXT9cbiAgICByZXR1cm4gW10gdW5sZXNzIEB2YWx1ZXNbam9iaWRdW25vZGVpZF0/XG5cbiAgICByZXN1bHRzID0gW11cbiAgICBhbmd1bGFyLmZvckVhY2ggQHZhbHVlc1tqb2JpZF1bbm9kZWlkXSwgKHYsIGspID0+XG4gICAgICBpZiB2LnZhbHVlc1ttZXRyaWNpZF0/XG4gICAgICAgIHJlc3VsdHMucHVzaCB7XG4gICAgICAgICAgeDogdi50aW1lc3RhbXBcbiAgICAgICAgICB5OiB2LnZhbHVlc1ttZXRyaWNpZF1cbiAgICAgICAgfVxuXG4gICAgcmVzdWx0c1xuXG4gIEBzZXR1cExTRm9yID0gKGpvYmlkLCBub2RlaWQpIC0+XG4gICAgaWYgIUBtZXRyaWNzW2pvYmlkXT9cbiAgICAgIEBtZXRyaWNzW2pvYmlkXSA9IHt9XG5cbiAgICBpZiAhQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0/XG4gICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXSA9IFtdXG5cbiAgQGFkZE1ldHJpYyA9IChqb2JpZCwgbm9kZWlkLCBtZXRyaWNpZCkgLT5cbiAgICBAc2V0dXBMU0Zvcihqb2JpZCwgbm9kZWlkKVxuXG4gICAgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0ucHVzaCh7aWQ6IG1ldHJpY2lkLCBzaXplOiAnc21hbGwnLCB2aWV3OiAnY2hhcnQnfSlcblxuICAgIEBzYXZlU2V0dXAoKVxuXG4gIEByZW1vdmVNZXRyaWMgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljKSA9PlxuICAgIGlmIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdP1xuICAgICAgaSA9IEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljKVxuICAgICAgaSA9IF8uZmluZEluZGV4KEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7IGlkOiBtZXRyaWMgfSkgaWYgaSA9PSAtMVxuXG4gICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaSwgMSkgaWYgaSAhPSAtMVxuXG4gICAgICBAc2F2ZVNldHVwKClcblxuICBAc2V0TWV0cmljU2l6ZSA9IChqb2JpZCwgbm9kZWlkLCBtZXRyaWMsIHNpemUpID0+XG4gICAgaWYgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0/XG4gICAgICBpID0gQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZihtZXRyaWMuaWQpXG4gICAgICBpID0gXy5maW5kSW5kZXgoQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHsgaWQ6IG1ldHJpYy5pZCB9KSBpZiBpID09IC0xXG5cbiAgICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdW2ldID0geyBpZDogbWV0cmljLmlkLCBzaXplOiBzaXplLCB2aWV3OiBtZXRyaWMudmlldyB9IGlmIGkgIT0gLTFcblxuICAgICAgQHNhdmVTZXR1cCgpXG5cbiAgQHNldE1ldHJpY1ZpZXcgPSAoam9iaWQsIG5vZGVpZCwgbWV0cmljLCB2aWV3KSA9PlxuICAgIGlmIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdP1xuICAgICAgaSA9IEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljLmlkKVxuICAgICAgaSA9IF8uZmluZEluZGV4KEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7IGlkOiBtZXRyaWMuaWQgfSkgaWYgaSA9PSAtMVxuXG4gICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXVtpXSA9IHsgaWQ6IG1ldHJpYy5pZCwgc2l6ZTogbWV0cmljLnNpemUsIHZpZXc6IHZpZXcgfSBpZiBpICE9IC0xXG5cbiAgICAgIEBzYXZlU2V0dXAoKVxuXG4gIEBvcmRlck1ldHJpY3MgPSAoam9iaWQsIG5vZGVpZCwgaXRlbSwgaW5kZXgpIC0+XG4gICAgQHNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZClcblxuICAgIGFuZ3VsYXIuZm9yRWFjaCBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgKHYsIGspID0+XG4gICAgICBpZiB2LmlkID09IGl0ZW0uaWRcbiAgICAgICAgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uc3BsaWNlKGssIDEpXG4gICAgICAgIGlmIGsgPCBpbmRleFxuICAgICAgICAgIGluZGV4ID0gaW5kZXggLSAxXG5cbiAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaW5kZXgsIDAsIGl0ZW0pXG5cbiAgICBAc2F2ZVNldHVwKClcblxuICBAZ2V0TWV0cmljc1NldHVwID0gKGpvYmlkLCBub2RlaWQpID0+XG4gICAge1xuICAgICAgbmFtZXM6IF8ubWFwKEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCAodmFsdWUpID0+XG4gICAgICAgIGlmIF8uaXNTdHJpbmcodmFsdWUpIHRoZW4geyBpZDogdmFsdWUsIHNpemU6IFwic21hbGxcIiwgdmlldzogXCJjaGFydFwiIH0gZWxzZSB2YWx1ZVxuICAgICAgKVxuICAgIH1cblxuICBAZ2V0QXZhaWxhYmxlTWV0cmljcyA9IChqb2JpZCwgbm9kZWlkKSA9PlxuICAgIEBzZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpXG5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljc1wiXG4gICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICByZXN1bHRzID0gW11cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLCAodiwgaykgPT5cbiAgICAgICAgaSA9IEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2Yodi5pZClcbiAgICAgICAgaSA9IF8uZmluZEluZGV4KEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7IGlkOiB2LmlkIH0pIGlmIGkgPT0gLTFcblxuICAgICAgICBpZiBpID09IC0xXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHYpXG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cylcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZ2V0QWxsQXZhaWxhYmxlTWV0cmljcyA9IChqb2JpZCwgbm9kZWlkKSA9PlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvdmVydGljZXMvXCIgKyBub2RlaWQgKyBcIi9tZXRyaWNzXCJcbiAgICAuc3VjY2VzcyAoZGF0YSkgPT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZ2V0TWV0cmljcyA9IChqb2JpZCwgbm9kZWlkLCBtZXRyaWNJZHMpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBpZHMgPSBtZXRyaWNJZHMuam9pbihcIixcIilcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljcz9nZXQ9XCIgKyBpZHNcbiAgICAuc3VjY2VzcyAoZGF0YSkgPT5cbiAgICAgIHJlc3VsdCA9IHt9XG4gICAgICBhbmd1bGFyLmZvckVhY2ggZGF0YSwgKHYsIGspIC0+XG4gICAgICAgIHJlc3VsdFt2LmlkXSA9IHBhcnNlSW50KHYudmFsdWUpXG5cbiAgICAgIG5ld1ZhbHVlID0ge1xuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgdmFsdWVzOiByZXN1bHRcbiAgICAgIH1cbiAgICAgIEBzYXZlVmFsdWUoam9iaWQsIG5vZGVpZCwgbmV3VmFsdWUpXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKG5ld1ZhbHVlKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG5cbiAgIyBBc3luY2hyb25vdXNseSByZXF1ZXN0cyB0aGUgd2F0ZXJtYXJrIG1ldHJpY3MgZm9yIHRoZSBnaXZlbiBub2Rlcy4gVGhlXG4gICMgcmV0dXJuZWQgb2JqZWN0IGhhcyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgI1xuICAjIHtcbiAgIyAgICBcIjxub2RlSWQ+XCI6IHtcbiAgIyAgICAgICAgICBcImxvd1dhdGVybWFya1wiOiA8bG93V2F0ZXJtYXJrPlxuICAjICAgICAgICAgIFwid2F0ZXJtYXJrc1wiOiB7XG4gICMgICAgICAgICAgICAgICAwOiA8d2F0ZXJtYXJrIGZvciBzdWJ0YXNrIDA+XG4gICMgICAgICAgICAgICAgICAuLi5cbiAgIyAgICAgICAgICAgICAgIG46IDx3YXRlcm1hcmsgZm9yIHN1YnRhc2sgbj5cbiAgIyAgICAgICAgICAgIH1cbiAgIyAgICAgICB9XG4gICMgfVxuICAjXG4gICMgSWYgbm8gd2F0ZXJtYXJrIGlzIGF2YWlsYWJsZSwgbG93V2F0ZXJtYXJrIHdpbGwgYmUgTmFOIGFuZFxuICAjIHRoZSB3YXRlcm1hcmtzIHdpbGwgYmUgZW1wdHkuXG4gIEBnZXRXYXRlcm1hcmtzID0gKGppZCwgbm9kZXMpIC0+XG4gICAgIyBSZXF1ZXN0cyB0aGUgd2F0ZXJtYXJrcyBmb3IgYSBzaW5nbGUgdmVydGV4LiBUcmlnZ2VycyBhIHJlcXVlc3RcbiAgICAjIHRvIHRoZSBNZXRyaWNzIHNlcnZpY2UuXG4gICAgcmVxdWVzdFdhdGVybWFya0Zvck5vZGUgPSAobm9kZSkgPT5cbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgICAjIFJlcXVlc3QgbWV0cmljcyBmb3IgZWFjaCBzdWJ0YXNrXG4gICAgICBtZXRyaWNJZHMgPSAoaSArIFwiLmN1cnJlbnRMb3dXYXRlcm1hcmtcIiBmb3IgaSBpbiBbMC4ubm9kZS5wYXJhbGxlbGlzbSAtIDFdKVxuICAgICAgQGdldE1ldHJpY3MoamlkLCBub2RlLmlkLCBtZXRyaWNJZHMpLnRoZW4gKG1ldHJpY3MpIC0+XG4gICAgICAgIG1pblZhbHVlID0gTmFOXG4gICAgICAgIHdhdGVybWFya3MgPSB7fVxuXG4gICAgICAgIGZvciBrZXksIHZhbHVlIG9mIG1ldHJpY3MudmFsdWVzXG4gICAgICAgICAgc3VidGFza0luZGV4ID0ga2V5LnJlcGxhY2UoJy5jdXJyZW50TG93V2F0ZXJtYXJrJywgJycpXG4gICAgICAgICAgd2F0ZXJtYXJrc1tzdWJ0YXNrSW5kZXhdID0gdmFsdWVcblxuICAgICAgICAgIGlmIChpc05hTihtaW5WYWx1ZSkgfHwgdmFsdWUgPCBtaW5WYWx1ZSlcbiAgICAgICAgICAgIG1pblZhbHVlID0gdmFsdWVcblxuICAgICAgICBpZiAoIWlzTmFOKG1pblZhbHVlKSAmJiBtaW5WYWx1ZSA+IHdhdGVybWFya3NDb25maWcubm9XYXRlcm1hcmspXG4gICAgICAgICAgbG93V2F0ZXJtYXJrID0gbWluVmFsdWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgTmFOIGluZGljYXRlcyBubyB3YXRlcm1hcmsgYXZhaWxhYmxlXG4gICAgICAgICAgbG93V2F0ZXJtYXJrID0gTmFOXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XCJsb3dXYXRlcm1hcmtcIjogbG93V2F0ZXJtYXJrLCBcIndhdGVybWFya3NcIjogd2F0ZXJtYXJrc30pXG5cbiAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgIHdhdGVybWFya3MgPSB7fVxuXG4gICAgcHJvbWlzZXMgPSBbXVxuXG4gICAgIyBSZXF1ZXN0IHdhdGVybWFya3MgZm9yIGVhY2ggbm9kZSBhbmQgdXBkYXRlIHdhdGVybWFya3NcbiAgICBhbmd1bGFyLmZvckVhY2ggbm9kZXMsIChub2RlLCBpbmRleCkgPT5cbiAgICAgIHByID0gcmVxdWVzdFdhdGVybWFya0Zvck5vZGUobm9kZSkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgd2F0ZXJtYXJrc1tub2RlLmlkXSA9IGRhdGFcblxuICAgICAgcHJvbWlzZXMucHVzaChwcilcblxuICAgICRxLmFsbChwcm9taXNlcykudGhlbiAoKSA9PlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh3YXRlcm1hcmtzKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRHbG9iYWxPdmVydmlldyA9IChqaWQsIG5vZGVzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgcHJvbWlzZXMgPSBbXVxuXG4gICAgZ2V0U291cmNlc0FuZFNpbmtzID0gKCkgPT5cbiAgICAgIHByZWRlY2Vzc29ycyA9IFtdXG4gICAgICBzb3VyY2VzID0gW11cbiAgICAgIHNpbmtzID0gW11cblxuICAgICAgYW5ndWxhci5mb3JFYWNoKG5vZGVzLCAobm9kZSkgLT5cbiAgICAgICAgaWYgIW5vZGUuaW5wdXRzXG4gICAgICAgICAgc291cmNlcy5wdXNoKG5vZGUuaWQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwcmVkZWNlc3NvcnMgPSBwcmVkZWNlc3NvcnMuY29uY2F0KF8ubWFwKG5vZGUuaW5wdXRzLCAoaW5wdXQpIC0+IGlucHV0LmlkKSlcbiAgICAgIClcblxuICAgICAgYW5ndWxhci5mb3JFYWNoKG5vZGVzLCAobm9kZSkgLT5cbiAgICAgICAgaWYgIV8uY29udGFpbnMocHJlZGVjZXNzb3JzLCBub2RlLmlkKVxuICAgICAgICAgIHNpbmtzLnB1c2gobm9kZS5pZClcbiAgICAgIClcblxuICAgICAgW3NvdXJjZXMsIHNpbmtzXVxuXG4gICAgW3NvdXJjZXMsIHNpbmtzXSA9IGdldFNvdXJjZXNBbmRTaW5rcygpXG5cbiAgICBpbmNvbWluZyA9IDBcbiAgICBvdXRnb2luZyA9IDBcbiAgICBpbmNvbWluZ1IgPSAwXG4gICAgb3V0Z29pbmdSID0gMFxuXG4gICAgYW5ndWxhci5mb3JFYWNoIG5vZGVzLCAobm9kZSkgPT5cbiAgICAgIG1ldHJpY0lkcyA9IChpICsgXCIubnVtQnl0ZXNJbkxvY2FsUGVyU2Vjb25kXCIgZm9yIGkgaW4gWzAuLm5vZGUucGFyYWxsZWxpc20gLSAxXSlcbiAgICAgICAgLmNvbmNhdChpICsgXCIubnVtQnl0ZXNJblJlbW90ZVBlclNlY29uZFwiIGZvciBpIGluIFswLi5ub2RlLnBhcmFsbGVsaXNtIC0gMV0pXG4gICAgICAgIC5jb25jYXQoaSArIFwiLm51bUJ5dGVzT3V0UGVyU2Vjb25kXCIgZm9yIGkgaW4gWzAuLm5vZGUucGFyYWxsZWxpc20gLSAxXSlcbiAgICAgICAgLmNvbmNhdChpICsgXCIubnVtUmVjb3Jkc0luUGVyU2Vjb25kXCIgZm9yIGkgaW4gWzAuLm5vZGUucGFyYWxsZWxpc20gLSAxXSlcbiAgICAgICAgLmNvbmNhdChpICsgXCIubnVtUmVjb3Jkc091dFBlclNlY29uZFwiIGZvciBpIGluIFswLi5ub2RlLnBhcmFsbGVsaXNtIC0gMV0pXG5cbiAgICAgIHByID0gQGdldE1ldHJpY3MoamlkLCBub2RlLmlkLCBtZXRyaWNJZHMpLnRoZW4gKG1ldHJpY3MpIC0+XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChfLmtleXMobWV0cmljcy52YWx1ZXMpLCAoa2V5KSA9PlxuICAgICAgICAgIGlmIGtleS5pbmRleE9mKFwibnVtQnl0ZXNPdXRQZXJTZWNvbmRcIikgIT0gLTEgJiYgXy5jb250YWlucyhzb3VyY2VzLCBub2RlLmlkKVxuICAgICAgICAgICAgaW5jb21pbmcgKz0gbWV0cmljcy52YWx1ZXNba2V5XVxuICAgICAgICAgIGVsc2UgaWYga2V5LmluZGV4T2YoXCJudW1CeXRlc0luTG9jYWxQZXJTZWNvbmRcIikgIT0gLTEgJiYgXy5jb250YWlucyhzaW5rcywgbm9kZS5pZClcbiAgICAgICAgICAgIG91dGdvaW5nICs9IG1ldHJpY3MudmFsdWVzW2tleV1cbiAgICAgICAgICBlbHNlIGlmIGtleS5pbmRleE9mKFwibnVtQnl0ZXNJblJlbW90ZVBlclNlY29uZFwiKSAhPSAtMSAmJiBfLmNvbnRhaW5zKHNpbmtzLCBub2RlLmlkKVxuICAgICAgICAgICAgb3V0Z29pbmcgKz0gbWV0cmljcy52YWx1ZXNba2V5XVxuICAgICAgICAgIGVsc2UgaWYga2V5LmluZGV4T2YoXCJudW1SZWNvcmRzT3V0UGVyU2Vjb25kXCIpICE9IC0xICYmIF8uY29udGFpbnMoc291cmNlcywgbm9kZS5pZClcbiAgICAgICAgICAgIGluY29taW5nUiArPSBtZXRyaWNzLnZhbHVlc1trZXldXG4gICAgICAgICAgZWxzZSBpZiBrZXkuaW5kZXhPZihcIm51bVJlY29yZHNJblBlclNlY29uZFwiKSAhPSAtMSAmJiBfLmNvbnRhaW5zKHNpbmtzLCBub2RlLmlkKVxuICAgICAgICAgICAgb3V0Z29pbmdSICs9IG1ldHJpY3MudmFsdWVzW2tleV1cbiAgICAgICAgKVxuXG4gICAgICBwcm9taXNlcy5wdXNoKHByKVxuXG4gICAgJHEuYWxsKHByb21pc2VzKS50aGVuICgpID0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgaW5jb21pbmc6IGluY29taW5nLFxuICAgICAgICBvdXRnb2luZzogb3V0Z29pbmcsXG4gICAgICAgIGluY29taW5nUjogaW5jb21pbmdSLFxuICAgICAgICBvdXRnb2luZ1I6IG91dGdvaW5nUlxuICAgICAgICBsYXRlbmN5OiAwXG4gICAgICB9KVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBzZXR1cExTKClcblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdNZXRyaWNzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCAkcSwgZmxpbmtDb25maWcsICRpbnRlcnZhbCwgd2F0ZXJtYXJrc0NvbmZpZykge1xuICB0aGlzLm1ldHJpY3MgPSB7fTtcbiAgdGhpcy52YWx1ZXMgPSB7fTtcbiAgdGhpcy53YXRjaGVkID0ge307XG4gIHRoaXMub2JzZXJ2ZXIgPSB7XG4gICAgam9iaWQ6IG51bGwsXG4gICAgbm9kZWlkOiBudWxsLFxuICAgIGNhbGxiYWNrOiBudWxsXG4gIH07XG4gIHRoaXMucmVmcmVzaCA9ICRpbnRlcnZhbCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYW5ndWxhci5mb3JFYWNoKF90aGlzLm1ldHJpY3MsIGZ1bmN0aW9uKHZlcnRpY2VzLCBqb2JpZCkge1xuICAgICAgICByZXR1cm4gYW5ndWxhci5mb3JFYWNoKHZlcnRpY2VzLCBmdW5jdGlvbihtZXRyaWNzLCBub2RlaWQpIHtcbiAgICAgICAgICB2YXIgbmFtZXM7XG4gICAgICAgICAgbmFtZXMgPSBbXTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobWV0cmljcywgZnVuY3Rpb24obWV0cmljLCBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWVzLnB1c2gobWV0cmljLmlkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAobmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmdldE1ldHJpY3Moam9iaWQsIG5vZGVpZCwgbmFtZXMpLnRoZW4oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgIGlmIChqb2JpZCA9PT0gX3RoaXMub2JzZXJ2ZXIuam9iaWQgJiYgbm9kZWlkID09PSBfdGhpcy5vYnNlcnZlci5ub2RlaWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMub2JzZXJ2ZXIuY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5vYnNlcnZlci5jYWxsYmFjayh2YWx1ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pKHRoaXMpLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICB0aGlzLnJlZ2lzdGVyT2JzZXJ2ZXIgPSBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBjYWxsYmFjaykge1xuICAgIHRoaXMub2JzZXJ2ZXIuam9iaWQgPSBqb2JpZDtcbiAgICB0aGlzLm9ic2VydmVyLm5vZGVpZCA9IG5vZGVpZDtcbiAgICByZXR1cm4gdGhpcy5vYnNlcnZlci5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9O1xuICB0aGlzLnVuUmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm9ic2VydmVyID0ge1xuICAgICAgam9iaWQ6IG51bGwsXG4gICAgICBub2RlaWQ6IG51bGwsXG4gICAgICBjYWxsYmFjazogbnVsbFxuICAgIH07XG4gIH07XG4gIHRoaXMuc2V0dXBNZXRyaWNzID0gZnVuY3Rpb24oam9iaWQsIHZlcnRpY2VzKSB7XG4gICAgdGhpcy5zZXR1cExTKCk7XG4gICAgdGhpcy53YXRjaGVkW2pvYmlkXSA9IFtdO1xuICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2godmVydGljZXMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgaWYgKHYuaWQpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMud2F0Y2hlZFtqb2JpZF0ucHVzaCh2LmlkKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG4gIHRoaXMuZ2V0V2luZG93ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDEwMDtcbiAgfTtcbiAgdGhpcy5zZXR1cExTID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHNlc3Npb25TdG9yYWdlLmZsaW5rTWV0cmljcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLnNhdmVTZXR1cCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5mbGlua01ldHJpY3MpO1xuICB9O1xuICB0aGlzLnNhdmVTZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5mbGlua01ldHJpY3MgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm1ldHJpY3MpO1xuICB9O1xuICB0aGlzLnNhdmVWYWx1ZSA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIHZhbHVlKSB7XG4gICAgaWYgKHRoaXMudmFsdWVzW2pvYmlkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLnZhbHVlc1tqb2JpZF0gPSB7fTtcbiAgICB9XG4gICAgaWYgKHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdID0gW107XG4gICAgfVxuICAgIHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdLnB1c2godmFsdWUpO1xuICAgIGlmICh0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXS5sZW5ndGggPiB0aGlzLmdldFdpbmRvdygpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0uc2hpZnQoKTtcbiAgICB9XG4gIH07XG4gIHRoaXMuZ2V0VmFsdWVzID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgbWV0cmljaWQpIHtcbiAgICB2YXIgcmVzdWx0cztcbiAgICBpZiAodGhpcy52YWx1ZXNbam9iaWRdID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odiwgaykge1xuICAgICAgICBpZiAodi52YWx1ZXNbbWV0cmljaWRdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHg6IHYudGltZXN0YW1wLFxuICAgICAgICAgICAgeTogdi52YWx1ZXNbbWV0cmljaWRdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuICB0aGlzLnNldHVwTFNGb3IgPSBmdW5jdGlvbihqb2JpZCwgbm9kZWlkKSB7XG4gICAgaWYgKHRoaXMubWV0cmljc1tqb2JpZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5tZXRyaWNzW2pvYmlkXSA9IHt9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0gPSBbXTtcbiAgICB9XG4gIH07XG4gIHRoaXMuYWRkTWV0cmljID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgbWV0cmljaWQpIHtcbiAgICB0aGlzLnNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZCk7XG4gICAgdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLnB1c2goe1xuICAgICAgaWQ6IG1ldHJpY2lkLFxuICAgICAgc2l6ZTogJ3NtYWxsJyxcbiAgICAgIHZpZXc6ICdjaGFydCdcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zYXZlU2V0dXAoKTtcbiAgfTtcbiAgdGhpcy5yZW1vdmVNZXRyaWMgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgbWV0cmljKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIGlmIChfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdICE9IG51bGwpIHtcbiAgICAgICAgaSA9IF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZihtZXRyaWMpO1xuICAgICAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgICAgICBpID0gXy5maW5kSW5kZXgoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwge1xuICAgICAgICAgICAgaWQ6IG1ldHJpY1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgIF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy5zYXZlU2V0dXAoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5zZXRNZXRyaWNTaXplID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpYywgc2l6ZSkge1xuICAgICAgdmFyIGk7XG4gICAgICBpZiAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSAhPSBudWxsKSB7XG4gICAgICAgIGkgPSBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljLmlkKTtcbiAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgaSA9IF8uZmluZEluZGV4KF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHtcbiAgICAgICAgICAgIGlkOiBtZXRyaWMuaWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdW2ldID0ge1xuICAgICAgICAgICAgaWQ6IG1ldHJpYy5pZCxcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICB2aWV3OiBtZXRyaWMudmlld1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzLnNhdmVTZXR1cCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKHRoaXMpO1xuICB0aGlzLnNldE1ldHJpY1ZpZXcgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgbWV0cmljLCB2aWV3KSB7XG4gICAgICB2YXIgaTtcbiAgICAgIGlmIChfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdICE9IG51bGwpIHtcbiAgICAgICAgaSA9IF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZihtZXRyaWMuaWQpO1xuICAgICAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgICAgICBpID0gXy5maW5kSW5kZXgoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwge1xuICAgICAgICAgICAgaWQ6IG1ldHJpYy5pZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgIF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF1baV0gPSB7XG4gICAgICAgICAgICBpZDogbWV0cmljLmlkLFxuICAgICAgICAgICAgc2l6ZTogbWV0cmljLnNpemUsXG4gICAgICAgICAgICB2aWV3OiB2aWV3XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuc2F2ZVNldHVwKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHRoaXMub3JkZXJNZXRyaWNzID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgaXRlbSwgaW5kZXgpIHtcbiAgICB0aGlzLnNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZCk7XG4gICAgYW5ndWxhci5mb3JFYWNoKHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odiwgaykge1xuICAgICAgICBpZiAodi5pZCA9PT0gaXRlbS5pZCkge1xuICAgICAgICAgIF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uc3BsaWNlKGssIDEpO1xuICAgICAgICAgIGlmIChrIDwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA9IGluZGV4IC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaW5kZXgsIDAsIGl0ZW0pO1xuICAgIHJldHVybiB0aGlzLnNhdmVTZXR1cCgpO1xuICB9O1xuICB0aGlzLmdldE1ldHJpY3NTZXR1cCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihqb2JpZCwgbm9kZWlkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lczogXy5tYXAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGlkOiB2YWx1ZSxcbiAgICAgICAgICAgICAgc2l6ZTogXCJzbWFsbFwiLFxuICAgICAgICAgICAgICB2aWV3OiBcImNoYXJ0XCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH07XG4gIH0pKHRoaXMpO1xuICB0aGlzLmdldEF2YWlsYWJsZU1ldHJpY3MgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCkge1xuICAgICAgdmFyIGRlZmVycmVkO1xuICAgICAgX3RoaXMuc2V0dXBMU0Zvcihqb2JpZCwgbm9kZWlkKTtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICBpID0gX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5pbmRleE9mKHYuaWQpO1xuICAgICAgICAgIGlmIChpID09PSAtMSkge1xuICAgICAgICAgICAgaSA9IF8uZmluZEluZGV4KF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHtcbiAgICAgICAgICAgICAgaWQ6IHYuaWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzLnB1c2godik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUocmVzdWx0cyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG4gIH0pKHRoaXMpO1xuICB0aGlzLmdldEFsbEF2YWlsYWJsZU1ldHJpY3MgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCkge1xuICAgICAgdmFyIGRlZmVycmVkO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvdmVydGljZXMvXCIgKyBub2RlaWQgKyBcIi9tZXRyaWNzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHRoaXMuZ2V0TWV0cmljcyA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpY0lkcykge1xuICAgIHZhciBkZWZlcnJlZCwgaWRzO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBpZHMgPSBtZXRyaWNJZHMuam9pbihcIixcIik7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvdmVydGljZXMvXCIgKyBub2RlaWQgKyBcIi9tZXRyaWNzP2dldD1cIiArIGlkcykuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSwgcmVzdWx0O1xuICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0W3YuaWRdID0gcGFyc2VJbnQodi52YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBuZXdWYWx1ZSA9IHtcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgdmFsdWVzOiByZXN1bHRcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMuc2F2ZVZhbHVlKGpvYmlkLCBub2RlaWQsIG5ld1ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUobmV3VmFsdWUpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0V2F0ZXJtYXJrcyA9IGZ1bmN0aW9uKGppZCwgbm9kZXMpIHtcbiAgICB2YXIgZGVmZXJyZWQsIHByb21pc2VzLCByZXF1ZXN0V2F0ZXJtYXJrRm9yTm9kZSwgd2F0ZXJtYXJrcztcbiAgICByZXF1ZXN0V2F0ZXJtYXJrRm9yTm9kZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkLCBpLCBtZXRyaWNJZHM7XG4gICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgbWV0cmljSWRzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBqLCByZWYsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChpID0gaiA9IDAsIHJlZiA9IG5vZGUucGFyYWxsZWxpc20gLSAxOyAwIDw9IHJlZiA/IGogPD0gcmVmIDogaiA+PSByZWY7IGkgPSAwIDw9IHJlZiA/ICsraiA6IC0taikge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChpICsgXCIuY3VycmVudExvd1dhdGVybWFya1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KSgpO1xuICAgICAgICBfdGhpcy5nZXRNZXRyaWNzKGppZCwgbm9kZS5pZCwgbWV0cmljSWRzKS50aGVuKGZ1bmN0aW9uKG1ldHJpY3MpIHtcbiAgICAgICAgICB2YXIga2V5LCBsb3dXYXRlcm1hcmssIG1pblZhbHVlLCByZWYsIHN1YnRhc2tJbmRleCwgdmFsdWUsIHdhdGVybWFya3M7XG4gICAgICAgICAgbWluVmFsdWUgPSAwLzA7XG4gICAgICAgICAgd2F0ZXJtYXJrcyA9IHt9O1xuICAgICAgICAgIHJlZiA9IG1ldHJpY3MudmFsdWVzO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICAgICAgdmFsdWUgPSByZWZba2V5XTtcbiAgICAgICAgICAgIHN1YnRhc2tJbmRleCA9IGtleS5yZXBsYWNlKCcuY3VycmVudExvd1dhdGVybWFyaycsICcnKTtcbiAgICAgICAgICAgIHdhdGVybWFya3Nbc3VidGFza0luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzTmFOKG1pblZhbHVlKSB8fCB2YWx1ZSA8IG1pblZhbHVlKSB7XG4gICAgICAgICAgICAgIG1pblZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghaXNOYU4obWluVmFsdWUpICYmIG1pblZhbHVlID4gd2F0ZXJtYXJrc0NvbmZpZy5ub1dhdGVybWFyaykge1xuICAgICAgICAgICAgbG93V2F0ZXJtYXJrID0gbWluVmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvd1dhdGVybWFyayA9IDAvMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgXCJsb3dXYXRlcm1hcmtcIjogbG93V2F0ZXJtYXJrLFxuICAgICAgICAgICAgXCJ3YXRlcm1hcmtzXCI6IHdhdGVybWFya3NcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgd2F0ZXJtYXJrcyA9IHt9O1xuICAgIHByb21pc2VzID0gW107XG4gICAgYW5ndWxhci5mb3JFYWNoKG5vZGVzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihub2RlLCBpbmRleCkge1xuICAgICAgICB2YXIgcHI7XG4gICAgICAgIHByID0gcmVxdWVzdFdhdGVybWFya0Zvck5vZGUobm9kZSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIHdhdGVybWFya3Nbbm9kZS5pZF0gPSBkYXRhO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2VzLnB1c2gocHIpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgJHEuYWxsKHByb21pc2VzKS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh3YXRlcm1hcmtzKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldEdsb2JhbE92ZXJ2aWV3ID0gZnVuY3Rpb24oamlkLCBub2Rlcykge1xuICAgIHZhciBkZWZlcnJlZCwgZ2V0U291cmNlc0FuZFNpbmtzLCBpbmNvbWluZywgaW5jb21pbmdSLCBvdXRnb2luZywgb3V0Z29pbmdSLCBwcm9taXNlcywgcmVmLCBzaW5rcywgc291cmNlcztcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgcHJvbWlzZXMgPSBbXTtcbiAgICBnZXRTb3VyY2VzQW5kU2lua3MgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZWRlY2Vzc29ycywgc2lua3MsIHNvdXJjZXM7XG4gICAgICAgIHByZWRlY2Vzc29ycyA9IFtdO1xuICAgICAgICBzb3VyY2VzID0gW107XG4gICAgICAgIHNpbmtzID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChub2RlcywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgIGlmICghbm9kZS5pbnB1dHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2VzLnB1c2gobm9kZS5pZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVkZWNlc3NvcnMgPSBwcmVkZWNlc3NvcnMuY29uY2F0KF8ubWFwKG5vZGUuaW5wdXRzLCBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5wdXQuaWQ7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKG5vZGVzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHByZWRlY2Vzc29ycywgbm9kZS5pZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzaW5rcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbc291cmNlcywgc2lua3NdO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICByZWYgPSBnZXRTb3VyY2VzQW5kU2lua3MoKSwgc291cmNlcyA9IHJlZlswXSwgc2lua3MgPSByZWZbMV07XG4gICAgaW5jb21pbmcgPSAwO1xuICAgIG91dGdvaW5nID0gMDtcbiAgICBpbmNvbWluZ1IgPSAwO1xuICAgIG91dGdvaW5nUiA9IDA7XG4gICAgYW5ndWxhci5mb3JFYWNoKG5vZGVzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciBpLCBtZXRyaWNJZHMsIHByO1xuICAgICAgICBtZXRyaWNJZHMgPSAoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBqLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAoaSA9IGogPSAwLCByZWYxID0gbm9kZS5wYXJhbGxlbGlzbSAtIDE7IDAgPD0gcmVmMSA/IGogPD0gcmVmMSA6IGogPj0gcmVmMTsgaSA9IDAgPD0gcmVmMSA/ICsraiA6IC0taikge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChpICsgXCIubnVtQnl0ZXNJbkxvY2FsUGVyU2Vjb25kXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pKCkpLmNvbmNhdCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGosIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChpID0gaiA9IDAsIHJlZjEgPSBub2RlLnBhcmFsbGVsaXNtIC0gMTsgMCA8PSByZWYxID8gaiA8PSByZWYxIDogaiA+PSByZWYxOyBpID0gMCA8PSByZWYxID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKGkgKyBcIi5udW1CeXRlc0luUmVtb3RlUGVyU2Vjb25kXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pKCkpLmNvbmNhdCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGosIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChpID0gaiA9IDAsIHJlZjEgPSBub2RlLnBhcmFsbGVsaXNtIC0gMTsgMCA8PSByZWYxID8gaiA8PSByZWYxIDogaiA+PSByZWYxOyBpID0gMCA8PSByZWYxID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKGkgKyBcIi5udW1CeXRlc091dFBlclNlY29uZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KSgpKS5jb25jYXQoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBqLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAoaSA9IGogPSAwLCByZWYxID0gbm9kZS5wYXJhbGxlbGlzbSAtIDE7IDAgPD0gcmVmMSA/IGogPD0gcmVmMSA6IGogPj0gcmVmMTsgaSA9IDAgPD0gcmVmMSA/ICsraiA6IC0taikge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChpICsgXCIubnVtUmVjb3Jkc0luUGVyU2Vjb25kXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pKCkpLmNvbmNhdCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGosIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChpID0gaiA9IDAsIHJlZjEgPSBub2RlLnBhcmFsbGVsaXNtIC0gMTsgMCA8PSByZWYxID8gaiA8PSByZWYxIDogaiA+PSByZWYxOyBpID0gMCA8PSByZWYxID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKGkgKyBcIi5udW1SZWNvcmRzT3V0UGVyU2Vjb25kXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pKCkpO1xuICAgICAgICBwciA9IF90aGlzLmdldE1ldHJpY3MoamlkLCBub2RlLmlkLCBtZXRyaWNJZHMpLnRoZW4oZnVuY3Rpb24obWV0cmljcykge1xuICAgICAgICAgIHJldHVybiBhbmd1bGFyLmZvckVhY2goXy5rZXlzKG1ldHJpY3MudmFsdWVzKSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihcIm51bUJ5dGVzT3V0UGVyU2Vjb25kXCIpICE9PSAtMSAmJiBfLmNvbnRhaW5zKHNvdXJjZXMsIG5vZGUuaWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluY29taW5nICs9IG1ldHJpY3MudmFsdWVzW2tleV07XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5LmluZGV4T2YoXCJudW1CeXRlc0luTG9jYWxQZXJTZWNvbmRcIikgIT09IC0xICYmIF8uY29udGFpbnMoc2lua3MsIG5vZGUuaWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dGdvaW5nICs9IG1ldHJpY3MudmFsdWVzW2tleV07XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5LmluZGV4T2YoXCJudW1CeXRlc0luUmVtb3RlUGVyU2Vjb25kXCIpICE9PSAtMSAmJiBfLmNvbnRhaW5zKHNpbmtzLCBub2RlLmlkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvdXRnb2luZyArPSBtZXRyaWNzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleS5pbmRleE9mKFwibnVtUmVjb3Jkc091dFBlclNlY29uZFwiKSAhPT0gLTEgJiYgXy5jb250YWlucyhzb3VyY2VzLCBub2RlLmlkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmNvbWluZ1IgKz0gbWV0cmljcy52YWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkuaW5kZXhPZihcIm51bVJlY29yZHNJblBlclNlY29uZFwiKSAhPT0gLTEgJiYgXy5jb250YWlucyhzaW5rcywgbm9kZS5pZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0Z29pbmdSICs9IG1ldHJpY3MudmFsdWVzW2tleV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2VzLnB1c2gocHIpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgJHEuYWxsKHByb21pc2VzKS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgaW5jb21pbmc6IGluY29taW5nLFxuICAgICAgICAgIG91dGdvaW5nOiBvdXRnb2luZyxcbiAgICAgICAgICBpbmNvbWluZ1I6IGluY29taW5nUixcbiAgICAgICAgICBvdXRnb2luZ1I6IG91dGdvaW5nUixcbiAgICAgICAgICBsYXRlbmN5OiAwXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuc2V0dXBMUygpO1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdPdmVydmlld0NvbnRyb2xsZXInLCAoJHNjb3BlLCBPdmVydmlld1NlcnZpY2UsIEpvYnNTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSAtPlxuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSAtPlxuICAgICRzY29wZS5ydW5uaW5nSm9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKVxuICAgICRzY29wZS5maW5pc2hlZEpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpXG5cbiAgSm9ic1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICBKb2JzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuXG4gICRzY29wZS5qb2JPYnNlcnZlcigpXG5cbiAgT3ZlcnZpZXdTZXJ2aWNlLmxvYWRPdmVydmlldygpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YVxuXG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICBPdmVydmlld1NlcnZpY2UubG9hZE92ZXJ2aWV3KCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5vdmVydmlldyA9IGRhdGFcbiAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgJGludGVydmFsLmNhbmNlbChyZWZyZXNoKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignT3ZlcnZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBPdmVydmlld1NlcnZpY2UsIEpvYnNTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gIHZhciByZWZyZXNoO1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucnVubmluZ0pvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdydW5uaW5nJyk7XG4gICAgcmV0dXJuICRzY29wZS5maW5pc2hlZEpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpO1xuICB9O1xuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICB9KTtcbiAgJHNjb3BlLmpvYk9ic2VydmVyKCk7XG4gIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUub3ZlcnZpZXcgPSBkYXRhO1xuICAgIH0pO1xuICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICByZXR1cm4gJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnT3ZlcnZpZXdTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIG92ZXJ2aWV3ID0ge31cblxuICBAbG9hZE92ZXJ2aWV3ID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcIm92ZXJ2aWV3XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgb3ZlcnZpZXcgPSBkYXRhXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnT3ZlcnZpZXdTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgb3ZlcnZpZXc7XG4gIG92ZXJ2aWV3ID0ge307XG4gIHRoaXMubG9hZE92ZXJ2aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJvdmVydmlld1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBvdmVydmlldyA9IGRhdGE7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uY29udHJvbGxlciAnSm9iU3VibWl0Q29udHJvbGxlcicsICgkc2NvcGUsIEpvYlN1Ym1pdFNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcsICRzdGF0ZSwgJGxvY2F0aW9uKSAtPlxuICAkc2NvcGUueWFybiA9ICRsb2NhdGlvbi5hYnNVcmwoKS5pbmRleE9mKFwiL3Byb3h5L2FwcGxpY2F0aW9uX1wiKSAhPSAtMVxuICAkc2NvcGUubG9hZExpc3QgPSAoKSAtPlxuICAgIEpvYlN1Ym1pdFNlcnZpY2UubG9hZEphckxpc3QoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmFkZHJlc3MgPSBkYXRhLmFkZHJlc3NcbiAgICAgICRzY29wZS5ub2FjY2VzcyA9IGRhdGEuZXJyb3JcbiAgICAgICRzY29wZS5qYXJzID0gZGF0YS5maWxlc1xuXG4gICRzY29wZS5kZWZhdWx0U3RhdGUgPSAoKSAtPlxuICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICRzY29wZS5lcnJvciA9IG51bGxcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZDogbnVsbCxcbiAgICAgIHBhcmFsbGVsaXNtOiBcIlwiLFxuICAgICAgc2F2ZXBvaW50UGF0aDogXCJcIixcbiAgICAgIGFsbG93Tm9uUmVzdG9yZWRTdGF0ZTogZmFsc2VcbiAgICAgICdlbnRyeS1jbGFzcyc6IFwiXCIsXG4gICAgICAncHJvZ3JhbS1hcmdzJzogXCJcIixcbiAgICAgICdwbGFuLWJ1dHRvbic6IFwiU2hvdyBQbGFuXCIsXG4gICAgICAnc3VibWl0LWJ1dHRvbic6IFwiU3VibWl0XCIsXG4gICAgICAnYWN0aW9uLXRpbWUnOiAwXG4gICAgfVxuXG4gICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAkc2NvcGUudXBsb2FkZXIgPSB7fVxuICAkc2NvcGUubG9hZExpc3QoKVxuXG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICAkc2NvcGUubG9hZExpc3QoKVxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG5cbiAgJHNjb3BlLnNlbGVjdEphciA9IChpZCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT0gaWRcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAgIGVsc2VcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAgICAgJHNjb3BlLnN0YXRlLnNlbGVjdGVkID0gaWRcblxuICAkc2NvcGUuZGVsZXRlSmFyID0gKGV2ZW50LCBpZCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT0gaWRcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAgIGFuZ3VsYXIuZWxlbWVudChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImZhLXJlbW92ZVwiKS5hZGRDbGFzcyhcImZhLXNwaW4gZmEtc3Bpbm5lclwiKVxuICAgIEpvYlN1Ym1pdFNlcnZpY2UuZGVsZXRlSmFyKGlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgYW5ndWxhci5lbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zcGlubmVyXCIpLmFkZENsYXNzKFwiZmEtcmVtb3ZlXCIpXG4gICAgICBpZiBkYXRhLmVycm9yP1xuICAgICAgICBhbGVydChkYXRhLmVycm9yKVxuXG4gICRzY29wZS5sb2FkRW50cnlDbGFzcyA9IChuYW1lKSAtPlxuICAgICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSA9IG5hbWVcblxuICAkc2NvcGUuZ2V0UGxhbiA9ICgpIC0+XG4gICAgaWYgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID09IFwiU2hvdyBQbGFuXCJcbiAgICAgIGFjdGlvbiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb25cbiAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIlxuICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJHZXR0aW5nIFBsYW5cIlxuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbFxuICAgICAgJHNjb3BlLnBsYW4gPSBudWxsXG4gICAgICBKb2JTdWJtaXRTZXJ2aWNlLmdldFBsYW4oXG4gICAgICAgICRzY29wZS5zdGF0ZS5zZWxlY3RlZCwge1xuICAgICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgICBwYXJhbGxlbGlzbTogJHNjb3BlLnN0YXRlLnBhcmFsbGVsaXNtLFxuICAgICAgICAgICdwcm9ncmFtLWFyZ3MnOiAkc2NvcGUuc3RhdGVbJ3Byb2dyYW0tYXJncyddXG4gICAgICAgIH1cbiAgICAgICkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgaWYgYWN0aW9uID09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXVxuICAgICAgICAgICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9IFwiU2hvdyBQbGFuXCJcbiAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBkYXRhLmVycm9yXG4gICAgICAgICAgJHNjb3BlLnBsYW4gPSBkYXRhLnBsYW5cblxuICAkc2NvcGUucnVuSm9iID0gKCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9PSBcIlN1Ym1pdFwiXG4gICAgICBhY3Rpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgICAgJHNjb3BlLnN0YXRlWydhY3Rpb24tdGltZSddID0gYWN0aW9uXG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0dGluZ1wiXG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiXG4gICAgICAkc2NvcGUuZXJyb3IgPSBudWxsXG4gICAgICBKb2JTdWJtaXRTZXJ2aWNlLnJ1bkpvYihcbiAgICAgICAgJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICAgJ2VudHJ5LWNsYXNzJzogJHNjb3BlLnN0YXRlWydlbnRyeS1jbGFzcyddLFxuICAgICAgICAgIHBhcmFsbGVsaXNtOiAkc2NvcGUuc3RhdGUucGFyYWxsZWxpc20sXG4gICAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ10sXG4gICAgICAgICAgc2F2ZXBvaW50UGF0aDogJHNjb3BlLnN0YXRlWydzYXZlcG9pbnRQYXRoJ10sXG4gICAgICAgICAgYWxsb3dOb25SZXN0b3JlZFN0YXRlOiAkc2NvcGUuc3RhdGVbJ2FsbG93Tm9uUmVzdG9yZWRTdGF0ZSddXG4gICAgICAgIH1cbiAgICAgICkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgaWYgYWN0aW9uID09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXVxuICAgICAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIlxuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3JcbiAgICAgICAgICBpZiBkYXRhLmpvYmlkP1xuICAgICAgICAgICAgJHN0YXRlLmdvKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtqb2JpZDogZGF0YS5qb2JpZH0pXG5cbiAgIyBqb2IgcGxhbiBkaXNwbGF5IHJlbGF0ZWQgc3R1ZmZcbiAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSAobm9kZWlkKSAtPlxuICAgIGlmIG5vZGVpZCAhPSAkc2NvcGUubm9kZWlkXG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkXG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcblxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAgIGVsc2VcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2VcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuXG4gICRzY29wZS5jbGVhckZpbGVzID0gKCkgLT5cbiAgICAkc2NvcGUudXBsb2FkZXIgPSB7fVxuXG4gICRzY29wZS51cGxvYWRGaWxlcyA9IChmaWxlcykgLT5cbiAgICAjIG1ha2Ugc3VyZSBldmVyeXRoaW5nIGlzIGNsZWFyIGFnYWluLlxuICAgICRzY29wZS51cGxvYWRlciA9IHt9XG4gICAgaWYgZmlsZXMubGVuZ3RoID09IDFcbiAgICAgICRzY29wZS51cGxvYWRlclsnZmlsZSddID0gZmlsZXNbMF1cbiAgICAgICRzY29wZS51cGxvYWRlclsndXBsb2FkJ10gPSB0cnVlXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gXCJEaWQgeWEgZm9yZ2V0IHRvIHNlbGVjdCBhIGZpbGU/XCJcblxuICAkc2NvcGUuc3RhcnRVcGxvYWQgPSAoKSAtPlxuICAgIGlmICRzY29wZS51cGxvYWRlclsnZmlsZSddP1xuICAgICAgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZm9ybWRhdGEuYXBwZW5kKFwiamFyZmlsZVwiLCAkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXSlcbiAgICAgICRzY29wZS51cGxvYWRlclsndXBsb2FkJ10gPSBmYWxzZVxuICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIkluaXRpYWxpemluZyB1cGxvYWQuLi5cIlxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsXG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IHBhcnNlSW50KDEwMCAqIGV2ZW50LmxvYWRlZCAvIGV2ZW50LnRvdGFsKVxuICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gKGV2ZW50KSAtPlxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3Byb2dyZXNzJ10gPSBudWxsXG4gICAgICAgICRzY29wZS51cGxvYWRlclsnZXJyb3InXSA9IFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdXBsb2FkaW5nIHlvdXIgZmlsZVwiXG4gICAgICB4aHIudXBsb2FkLm9ubG9hZCA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gbnVsbFxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiU2F2aW5nLi4uXCJcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgICAgICBpZiB4aHIucmVhZHlTdGF0ZSA9PSA0XG4gICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3I/XG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSByZXNwb25zZS5lcnJvclxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlVwbG9hZGVkIVwiXG4gICAgICB4aHIub3BlbihcIlBPU1RcIiwgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqYXJzL3VwbG9hZFwiKVxuICAgICAgeGhyLnNlbmQoZm9ybWRhdGEpXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2coXCJVbmV4cGVjdGVkIEVycm9yLiBUaGlzIHNob3VsZCBub3QgaGFwcGVuXCIpXG5cbi5maWx0ZXIgJ2dldEphclNlbGVjdENsYXNzJywgLT5cbiAgKHNlbGVjdGVkLCBhY3R1YWwpIC0+XG4gICAgaWYgc2VsZWN0ZWQgPT0gYWN0dWFsXG4gICAgICBcImZhLWNoZWNrLXNxdWFyZVwiXG4gICAgZWxzZVxuICAgICAgXCJmYS1zcXVhcmUtb1wiXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5jb250cm9sbGVyKCdKb2JTdWJtaXRDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JTdWJtaXRTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnLCAkc3RhdGUsICRsb2NhdGlvbikge1xuICB2YXIgcmVmcmVzaDtcbiAgJHNjb3BlLnlhcm4gPSAkbG9jYXRpb24uYWJzVXJsKCkuaW5kZXhPZihcIi9wcm94eS9hcHBsaWNhdGlvbl9cIikgIT09IC0xO1xuICAkc2NvcGUubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9iU3VibWl0U2VydmljZS5sb2FkSmFyTGlzdCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLmFkZHJlc3MgPSBkYXRhLmFkZHJlc3M7XG4gICAgICAkc2NvcGUubm9hY2Nlc3MgPSBkYXRhLmVycm9yO1xuICAgICAgcmV0dXJuICRzY29wZS5qYXJzID0gZGF0YS5maWxlcztcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmRlZmF1bHRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wbGFuID0gbnVsbDtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgIHJldHVybiAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZDogbnVsbCxcbiAgICAgIHBhcmFsbGVsaXNtOiBcIlwiLFxuICAgICAgc2F2ZXBvaW50UGF0aDogXCJcIixcbiAgICAgIGFsbG93Tm9uUmVzdG9yZWRTdGF0ZTogZmFsc2UsXG4gICAgICAnZW50cnktY2xhc3MnOiBcIlwiLFxuICAgICAgJ3Byb2dyYW0tYXJncyc6IFwiXCIsXG4gICAgICAncGxhbi1idXR0b24nOiBcIlNob3cgUGxhblwiLFxuICAgICAgJ3N1Ym1pdC1idXR0b24nOiBcIlN1Ym1pdFwiLFxuICAgICAgJ2FjdGlvbi10aW1lJzogMFxuICAgIH07XG4gIH07XG4gICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgJHNjb3BlLnVwbG9hZGVyID0ge307XG4gICRzY29wZS5sb2FkTGlzdCgpO1xuICByZWZyZXNoID0gJGludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUubG9hZExpc3QoKTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG4gICRzY29wZS5zZWxlY3RKYXIgPSBmdW5jdGlvbihpZCkge1xuICAgIGlmICgkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT09IGlkKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLmRlZmF1bHRTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUuZGVmYXVsdFN0YXRlKCk7XG4gICAgICByZXR1cm4gJHNjb3BlLnN0YXRlLnNlbGVjdGVkID0gaWQ7XG4gICAgfVxuICB9O1xuICAkc2NvcGUuZGVsZXRlSmFyID0gZnVuY3Rpb24oZXZlbnQsIGlkKSB7XG4gICAgaWYgKCRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9PT0gaWQpIHtcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgICB9XG4gICAgYW5ndWxhci5lbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiZmEtcmVtb3ZlXCIpLmFkZENsYXNzKFwiZmEtc3BpbiBmYS1zcGlubmVyXCIpO1xuICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmRlbGV0ZUphcihpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXNwaW5uZXJcIikuYWRkQ2xhc3MoXCJmYS1yZW1vdmVcIik7XG4gICAgICBpZiAoZGF0YS5lcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhbGVydChkYXRhLmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmxvYWRFbnRyeUNsYXNzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiAkc2NvcGUuc3RhdGVbJ2VudHJ5LWNsYXNzJ10gPSBuYW1lO1xuICB9O1xuICAkc2NvcGUuZ2V0UGxhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3Rpb247XG4gICAgaWYgKCRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9PT0gXCJTaG93IFBsYW5cIikge1xuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb247XG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCI7XG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIkdldHRpbmcgUGxhblwiO1xuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICRzY29wZS5wbGFuID0gbnVsbDtcbiAgICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmdldFBsYW4oJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ11cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoYWN0aW9uID09PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10pIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiO1xuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3I7XG4gICAgICAgICAgcmV0dXJuICRzY29wZS5wbGFuID0gZGF0YS5wbGFuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5ydW5Kb2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0aW9uO1xuICAgIGlmICgkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9PT0gXCJTdWJtaXRcIikge1xuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb247XG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0dGluZ1wiO1xuICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJTaG93IFBsYW5cIjtcbiAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgICByZXR1cm4gSm9iU3VibWl0U2VydmljZS5ydW5Kb2IoJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ10sXG4gICAgICAgIHNhdmVwb2ludFBhdGg6ICRzY29wZS5zdGF0ZVsnc2F2ZXBvaW50UGF0aCddLFxuICAgICAgICBhbGxvd05vblJlc3RvcmVkU3RhdGU6ICRzY29wZS5zdGF0ZVsnYWxsb3dOb25SZXN0b3JlZFN0YXRlJ11cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoYWN0aW9uID09PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10pIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCI7XG4gICAgICAgICAgJHNjb3BlLmVycm9yID0gZGF0YS5lcnJvcjtcbiAgICAgICAgICBpZiAoZGF0YS5qb2JpZCAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJHN0YXRlLmdvKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtcbiAgICAgICAgICAgICAgam9iaWQ6IGRhdGEuam9iaWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICBpZiAobm9kZWlkICE9PSAkc2NvcGUubm9kZWlkKSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkO1xuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGw7XG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsO1xuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgICByZXR1cm4gJHNjb3BlLiRicm9hZGNhc3QoJ3JlbG9hZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZTtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICB9XG4gIH07XG4gICRzY29wZS5jbGVhckZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS51cGxvYWRlciA9IHt9O1xuICB9O1xuICAkc2NvcGUudXBsb2FkRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICRzY29wZS51cGxvYWRlciA9IHt9O1xuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICRzY29wZS51cGxvYWRlclsnZmlsZSddID0gZmlsZXNbMF07XG4gICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWyd1cGxvYWQnXSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkRpZCB5YSBmb3JnZXQgdG8gc2VsZWN0IGEgZmlsZT9cIjtcbiAgICB9XG4gIH07XG4gIHJldHVybiAkc2NvcGUuc3RhcnRVcGxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWRhdGEsIHhocjtcbiAgICBpZiAoJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10gIT0gbnVsbCkge1xuICAgICAgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZvcm1kYXRhLmFwcGVuZChcImphcmZpbGVcIiwgJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10pO1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWyd1cGxvYWQnXSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIkluaXRpYWxpemluZyB1cGxvYWQuLi5cIjtcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsO1xuICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gcGFyc2VJbnQoMTAwICogZXZlbnQubG9hZGVkIC8gZXZlbnQudG90YWwpO1xuICAgICAgfTtcbiAgICAgIHhoci51cGxvYWQub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHVwbG9hZGluZyB5b3VyIGZpbGVcIjtcbiAgICAgIH07XG4gICAgICB4aHIudXBsb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiU2F2aW5nLi4uXCI7XG4gICAgICB9O1xuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gcmVzcG9uc2UuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlVwbG9hZGVkIVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHhoci5vcGVuKFwiUE9TVFwiLCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImphcnMvdXBsb2FkXCIpO1xuICAgICAgcmV0dXJuIHhoci5zZW5kKGZvcm1kYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBFcnJvci4gVGhpcyBzaG91bGQgbm90IGhhcHBlblwiKTtcbiAgICB9XG4gIH07XG59KS5maWx0ZXIoJ2dldEphclNlbGVjdENsYXNzJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihzZWxlY3RlZCwgYWN0dWFsKSB7XG4gICAgaWYgKHNlbGVjdGVkID09PSBhY3R1YWwpIHtcbiAgICAgIHJldHVybiBcImZhLWNoZWNrLXNxdWFyZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJmYS1zcXVhcmUtb1wiO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JTdWJtaXRTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG5cbiAgQGxvYWRKYXJMaXN0ID0gKCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImphcnMvXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBkZWxldGVKYXIgPSAoaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5kZWxldGUoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqYXJzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KGlkKSlcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRQbGFuID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9wbGFuXCIsIHtwYXJhbXM6IGFyZ3N9KVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAcnVuSm9iID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAucG9zdChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImphcnMvXCIgKyBlbmNvZGVVUklDb21wb25lbnQoaWQpICsgXCIvcnVuXCIsIHt9LCB7cGFyYW1zOiBhcmdzfSlcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnSm9iU3VibWl0U2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkSmFyTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZGVsZXRlSmFyID0gZnVuY3Rpb24oaWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwW1wiZGVsZXRlXCJdKGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldFBsYW4gPSBmdW5jdGlvbihpZCwgYXJncykge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9wbGFuXCIsIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLnJ1bkpvYiA9IGZ1bmN0aW9uKGlkLCBhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5wb3N0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9ydW5cIiwge30sIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdBbGxUYXNrTWFuYWdlcnNDb250cm9sbGVyJywgKCRzY29wZSwgVGFza01hbmFnZXJzU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5tYW5hZ2VycyA9IGRhdGFcblxuICByZWZyZXNoID0gJGludGVydmFsIC0+XG4gICAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLm1hbmFnZXJzID0gZGF0YVxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlckNvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLm1ldHJpY3MgPSB7fVxuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZE1ldHJpY3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUubWV0cmljcyA9IGRhdGFbMF1cblxuICAgIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICAgIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTWV0cmljcygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdXG4gICAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAgICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaClcblxuLmNvbnRyb2xsZXIgJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLmxvZyA9IHt9XG4gICRzY29wZS50YXNrbWFuYWdlcmlkID0gJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWRcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5sb2cgPSBkYXRhXG5cbiAgJHNjb3BlLnJlbG9hZERhdGEgPSAoKSAtPlxuICAgIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTG9ncygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5sb2cgPSBkYXRhXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLnN0ZG91dCA9IHt9XG4gICRzY29wZS50YXNrbWFuYWdlcmlkID0gJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWRcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRTdGRvdXQoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLnN0ZG91dCA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRTdGRvdXQoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuc3Rkb3V0ID0gZGF0YVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgVGFza01hbmFnZXJzU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICB2YXIgcmVmcmVzaDtcbiAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm1hbmFnZXJzID0gZGF0YTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFRhc2tNYW5hZ2Vyc1NlcnZpY2UubG9hZE1hbmFnZXJzKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLm1hbmFnZXJzID0gZGF0YTtcbiAgICB9KTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgcmV0dXJuICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignU2luZ2xlVGFza01hbmFnZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICB2YXIgcmVmcmVzaDtcbiAgJHNjb3BlLm1ldHJpY3MgPSB7fTtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdO1xuICB9KTtcbiAgcmVmcmVzaCA9ICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUubWV0cmljcyA9IGRhdGFbMF07XG4gICAgfSk7XG4gIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gICRzY29wZS5sb2cgPSB7fTtcbiAgJHNjb3BlLnRhc2ttYW5hZ2VyaWQgPSAkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZDtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLmxvZyA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLnJlbG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUubG9nID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZVRhc2tNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIHtcbiAgJHNjb3BlLnN0ZG91dCA9IHt9O1xuICAkc2NvcGUudGFza21hbmFnZXJpZCA9ICRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkO1xuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZFN0ZG91dCgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICRzY29wZS5zdGRvdXQgPSBkYXRhO1xuICB9KTtcbiAgcmV0dXJuICRzY29wZS5yZWxvYWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkU3Rkb3V0KCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuc3Rkb3V0ID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdUYXNrTWFuYWdlcnNTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIEBsb2FkTWFuYWdlcnMgPSAoKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgQGxvYWRNZXRyaWNzID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YVsndGFza21hbmFnZXJzJ10pXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGxvYWRMb2dzID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvbG9nXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBsb2FkU3Rkb3V0ID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvc3Rkb3V0XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnVGFza01hbmFnZXJzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkTWFuYWdlcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcInRhc2ttYW5hZ2Vyc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB0aGlzLmxvYWRNZXRyaWNzID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YVsndGFza21hbmFnZXJzJ10pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmxvYWRMb2dzID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL2xvZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5sb2FkU3Rkb3V0ID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL3N0ZG91dFwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiJdfQ==
