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
  $stateProvider.state("overview", {
    url: "/overview",
    views: {
      main: {
        templateUrl: "partials/overview.html",
        controller: 'OverviewController'
      }
    }
  }).state("running-jobs", {
    url: "/running-jobs",
    views: {
      main: {
        templateUrl: "partials/jobs/running-jobs.html",
        controller: 'RunningJobsController'
      }
    }
  }).state("completed-jobs", {
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
  }).state("all-manager", {
    url: "/taskmanagers",
    views: {
      main: {
        templateUrl: "partials/taskmanager/index.html",
        controller: 'AllTaskManagersController'
      }
    }
  }).state("single-manager", {
    url: "/taskmanager/{taskmanagerid}",
    abstract: true,
    views: {
      main: {
        templateUrl: "partials/taskmanager/taskmanager.html",
        controller: 'SingleTaskManagerController'
      }
    }
  }).state("single-manager.metrics", {
    url: "/metrics",
    views: {
      details: {
        templateUrl: "partials/taskmanager/taskmanager.metrics.html"
      }
    }
  }).state("single-manager.stdout", {
    url: "/stdout",
    views: {
      details: {
        templateUrl: "partials/taskmanager/taskmanager.stdout.html",
        controller: 'SingleTaskManagerStdoutController'
      }
    }
  }).state("single-manager.log", {
    url: "/log",
    views: {
      details: {
        templateUrl: "partials/taskmanager/taskmanager.log.html",
        controller: 'SingleTaskManagerLogsController'
      }
    }
  }).state("jobmanager", {
    url: "/jobmanager",
    views: {
      main: {
        templateUrl: "partials/jobmanager/index.html"
      }
    }
  }).state("jobmanager.config", {
    url: "/config",
    views: {
      details: {
        templateUrl: "partials/jobmanager/config.html",
        controller: 'JobManagerConfigController'
      }
    }
  }).state("jobmanager.stdout", {
    url: "/stdout",
    views: {
      details: {
        templateUrl: "partials/jobmanager/stdout.html",
        controller: 'JobManagerStdoutController'
      }
    }
  }).state("jobmanager.log", {
    url: "/log",
    views: {
      details: {
        templateUrl: "partials/jobmanager/log.html",
        controller: 'JobManagerLogsController'
      }
    }
  }).state("submit", {
    url: "/submit",
    views: {
      main: {
        templateUrl: "partials/submit.html",
        controller: "JobSubmitController"
      }
    }
  });
  return $urlRouterProvider.otherwise("/overview");
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
}).filter("humanizeBytes", function() {
  return function(bytes) {
    var converter, units;
    units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
    converter = function(value, power) {
      var base;
      base = Math.pow(1024, power);
      if (value < base) {
        return (value / base).toFixed(2) + " " + units[power];
      } else if (value < base * 1000) {
        return (value / base).toPrecision(3) + " " + units[power];
      } else {
        return converter(value, power + 1);
      }
    };
    if (typeof bytes === "undefined" || bytes === null) {
      return "";
    }
    if (bytes < 1000) {
      return bytes + " B";
    } else {
      return converter(bytes, 1);
    }
  };
}).filter("toLocaleString", function() {
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
}]);

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
  refresher = $interval(function() {
    return JobsService.loadJob($stateParams.jobid).then(function(data) {
      $scope.job = data;
      MetricsService.getWatermarks($scope.job.jid, $scope.plan.nodes).then(function(data) {
        return $scope.watermarks = data;
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
    return MetricsService.getWatermarks($scope.job.jid, $scope.plan.nodes).then(function(data) {
      return $scope.watermarks = data;
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
}]).directive('globalOverview', ["$timeout", function($timeout) {
  return {
    template: "<div class='global-overview'> <table class='table table-properties'> <thead> <tr> <th colspan='2'>Global Overview</th> </tr> </thead> <tbody> <tr> <td>Incoming</td> <td class='right'>{{incoming}}</td> </tr> <tr> <td>Outgoing</td> <td class='right'>{{outgoing}}</td> </tr> </tbody> </table> </div>",
    scope: {
      job: '='
    },
    link: function(scope, elem, attrs) {
      scope.incoming = 0;
      scope.outgoing = 0;
      scope.$watch(attrs.job, function(data) {
        scope.predecessors = [];
        scope.sources = [];
        scope.sinks = [];
        if (data) {
          console.log(data.plan.nodes);
          angular.forEach(data.plan.nodes, function(node) {
            if (!node.inputs) {
              return scope.sources.push(node.id);
            } else {
              return scope.predecessors = scope.predecessors.concat(_.map(node.inputs, function(input) {
                return input.id;
              }));
            }
          });
          console.log(scope.sources);
          angular.forEach(data.plan.nodes, function(node) {
            if (!_.contains(scope.predecessors, node.id)) {
              return scope.sinks.push(node.id);
            }
          });
          return console.log(scope.sinks);
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
    var deferred, len, requestWatermarkForNode, watermarks;
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
    len = nodes.length;
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
    var deferred, getSourcesAndSinks, incoming, outgoing, promises, ref, sinks, sources;
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
    angular.forEach(nodes, (function(_this) {
      return function(node) {
        var i, metricIds, pr;
        metricIds = ((function() {
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
            results1.push(i + ".numBytesInPerSecond");
          }
          return results1;
        })());
        pr = _this.getMetrics(jid, node.id, metricIds).then(function(metrics) {
          return angular.forEach(_.keys(metrics.values), (function(_this) {
            return function(key) {
              if (key.indexOf("numBytesOutPerSecond") !== -1 && _.contains(sources, node.id)) {
                return outgoing += metrics.values[key];
              } else if (key.indexOf("numBytesInPerSecond") !== -1 && _.contains(sinks, node.id)) {
                return incoming += metrics.values[key];
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
          outgoing: outgoing
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsImluZGV4LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMuY29mZmVlIiwiY29tbW9uL2RpcmVjdGl2ZXMuanMiLCJjb21tb24vZmlsdGVycy5jb2ZmZWUiLCJjb21tb24vZmlsdGVycy5qcyIsImNvbW1vbi9zZXJ2aWNlcy5jb2ZmZWUiLCJjb21tb24vc2VydmljZXMuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvam9ibWFuYWdlci9qb2JtYW5hZ2VyLmN0cmwuanMiLCJtb2R1bGVzL2pvYm1hbmFnZXIvam9ibWFuYWdlci5zdmMuY29mZmVlIiwibW9kdWxlcy9qb2JtYW5hZ2VyL2pvYm1hbmFnZXIuc3ZjLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5jdHJsLmpzIiwibW9kdWxlcy9qb2JzL2pvYnMuZGlyLmNvZmZlZSIsIm1vZHVsZXMvam9icy9qb2JzLmRpci5qcyIsIm1vZHVsZXMvam9icy9qb2JzLnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL2pvYnMvam9icy5zdmMuanMiLCJtb2R1bGVzL2pvYnMvbWV0cmljcy5kaXIuY29mZmVlIiwibW9kdWxlcy9qb2JzL21ldHJpY3MuZGlyLmpzIiwibW9kdWxlcy9qb2JzL21ldHJpY3Muc3ZjLmNvZmZlZSIsIm1vZHVsZXMvam9icy9tZXRyaWNzLnN2Yy5qcyIsIm1vZHVsZXMvb3ZlcnZpZXcvb3ZlcnZpZXcuY3RybC5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LmN0cmwuanMiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL292ZXJ2aWV3L292ZXJ2aWV3LnN2Yy5qcyIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvc3VibWl0L3N1Ym1pdC5jdHJsLmpzIiwibW9kdWxlcy9zdWJtaXQvc3VibWl0LnN2Yy5jb2ZmZWUiLCJtb2R1bGVzL3N1Ym1pdC9zdWJtaXQuc3ZjLmpzIiwibW9kdWxlcy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5jdHJsLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuY3RybC5qcyIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmNvZmZlZSIsIm1vZHVsZXMvdGFza21hbmFnZXIvdGFza21hbmFnZXIuc3ZjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCQSxRQUFRLE9BQU8sWUFBWSxDQUFDLGFBQWEsaUJBQWlCLGFBSXpELG1CQUFJLFNBQUMsWUFBRDtFQUNILFdBQVcsaUJBQWlCO0VDckI1QixPRHNCQSxXQUFXLGNBQWMsV0FBQTtJQUN2QixXQUFXLGlCQUFpQixDQUFDLFdBQVc7SUNyQnhDLE9Ec0JBLFdBQVcsZUFBZTs7SUFJN0IsTUFBTSxlQUFlO0VBQ3BCLFdBQVc7RUFFWCxvQkFBb0I7R0FLckIsTUFBTSxvQkFBb0I7RUFJekIsYUFBYSxDQUFDO0dBS2YsK0RBQUksU0FBQyxhQUFhLGFBQWEsYUFBYSxXQUF4QztFQ25DSCxPRG9DQSxZQUFZLGFBQWEsS0FBSyxTQUFDLFFBQUQ7SUFDNUIsUUFBUSxPQUFPLGFBQWE7SUFFNUIsWUFBWTtJQ3BDWixPRHNDQSxVQUFVLFdBQUE7TUNyQ1IsT0RzQ0EsWUFBWTtPQUNaLFlBQVk7O0lBSWpCLGlDQUFPLFNBQUMsdUJBQUQ7RUN2Q04sT0R3Q0Esc0JBQXNCO0lBSXZCLDZCQUFJLFNBQUMsWUFBWSxRQUFiO0VDMUNILE9EMkNBLFdBQVcsSUFBSSxxQkFBcUIsU0FBQyxPQUFPLFNBQVMsVUFBVSxXQUEzQjtJQUNsQyxJQUFHLFFBQVEsWUFBWDtNQUNFLE1BQU07TUMxQ04sT0QyQ0EsT0FBTyxHQUFHLFFBQVEsWUFBWTs7O0lBSW5DLGdEQUFPLFNBQUMsZ0JBQWdCLG9CQUFqQjtFQUNOLGVBQWUsTUFBTSxZQUNuQjtJQUFBLEtBQUs7SUFDTCxPQUNFO01BQUEsTUFDRTtR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QUFXLFNBQUMsZUFBRDtJQUNWLElBQUE7SUFBQSxXQUFXLEdBQUc7SUFFZCxNQUFNLElBQUksWUFBWSxZQUFZLGtCQUFrQixnQkFBZ0IsUUFDbkUsUUFBUSxTQUFDLE1BQU0sUUFBUSxTQUFTLFFBQXhCO01DdkJQLE9Ed0JBLFNBQVMsUUFBUTs7SUN0Qm5CLE9Ed0JBLFNBQVM7O0VBRVgsS0FBQyxhQUFhLFNBQUMsZUFBRDtJQUNaLElBQUE7SUFBQSxXQUFXLEdBQUc7SUFFZCxNQUFNLElBQUksWUFBWSxZQUFZLGtCQUFrQixnQkFBZ0IsV0FDbkUsUUFBUSxTQUFDLE1BQU0sUUFBUSxTQUFTLFFBQXhCO01DeEJQLE9EeUJBLFNBQVMsUUFBUTs7SUN2Qm5CLE9EeUJBLFNBQVM7O0VDdkJYLE9EeUJBOztBQ3ZCRiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnLCBbJ3VpLnJvdXRlcicsICdhbmd1bGFyTW9tZW50JywgJ2RuZExpc3RzJ10pXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnJ1biAoJHJvb3RTY29wZSkgLT5cbiAgJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZSA9IGZhbHNlXG4gICRyb290U2NvcGUuc2hvd1NpZGViYXIgPSAtPlxuICAgICRyb290U2NvcGUuc2lkZWJhclZpc2libGUgPSAhJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZVxuICAgICRyb290U2NvcGUuc2lkZWJhckNsYXNzID0gJ2ZvcmNlLXNob3cnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnZhbHVlICdmbGlua0NvbmZpZycsIHtcbiAgam9iU2VydmVyOiAnJ1xuIyAgam9iU2VydmVyOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxLydcbiAgXCJyZWZyZXNoLWludGVydmFsXCI6IDEwMDAwXG59XG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnZhbHVlICd3YXRlcm1hcmtzQ29uZmlnJywge1xuICAjIEEgdmFsdWUgb2YgKEphdmEpIExvbmcuTUlOX1ZBTFVFIGluZGljYXRlcyB0aGF0IHRoZXJlIGlzIG5vIHdhdGVybWFya1xuICAjIGF2YWlsYWJsZS4gVGhpcyBpcyBwYXJzZWQgYnkgSmF2YXNjcmlwdCBhcyB0aGlzIG51bWJlci4gV2UgaGF2ZSBpdCBhc1xuICAjIGEgY29uc3RhbnQgaGVyZSB0byBjb21wYXJlIGF2YWlsYWJsZSB3YXRlcm1hcmtzIGFnYWluc3QuXG4gIG5vV2F0ZXJtYXJrOiAtOTIyMzM3MjAzNjg1NDc3NjAwMFxufVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5ydW4gKEpvYnNTZXJ2aWNlLCBNYWluU2VydmljZSwgZmxpbmtDb25maWcsICRpbnRlcnZhbCkgLT5cbiAgTWFpblNlcnZpY2UubG9hZENvbmZpZygpLnRoZW4gKGNvbmZpZykgLT5cbiAgICBhbmd1bGFyLmV4dGVuZCBmbGlua0NvbmZpZywgY29uZmlnXG5cbiAgICBKb2JzU2VydmljZS5saXN0Sm9icygpXG5cbiAgICAkaW50ZXJ2YWwgLT5cbiAgICAgIEpvYnNTZXJ2aWNlLmxpc3RKb2JzKClcbiAgICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb25maWcgKCR1aVZpZXdTY3JvbGxQcm92aWRlcikgLT5cbiAgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLnJ1biAoJHJvb3RTY29wZSwgJHN0YXRlKSAtPlxuICAkcm9vdFNjb3BlLiRvbiAnJHN0YXRlQ2hhbmdlU3RhcnQnLCAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUpIC0+XG4gICAgaWYgdG9TdGF0ZS5yZWRpcmVjdFRvXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAkc3RhdGUuZ28gdG9TdGF0ZS5yZWRpcmVjdFRvLCB0b1BhcmFtc1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb25maWcgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIC0+XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlIFwib3ZlcnZpZXdcIixcbiAgICB1cmw6IFwiL292ZXJ2aWV3XCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL292ZXJ2aWV3Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnT3ZlcnZpZXdDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInJ1bm5pbmctam9ic1wiLFxuICAgIHVybDogXCIvcnVubmluZy1qb2JzXCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvcnVubmluZy1qb2JzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnUnVubmluZ0pvYnNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcImNvbXBsZXRlZC1qb2JzXCIsXG4gICAgdXJsOiBcIi9jb21wbGV0ZWQtam9ic1wiXG4gICAgdmlld3M6XG4gICAgICBtYWluOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2NvbXBsZXRlZC1qb2JzLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnQ29tcGxldGVkSm9ic0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYlwiLFxuICAgIHVybDogXCIvam9icy97am9iaWR9XCJcbiAgICBhYnN0cmFjdDogdHJ1ZVxuICAgIHZpZXdzOlxuICAgICAgbWFpbjpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVKb2JDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhblwiLFxuICAgIHVybDogXCJcIlxuICAgIHJlZGlyZWN0VG86IFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4uaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uc3VidGFza3NcIixcbiAgICB1cmw6IFwiXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5zdWJ0YXNrcy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5TdWJ0YXNrc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLm1ldHJpY3NcIixcbiAgICB1cmw6IFwiL21ldHJpY3NcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0Lm1ldHJpY3MuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuTWV0cmljc0NvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLndhdGVybWFya3NcIixcbiAgICB1cmw6IFwiL3dhdGVybWFya3NcIlxuICAgIHZpZXdzOlxuICAgICAgJ25vZGUtZGV0YWlscyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LndhdGVybWFya3MuaHRtbFwiXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5wbGFuLmFjY3VtdWxhdG9yc1wiLFxuICAgIHVybDogXCIvYWNjdW11bGF0b3JzXCJcbiAgICB2aWV3czpcbiAgICAgICdub2RlLWRldGFpbHMnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5hY2N1bXVsYXRvcnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHNcIixcbiAgICB1cmw6IFwiL2NoZWNrcG9pbnRzXCJcbiAgICByZWRpcmVjdFRvOiBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5vdmVydmlld1wiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuY2hlY2twb2ludHMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5vdmVydmlld1wiLFxuICAgIHVybDogXCIvb3ZlcnZpZXdcIlxuICAgIHZpZXdzOlxuICAgICAgJ2NoZWNrcG9pbnRzLXZpZXcnOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUuY2hlY2twb2ludHMub3ZlcnZpZXcuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5zdW1tYXJ5XCIsXG4gICAgdXJsOiBcIi9zdW1tYXJ5XCJcbiAgICB2aWV3czpcbiAgICAgICdjaGVja3BvaW50cy12aWV3JzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLnN1bW1hcnkuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5oaXN0b3J5XCIsXG4gICAgdXJsOiBcIi9oaXN0b3J5XCJcbiAgICB2aWV3czpcbiAgICAgICdjaGVja3BvaW50cy12aWV3JzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLmhpc3RvcnkuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5jb25maWdcIixcbiAgICB1cmw6IFwiL2NvbmZpZ1wiXG4gICAgdmlld3M6XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS5jaGVja3BvaW50cy5jb25maWcuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5jaGVja3BvaW50cy5kZXRhaWxzXCIsXG4gICAgdXJsOiBcIi9kZXRhaWxzL3tjaGVja3BvaW50SWR9XCJcbiAgICB2aWV3czpcbiAgICAgICdjaGVja3BvaW50cy12aWV3JzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLmRldGFpbHMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQ2hlY2twb2ludERldGFpbHNDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcInNpbmdsZS1qb2IucGxhbi5iYWNrcHJlc3N1cmVcIixcbiAgICB1cmw6IFwiL2JhY2twcmVzc3VyZVwiXG4gICAgdmlld3M6XG4gICAgICAnbm9kZS1kZXRhaWxzJzpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYmFja3ByZXNzdXJlLmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi50aW1lbGluZVwiLFxuICAgIHVybDogXCIvdGltZWxpbmVcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUuaHRtbFwiXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi50aW1lbGluZS52ZXJ0ZXhcIixcbiAgICB1cmw6IFwiL3t2ZXJ0ZXhJZH1cIlxuICAgIHZpZXdzOlxuICAgICAgdmVydGV4OlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi50aW1lbGluZS52ZXJ0ZXguaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLWpvYi5leGNlcHRpb25zXCIsXG4gICAgdXJsOiBcIi9leGNlcHRpb25zXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmV4Y2VwdGlvbnMuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtam9iLmNvbmZpZ1wiLFxuICAgIHVybDogXCIvY29uZmlnXCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLmNvbmZpZy5odG1sXCJcblxuICAuc3RhdGUgXCJhbGwtbWFuYWdlclwiLFxuICAgIHVybDogXCIvdGFza21hbmFnZXJzXCJcbiAgICB2aWV3czpcbiAgICAgIG1haW46XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL2luZGV4Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtbWFuYWdlclwiLFxuICAgICAgdXJsOiBcIi90YXNrbWFuYWdlci97dGFza21hbmFnZXJpZH1cIlxuICAgICAgYWJzdHJhY3Q6IHRydWVcbiAgICAgIHZpZXdzOlxuICAgICAgICBtYWluOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLmh0bWxcIlxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlckNvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwic2luZ2xlLW1hbmFnZXIubWV0cmljc1wiLFxuICAgIHVybDogXCIvbWV0cmljc1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5tZXRyaWNzLmh0bWxcIlxuXG4gIC5zdGF0ZSBcInNpbmdsZS1tYW5hZ2VyLnN0ZG91dFwiLFxuICAgIHVybDogXCIvc3Rkb3V0XCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLnN0ZG91dC5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZVRhc2tNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzaW5nbGUtbWFuYWdlci5sb2dcIixcbiAgICB1cmw6IFwiL2xvZ1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5sb2cuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlckxvZ3NDb250cm9sbGVyJ1xuXG4gIC5zdGF0ZSBcImpvYm1hbmFnZXJcIixcbiAgICAgIHVybDogXCIvam9ibWFuYWdlclwiXG4gICAgICB2aWV3czpcbiAgICAgICAgbWFpbjpcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL2luZGV4Lmh0bWxcIlxuXG4gIC5zdGF0ZSBcImpvYm1hbmFnZXIuY29uZmlnXCIsXG4gICAgdXJsOiBcIi9jb25maWdcIlxuICAgIHZpZXdzOlxuICAgICAgZGV0YWlsczpcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9jb25maWcuaHRtbFwiXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JNYW5hZ2VyQ29uZmlnQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJqb2JtYW5hZ2VyLnN0ZG91dFwiLFxuICAgIHVybDogXCIvc3Rkb3V0XCJcbiAgICB2aWV3czpcbiAgICAgIGRldGFpbHM6XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvc3Rkb3V0Lmh0bWxcIlxuICAgICAgICBjb250cm9sbGVyOiAnSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInXG5cbiAgLnN0YXRlIFwiam9ibWFuYWdlci5sb2dcIixcbiAgICB1cmw6IFwiL2xvZ1wiXG4gICAgdmlld3M6XG4gICAgICBkZXRhaWxzOlxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL2xvZy5odG1sXCJcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcidcblxuICAuc3RhdGUgXCJzdWJtaXRcIixcbiAgICAgIHVybDogXCIvc3VibWl0XCJcbiAgICAgIHZpZXdzOlxuICAgICAgICBtYWluOlxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3N1Ym1pdC5odG1sXCJcbiAgICAgICAgICBjb250cm9sbGVyOiBcIkpvYlN1Ym1pdENvbnRyb2xsZXJcIlxuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UgXCIvb3ZlcnZpZXdcIlxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJywgWyd1aS5yb3V0ZXInLCAnYW5ndWxhck1vbWVudCcsICdkbmRMaXN0cyddKS5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSkge1xuICAkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlID0gZmFsc2U7XG4gIHJldHVybiAkcm9vdFNjb3BlLnNob3dTaWRlYmFyID0gZnVuY3Rpb24oKSB7XG4gICAgJHJvb3RTY29wZS5zaWRlYmFyVmlzaWJsZSA9ICEkcm9vdFNjb3BlLnNpZGViYXJWaXNpYmxlO1xuICAgIHJldHVybiAkcm9vdFNjb3BlLnNpZGViYXJDbGFzcyA9ICdmb3JjZS1zaG93JztcbiAgfTtcbn0pLnZhbHVlKCdmbGlua0NvbmZpZycsIHtcbiAgam9iU2VydmVyOiAnJyxcbiAgXCJyZWZyZXNoLWludGVydmFsXCI6IDEwMDAwXG59KS52YWx1ZSgnd2F0ZXJtYXJrc0NvbmZpZycsIHtcbiAgbm9XYXRlcm1hcms6IC05MjIzMzcyMDM2ODU0Nzc2MDAwXG59KS5ydW4oZnVuY3Rpb24oSm9ic1NlcnZpY2UsIE1haW5TZXJ2aWNlLCBmbGlua0NvbmZpZywgJGludGVydmFsKSB7XG4gIHJldHVybiBNYWluU2VydmljZS5sb2FkQ29uZmlnKCkudGhlbihmdW5jdGlvbihjb25maWcpIHtcbiAgICBhbmd1bGFyLmV4dGVuZChmbGlua0NvbmZpZywgY29uZmlnKTtcbiAgICBKb2JzU2VydmljZS5saXN0Sm9icygpO1xuICAgIHJldHVybiAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gSm9ic1NlcnZpY2UubGlzdEpvYnMoKTtcbiAgICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICB9KTtcbn0pLmNvbmZpZyhmdW5jdGlvbigkdWlWaWV3U2Nyb2xsUHJvdmlkZXIpIHtcbiAgcmV0dXJuICR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKTtcbn0pLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUpIHtcbiAgcmV0dXJuICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlKSB7XG4gICAgaWYgKHRvU3RhdGUucmVkaXJlY3RUbykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiAkc3RhdGUuZ28odG9TdGF0ZS5yZWRpcmVjdFRvLCB0b1BhcmFtcyk7XG4gICAgfVxuICB9KTtcbn0pLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwib3ZlcnZpZXdcIiwge1xuICAgIHVybDogXCIvb3ZlcnZpZXdcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9vdmVydmlldy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdPdmVydmlld0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInJ1bm5pbmctam9ic1wiLCB7XG4gICAgdXJsOiBcIi9ydW5uaW5nLWpvYnNcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL3J1bm5pbmctam9icy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSdW5uaW5nSm9ic0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImNvbXBsZXRlZC1qb2JzXCIsIHtcbiAgICB1cmw6IFwiL2NvbXBsZXRlZC1qb2JzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9jb21wbGV0ZWQtam9icy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYlwiLCB7XG4gICAgdXJsOiBcIi9qb2JzL3tqb2JpZH1cIixcbiAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVKb2JDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW5cIiwge1xuICAgIHVybDogXCJcIixcbiAgICByZWRpcmVjdFRvOiBcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4uaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5zdWJ0YXNrc1wiLCB7XG4gICAgdXJsOiBcIlwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbm9kZS1kZXRhaWxzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUtbGlzdC5zdWJ0YXNrcy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4ubWV0cmljc1wiLCB7XG4gICAgdXJsOiBcIi9tZXRyaWNzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0Lm1ldHJpY3MuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnBsYW4ud2F0ZXJtYXJrc1wiLCB7XG4gICAgdXJsOiBcIi93YXRlcm1hcmtzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LndhdGVybWFya3MuaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IucGxhbi5hY2N1bXVsYXRvcnNcIiwge1xuICAgIHVybDogXCIvYWNjdW11bGF0b3JzXCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdub2RlLWRldGFpbHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS1saXN0LmFjY3VtdWxhdG9ycy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JQbGFuQWNjdW11bGF0b3JzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzXCIsIHtcbiAgICB1cmw6IFwiL2NoZWNrcG9pbnRzXCIsXG4gICAgcmVkaXJlY3RUbzogXCJzaW5nbGUtam9iLnBsYW4uY2hlY2twb2ludHMub3ZlcnZpZXdcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuY2hlY2twb2ludHMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLm92ZXJ2aWV3XCIsIHtcbiAgICB1cmw6IFwiL292ZXJ2aWV3XCIsXG4gICAgdmlld3M6IHtcbiAgICAgICdjaGVja3BvaW50cy12aWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JzL2pvYi5wbGFuLm5vZGUuY2hlY2twb2ludHMub3ZlcnZpZXcuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLnN1bW1hcnlcIiwge1xuICAgIHVybDogXCIvc3VtbWFyeVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLnN1bW1hcnkuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmhpc3RvcnlcIiwge1xuICAgIHVybDogXCIvaGlzdG9yeVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLmhpc3RvcnkuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmNvbmZpZ1wiLCB7XG4gICAgdXJsOiBcIi9jb25maWdcIixcbiAgICB2aWV3czoge1xuICAgICAgJ2NoZWNrcG9pbnRzLXZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnBsYW4ubm9kZS5jaGVja3BvaW50cy5jb25maWcuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmNoZWNrcG9pbnRzLmRldGFpbHNcIiwge1xuICAgIHVybDogXCIvZGV0YWlscy97Y2hlY2twb2ludElkfVwiLFxuICAgIHZpZXdzOiB7XG4gICAgICAnY2hlY2twb2ludHMtdmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLmNoZWNrcG9pbnRzLmRldGFpbHMuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iUGxhbkNoZWNrcG9pbnREZXRhaWxzQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5wbGFuLmJhY2twcmVzc3VyZVwiLCB7XG4gICAgdXJsOiBcIi9iYWNrcHJlc3N1cmVcIixcbiAgICB2aWV3czoge1xuICAgICAgJ25vZGUtZGV0YWlscyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IucGxhbi5ub2RlLWxpc3QuYmFja3ByZXNzdXJlLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtam9iLnRpbWVsaW5lXCIsIHtcbiAgICB1cmw6IFwiL3RpbWVsaW5lXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IudGltZWxpbmUuaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsIHtcbiAgICB1cmw6IFwiL3t2ZXJ0ZXhJZH1cIixcbiAgICB2aWV3czoge1xuICAgICAgdmVydGV4OiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYnMvam9iLnRpbWVsaW5lLnZlcnRleC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1qb2IuZXhjZXB0aW9uc1wiLCB7XG4gICAgdXJsOiBcIi9leGNlcHRpb25zXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuZXhjZXB0aW9ucy5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwic2luZ2xlLWpvYi5jb25maWdcIiwge1xuICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9icy9qb2IuY29uZmlnLmh0bWxcIlxuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJhbGwtbWFuYWdlclwiLCB7XG4gICAgdXJsOiBcIi90YXNrbWFuYWdlcnNcIixcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci9pbmRleC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBbGxUYXNrTWFuYWdlcnNDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtbWFuYWdlclwiLCB7XG4gICAgdXJsOiBcIi90YXNrbWFuYWdlci97dGFza21hbmFnZXJpZH1cIixcbiAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICB2aWV3czoge1xuICAgICAgbWFpbjoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTaW5nbGVUYXNrTWFuYWdlckNvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1tYW5hZ2VyLm1ldHJpY3NcIiwge1xuICAgIHVybDogXCIvbWV0cmljc1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL3Rhc2ttYW5hZ2VyL3Rhc2ttYW5hZ2VyLm1ldHJpY3MuaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcInNpbmdsZS1tYW5hZ2VyLnN0ZG91dFwiLCB7XG4gICAgdXJsOiBcIi9zdGRvdXRcIixcbiAgICB2aWV3czoge1xuICAgICAgZGV0YWlsczoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy90YXNrbWFuYWdlci90YXNrbWFuYWdlci5zdGRvdXQuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnU2luZ2xlVGFza01hbmFnZXJTdGRvdXRDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzaW5nbGUtbWFuYWdlci5sb2dcIiwge1xuICAgIHVybDogXCIvbG9nXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvdGFza21hbmFnZXIvdGFza21hbmFnZXIubG9nLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImpvYm1hbmFnZXJcIiwge1xuICAgIHVybDogXCIvam9ibWFuYWdlclwiLFxuICAgIHZpZXdzOiB7XG4gICAgICBtYWluOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvaW5kZXguaHRtbFwiXG4gICAgICB9XG4gICAgfVxuICB9KS5zdGF0ZShcImpvYm1hbmFnZXIuY29uZmlnXCIsIHtcbiAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgIHZpZXdzOiB7XG4gICAgICBkZXRhaWxzOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiBcInBhcnRpYWxzL2pvYm1hbmFnZXIvY29uZmlnLmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogJ0pvYk1hbmFnZXJDb25maWdDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJqb2JtYW5hZ2VyLnN0ZG91dFwiLCB7XG4gICAgdXJsOiBcIi9zdGRvdXRcIixcbiAgICB2aWV3czoge1xuICAgICAgZGV0YWlsczoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogXCJwYXJ0aWFscy9qb2JtYW5hZ2VyL3N0ZG91dC5odG1sXCIsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdKb2JNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0pLnN0YXRlKFwiam9ibWFuYWdlci5sb2dcIiwge1xuICAgIHVybDogXCIvbG9nXCIsXG4gICAgdmlld3M6IHtcbiAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvam9ibWFuYWdlci9sb2cuaHRtbFwiLFxuICAgICAgICBjb250cm9sbGVyOiAnSm9iTWFuYWdlckxvZ3NDb250cm9sbGVyJ1xuICAgICAgfVxuICAgIH1cbiAgfSkuc3RhdGUoXCJzdWJtaXRcIiwge1xuICAgIHVybDogXCIvc3VibWl0XCIsXG4gICAgdmlld3M6IHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicGFydGlhbHMvc3VibWl0Lmh0bWxcIixcbiAgICAgICAgY29udHJvbGxlcjogXCJKb2JTdWJtaXRDb250cm9sbGVyXCJcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9vdmVydmlld1wiKTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdic0xhYmVsJywgKEpvYnNTZXJ2aWNlKSAtPlxuICB0cmFuc2NsdWRlOiB0cnVlXG4gIHJlcGxhY2U6IHRydWVcbiAgc2NvcGU6IFxuICAgIGdldExhYmVsQ2xhc3M6IFwiJlwiXG4gICAgc3RhdHVzOiBcIkBcIlxuXG4gIHRlbXBsYXRlOiBcIjxzcGFuIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0TGFiZWxDbGFzcygpJz48bmctdHJhbnNjbHVkZT48L25nLXRyYW5zY2x1ZGU+PC9zcGFuPlwiXG4gIFxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmdldExhYmVsQ2xhc3MgPSAtPlxuICAgICAgJ2xhYmVsIGxhYmVsLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ2JwTGFiZWwnLCAoSm9ic1NlcnZpY2UpIC0+XG4gIHRyYW5zY2x1ZGU6IHRydWVcbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTpcbiAgICBnZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzOiBcIiZcIlxuICAgIHN0YXR1czogXCJAXCJcblxuICB0ZW1wbGF0ZTogXCI8c3BhbiB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3MoKSc+PG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPjwvc3Bhbj5cIlxuXG4gIGxpbms6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgc2NvcGUuZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzcyA9IC0+XG4gICAgICAnbGFiZWwgbGFiZWwtJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUJhY2tQcmVzc3VyZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAnaW5kaWNhdG9yUHJpbWFyeScsIChKb2JzU2VydmljZSkgLT5cbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTogXG4gICAgZ2V0TGFiZWxDbGFzczogXCImXCJcbiAgICBzdGF0dXM6ICdAJ1xuXG4gIHRlbXBsYXRlOiBcIjxpIHRpdGxlPSd7e3N0YXR1c319JyBuZy1jbGFzcz0nZ2V0TGFiZWxDbGFzcygpJyAvPlwiXG4gIFxuICBsaW5rOiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSAtPlxuICAgIHNjb3BlLmdldExhYmVsQ2xhc3MgPSAtPlxuICAgICAgJ2ZhIGZhLWNpcmNsZSBpbmRpY2F0b3IgaW5kaWNhdG9yLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ3RhYmxlUHJvcGVydHknLCAtPlxuICByZXBsYWNlOiB0cnVlXG4gIHNjb3BlOlxuICAgIHZhbHVlOiAnPSdcblxuICB0ZW1wbGF0ZTogXCI8dGQgdGl0bGU9XFxcInt7dmFsdWUgfHwgJ05vbmUnfX1cXFwiPnt7dmFsdWUgfHwgJ05vbmUnfX08L3RkPlwiXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5kaXJlY3RpdmUoJ2JzTGFiZWwnLCBmdW5jdGlvbihKb2JzU2VydmljZSkge1xuICByZXR1cm4ge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgZ2V0TGFiZWxDbGFzczogXCImXCIsXG4gICAgICBzdGF0dXM6IFwiQFwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogXCI8c3BhbiB0aXRsZT0ne3tzdGF0dXN9fScgbmctY2xhc3M9J2dldExhYmVsQ2xhc3MoKSc+PG5nLXRyYW5zY2x1ZGU+PC9uZy10cmFuc2NsdWRlPjwvc3Bhbj5cIixcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHJldHVybiBzY29wZS5nZXRMYWJlbENsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnbGFiZWwgbGFiZWwtJyArIEpvYnNTZXJ2aWNlLnRyYW5zbGF0ZUxhYmVsU3RhdGUoYXR0cnMuc3RhdHVzKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufSkuZGlyZWN0aXZlKCdicExhYmVsJywgZnVuY3Rpb24oSm9ic1NlcnZpY2UpIHtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGdldEJhY2tQcmVzc3VyZUxhYmVsQ2xhc3M6IFwiJlwiLFxuICAgICAgc3RhdHVzOiBcIkBcIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiPHNwYW4gdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRCYWNrUHJlc3N1cmVMYWJlbENsYXNzKCknPjxuZy10cmFuc2NsdWRlPjwvbmctdHJhbnNjbHVkZT48L3NwYW4+XCIsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gc2NvcGUuZ2V0QmFja1ByZXNzdXJlTGFiZWxDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2xhYmVsIGxhYmVsLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVCYWNrUHJlc3N1cmVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cyk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnaW5kaWNhdG9yUHJpbWFyeScsIGZ1bmN0aW9uKEpvYnNTZXJ2aWNlKSB7XG4gIHJldHVybiB7XG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgZ2V0TGFiZWxDbGFzczogXCImXCIsXG4gICAgICBzdGF0dXM6ICdAJ1xuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiPGkgdGl0bGU9J3t7c3RhdHVzfX0nIG5nLWNsYXNzPSdnZXRMYWJlbENsYXNzKCknIC8+XCIsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICByZXR1cm4gc2NvcGUuZ2V0TGFiZWxDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2ZhIGZhLWNpcmNsZSBpbmRpY2F0b3IgaW5kaWNhdG9yLScgKyBKb2JzU2VydmljZS50cmFuc2xhdGVMYWJlbFN0YXRlKGF0dHJzLnN0YXR1cyk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgndGFibGVQcm9wZXJ0eScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHZhbHVlOiAnPSdcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBcIjx0ZCB0aXRsZT1cXFwie3t2YWx1ZSB8fCAnTm9uZSd9fVxcXCI+e3t2YWx1ZSB8fCAnTm9uZSd9fTwvdGQ+XCJcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5maWx0ZXIgXCJhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRcIiwgKGFuZ3VsYXJNb21lbnRDb25maWcpIC0+XG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlciA9ICh2YWx1ZSwgZm9ybWF0LCBkdXJhdGlvbkZvcm1hdCkgLT5cbiAgICByZXR1cm4gXCJcIiAgaWYgdHlwZW9mIHZhbHVlIGlzIFwidW5kZWZpbmVkXCIgb3IgdmFsdWUgaXMgbnVsbFxuXG4gICAgbW9tZW50LmR1cmF0aW9uKHZhbHVlLCBmb3JtYXQpLmZvcm1hdChkdXJhdGlvbkZvcm1hdCwgeyB0cmltOiBmYWxzZSB9KVxuXG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlci4kc3RhdGVmdWwgPSBhbmd1bGFyTW9tZW50Q29uZmlnLnN0YXRlZnVsRmlsdGVyc1xuXG4gIGFtRHVyYXRpb25Gb3JtYXRFeHRlbmRlZEZpbHRlclxuXG4uZmlsdGVyIFwiaHVtYW5pemVEdXJhdGlvblwiLCAtPlxuICAodmFsdWUsIHNob3J0KSAtPlxuICAgIHJldHVybiBcIlwiIGlmIHR5cGVvZiB2YWx1ZSBpcyBcInVuZGVmaW5lZFwiIG9yIHZhbHVlIGlzIG51bGxcbiAgICBtcyA9IHZhbHVlICUgMTAwMFxuICAgIHggPSBNYXRoLmZsb29yKHZhbHVlIC8gMTAwMClcbiAgICBzZWNvbmRzID0geCAlIDYwXG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDYwKVxuICAgIG1pbnV0ZXMgPSB4ICUgNjBcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gNjApXG4gICAgaG91cnMgPSB4ICUgMjRcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gMjQpXG4gICAgZGF5cyA9IHhcbiAgICBpZiBkYXlzID09IDBcbiAgICAgIGlmIGhvdXJzID09IDBcbiAgICAgICAgaWYgbWludXRlcyA9PSAwXG4gICAgICAgICAgaWYgc2Vjb25kcyA9PSAwXG4gICAgICAgICAgICByZXR1cm4gbXMgKyBcIm1zXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwicyBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgc2hvcnQgdGhlbiByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtXCIgZWxzZSByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiXG4gICAgZWxzZVxuICAgICAgaWYgc2hvcnQgdGhlbiByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoXCIgZWxzZSByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIlxuXG4uZmlsdGVyIFwibGltaXRcIiwgLT5cbiAgKHRleHQpIC0+XG4gICAgaWYgKHRleHQubGVuZ3RoID4gNzMpXG4gICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgMzUpICsgXCIuLi5cIiArIHRleHQuc3Vic3RyaW5nKHRleHQubGVuZ3RoIC0gMzUsIHRleHQubGVuZ3RoKVxuICAgIHRleHRcblxuLmZpbHRlciBcImh1bWFuaXplVGV4dFwiLCAtPlxuICAodGV4dCkgLT5cbiAgICAjIFRPRE86IGV4dGVuZC4uLiBhIGxvdFxuICAgIGlmIHRleHQgdGhlbiB0ZXh0LnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLzxiclxcLz4vZyxcIlwiKSBlbHNlICcnXG5cbi5maWx0ZXIgXCJodW1hbml6ZUJ5dGVzXCIsIC0+XG4gIChieXRlcykgLT5cbiAgICB1bml0cyA9IFtcIkJcIiwgXCJLQlwiLCBcIk1CXCIsIFwiR0JcIiwgXCJUQlwiLCBcIlBCXCIsIFwiRUJcIl1cbiAgICBjb252ZXJ0ZXIgPSAodmFsdWUsIHBvd2VyKSAtPlxuICAgICAgYmFzZSA9IE1hdGgucG93KDEwMjQsIHBvd2VyKVxuICAgICAgaWYgdmFsdWUgPCBiYXNlXG4gICAgICAgIHJldHVybiAodmFsdWUgLyBiYXNlKS50b0ZpeGVkKDIpICsgXCIgXCIgKyB1bml0c1twb3dlcl1cbiAgICAgIGVsc2UgaWYgdmFsdWUgPCBiYXNlICogMTAwMFxuICAgICAgICByZXR1cm4gKHZhbHVlIC8gYmFzZSkudG9QcmVjaXNpb24oMykgKyBcIiBcIiArIHVuaXRzW3Bvd2VyXVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gY29udmVydGVyKHZhbHVlLCBwb3dlciArIDEpXG4gICAgcmV0dXJuIFwiXCIgaWYgdHlwZW9mIGJ5dGVzIGlzIFwidW5kZWZpbmVkXCIgb3IgYnl0ZXMgaXMgbnVsbFxuICAgIGlmIGJ5dGVzIDwgMTAwMCB0aGVuIGJ5dGVzICsgXCIgQlwiIGVsc2UgY29udmVydGVyKGJ5dGVzLCAxKVxuXG4uZmlsdGVyIFwidG9Mb2NhbGVTdHJpbmdcIiwgLT5cbiAgKHRleHQpIC0+IHRleHQudG9Mb2NhbGVTdHJpbmcoKVxuXG4uZmlsdGVyIFwidG9VcHBlckNhc2VcIiwgLT5cbiAgKHRleHQpIC0+IHRleHQudG9VcHBlckNhc2UoKVxuXG4uZmlsdGVyIFwicGVyY2VudGFnZVwiLCAtPlxuICAobnVtYmVyKSAtPiAobnVtYmVyICogMTAwKS50b0ZpeGVkKDApICsgJyUnXG5cbi5maWx0ZXIgXCJodW1hbml6ZVdhdGVybWFya1wiLCAod2F0ZXJtYXJrc0NvbmZpZykgLT5cbiAgKHZhbHVlKSAtPlxuICAgIGlmIGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8PSB3YXRlcm1hcmtzQ29uZmlnLm5vV2F0ZXJtYXJrXG4gICAgICByZXR1cm4gJ05vIFdhdGVybWFyaydcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdmFsdWVcblxuLmZpbHRlciBcImluY3JlbWVudFwiLCAtPlxuICAobnVtYmVyKSAtPlxuICAgIHBhcnNlSW50KG51bWJlcikgKyAxXG5cbi5maWx0ZXIgXCJodW1hbml6ZUNoYXJ0TnVtZXJpY1wiLCBbJ2h1bWFuaXplQnl0ZXNGaWx0ZXInLCAnaHVtYW5pemVEdXJhdGlvbkZpbHRlcicsIChodW1hbml6ZUJ5dGVzRmlsdGVyLCBodW1hbml6ZUR1cmF0aW9uRmlsdGVyKS0+XG4gICh2YWx1ZSwgbWV0cmljKS0+XG4gICAgcmV0dXJuX3ZhbCA9ICcnXG4gICAgaWYgdmFsdWUgIT0gbnVsbFxuICAgICAgaWYgL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpICYmIC9wZXJzZWNvbmQvaS50ZXN0KG1ldHJpYy5pZClcbiAgICAgICAgcmV0dXJuX3ZhbCA9IGh1bWFuaXplQnl0ZXNGaWx0ZXIodmFsdWUpICsgJyAvIHMnXG4gICAgICBlbHNlIGlmIC9ieXRlcy9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gaHVtYW5pemVCeXRlc0ZpbHRlcih2YWx1ZSlcbiAgICAgIGVsc2UgaWYgL3BlcnNlY29uZC9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gdmFsdWUgKyAnIC8gcydcbiAgICAgIGVsc2UgaWYgL3RpbWUvaS50ZXN0KG1ldHJpYy5pZCkgfHwgL2xhdGVuY3kvaS50ZXN0KG1ldHJpYy5pZClcbiAgICAgICAgcmV0dXJuX3ZhbCA9IGh1bWFuaXplRHVyYXRpb25GaWx0ZXIodmFsdWUsIHRydWUpXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybl92YWwgPSB2YWx1ZVxuICAgIHJldHVybiByZXR1cm5fdmFsXG5dXG5cbi5maWx0ZXIgXCJodW1hbml6ZUNoYXJ0TnVtZXJpY1RpdGxlXCIsIFsnaHVtYW5pemVEdXJhdGlvbkZpbHRlcicsIChodW1hbml6ZUR1cmF0aW9uRmlsdGVyKS0+XG4gICh2YWx1ZSwgbWV0cmljKS0+XG4gICAgcmV0dXJuX3ZhbCA9ICcnXG4gICAgaWYgdmFsdWUgIT0gbnVsbFxuICAgICAgaWYgL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpICYmIC9wZXJzZWNvbmQvaS50ZXN0KG1ldHJpYy5pZClcbiAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlICsgJyBCeXRlcyAvIHMnXG4gICAgICBlbHNlIGlmIC9ieXRlcy9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gdmFsdWUgKyAnIEJ5dGVzJ1xuICAgICAgZWxzZSBpZiAvcGVyc2Vjb25kL2kudGVzdChtZXRyaWMuaWQpXG4gICAgICAgIHJldHVybl92YWwgPSB2YWx1ZSArICcgLyBzJ1xuICAgICAgZWxzZSBpZiAvdGltZS9pLnRlc3QobWV0cmljLmlkKSB8fCAvbGF0ZW5jeS9pLnRlc3QobWV0cmljLmlkKVxuICAgICAgICByZXR1cm5fdmFsID0gaHVtYW5pemVEdXJhdGlvbkZpbHRlcih2YWx1ZSwgZmFsc2UpXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybl92YWwgPSB2YWx1ZVxuICAgIHJldHVybiByZXR1cm5fdmFsXG5dXG5cbi5maWx0ZXIgXCJzZWFyY2hNZXRyaWNzXCIsIC0+XG4gIChhdmFpbGFibGVNZXRyaWNzLCBxdWVyeSktPlxuICAgIHF1ZXJ5UmVnZXggPSBuZXcgUmVnRXhwKHF1ZXJ5LCBcImdpXCIpXG4gICAgcmV0dXJuIChtZXRyaWMgZm9yIG1ldHJpYyBpbiBhdmFpbGFibGVNZXRyaWNzIHdoZW4gbWV0cmljLmlkLm1hdGNoKHF1ZXJ5UmVnZXgpKVxuXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5maWx0ZXIoXCJhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRcIiwgZnVuY3Rpb24oYW5ndWxhck1vbWVudENvbmZpZykge1xuICB2YXIgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyO1xuICBhbUR1cmF0aW9uRm9ybWF0RXh0ZW5kZWRGaWx0ZXIgPSBmdW5jdGlvbih2YWx1ZSwgZm9ybWF0LCBkdXJhdGlvbkZvcm1hdCkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gbW9tZW50LmR1cmF0aW9uKHZhbHVlLCBmb3JtYXQpLmZvcm1hdChkdXJhdGlvbkZvcm1hdCwge1xuICAgICAgdHJpbTogZmFsc2VcbiAgICB9KTtcbiAgfTtcbiAgYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyLiRzdGF0ZWZ1bCA9IGFuZ3VsYXJNb21lbnRDb25maWcuc3RhdGVmdWxGaWx0ZXJzO1xuICByZXR1cm4gYW1EdXJhdGlvbkZvcm1hdEV4dGVuZGVkRmlsdGVyO1xufSkuZmlsdGVyKFwiaHVtYW5pemVEdXJhdGlvblwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBzaG9ydCkge1xuICAgIHZhciBkYXlzLCBob3VycywgbWludXRlcywgbXMsIHNlY29uZHMsIHg7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIiB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIG1zID0gdmFsdWUgJSAxMDAwO1xuICAgIHggPSBNYXRoLmZsb29yKHZhbHVlIC8gMTAwMCk7XG4gICAgc2Vjb25kcyA9IHggJSA2MDtcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gNjApO1xuICAgIG1pbnV0ZXMgPSB4ICUgNjA7XG4gICAgeCA9IE1hdGguZmxvb3IoeCAvIDYwKTtcbiAgICBob3VycyA9IHggJSAyNDtcbiAgICB4ID0gTWF0aC5mbG9vcih4IC8gMjQpO1xuICAgIGRheXMgPSB4O1xuICAgIGlmIChkYXlzID09PSAwKSB7XG4gICAgICBpZiAoaG91cnMgPT09IDApIHtcbiAgICAgICAgaWYgKG1pbnV0ZXMgPT09IDApIHtcbiAgICAgICAgICBpZiAoc2Vjb25kcyA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG1zICsgXCJtc1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2Vjb25kcyArIFwicyBcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG1pbnV0ZXMgKyBcIm0gXCIgKyBzZWNvbmRzICsgXCJzXCI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzaG9ydCkge1xuICAgICAgICAgIHJldHVybiBob3VycyArIFwiaCBcIiArIG1pbnV0ZXMgKyBcIm1cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaG91cnMgKyBcImggXCIgKyBtaW51dGVzICsgXCJtIFwiICsgc2Vjb25kcyArIFwic1wiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzaG9ydCkge1xuICAgICAgICByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGF5cyArIFwiZCBcIiArIGhvdXJzICsgXCJoIFwiICsgbWludXRlcyArIFwibSBcIiArIHNlY29uZHMgKyBcInNcIjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KS5maWx0ZXIoXCJsaW1pdFwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcbiAgICBpZiAodGV4dC5sZW5ndGggPiA3Mykge1xuICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIDM1KSArIFwiLi4uXCIgKyB0ZXh0LnN1YnN0cmluZyh0ZXh0Lmxlbmd0aCAtIDM1LCB0ZXh0Lmxlbmd0aCk7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0O1xuICB9O1xufSkuZmlsdGVyKFwiaHVtYW5pemVUZXh0XCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuICAgIGlmICh0ZXh0KSB7XG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC88YnJcXC8+L2csIFwiXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9O1xufSkuZmlsdGVyKFwiaHVtYW5pemVCeXRlc1wiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgdmFyIGNvbnZlcnRlciwgdW5pdHM7XG4gICAgdW5pdHMgPSBbXCJCXCIsIFwiS0JcIiwgXCJNQlwiLCBcIkdCXCIsIFwiVEJcIiwgXCJQQlwiLCBcIkVCXCJdO1xuICAgIGNvbnZlcnRlciA9IGZ1bmN0aW9uKHZhbHVlLCBwb3dlcikge1xuICAgICAgdmFyIGJhc2U7XG4gICAgICBiYXNlID0gTWF0aC5wb3coMTAyNCwgcG93ZXIpO1xuICAgICAgaWYgKHZhbHVlIDwgYmFzZSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlIC8gYmFzZSkudG9GaXhlZCgyKSArIFwiIFwiICsgdW5pdHNbcG93ZXJdO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8IGJhc2UgKiAxMDAwKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgLyBiYXNlKS50b1ByZWNpc2lvbigzKSArIFwiIFwiICsgdW5pdHNbcG93ZXJdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnZlcnRlcih2YWx1ZSwgcG93ZXIgKyAxKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmICh0eXBlb2YgYnl0ZXMgPT09IFwidW5kZWZpbmVkXCIgfHwgYnl0ZXMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAoYnl0ZXMgPCAxMDAwKSB7XG4gICAgICByZXR1cm4gYnl0ZXMgKyBcIiBCXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb252ZXJ0ZXIoYnl0ZXMsIDEpO1xuICAgIH1cbiAgfTtcbn0pLmZpbHRlcihcInRvTG9jYWxlU3RyaW5nXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvTG9jYWxlU3RyaW5nKCk7XG4gIH07XG59KS5maWx0ZXIoXCJ0b1VwcGVyQ2FzZVwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC50b1VwcGVyQ2FzZSgpO1xuICB9O1xufSkuZmlsdGVyKFwicGVyY2VudGFnZVwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG51bWJlcikge1xuICAgIHJldHVybiAobnVtYmVyICogMTAwKS50b0ZpeGVkKDApICsgJyUnO1xuICB9O1xufSkuZmlsdGVyKFwiaHVtYW5pemVXYXRlcm1hcmtcIiwgZnVuY3Rpb24od2F0ZXJtYXJrc0NvbmZpZykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDw9IHdhdGVybWFya3NDb25maWcubm9XYXRlcm1hcmspIHtcbiAgICAgIHJldHVybiAnTm8gV2F0ZXJtYXJrJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfTtcbn0pLmZpbHRlcihcImluY3JlbWVudFwiLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG51bWJlcikge1xuICAgIHJldHVybiBwYXJzZUludChudW1iZXIpICsgMTtcbiAgfTtcbn0pLmZpbHRlcihcImh1bWFuaXplQ2hhcnROdW1lcmljXCIsIFtcbiAgJ2h1bWFuaXplQnl0ZXNGaWx0ZXInLCAnaHVtYW5pemVEdXJhdGlvbkZpbHRlcicsIGZ1bmN0aW9uKGh1bWFuaXplQnl0ZXNGaWx0ZXIsIGh1bWFuaXplRHVyYXRpb25GaWx0ZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG1ldHJpYykge1xuICAgICAgdmFyIHJldHVybl92YWw7XG4gICAgICByZXR1cm5fdmFsID0gJyc7XG4gICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKC9ieXRlcy9pLnRlc3QobWV0cmljLmlkKSAmJiAvcGVyc2Vjb25kL2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IGh1bWFuaXplQnl0ZXNGaWx0ZXIodmFsdWUpICsgJyAvIHMnO1xuICAgICAgICB9IGVsc2UgaWYgKC9ieXRlcy9pLnRlc3QobWV0cmljLmlkKSkge1xuICAgICAgICAgIHJldHVybl92YWwgPSBodW1hbml6ZUJ5dGVzRmlsdGVyKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICgvcGVyc2Vjb25kL2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlICsgJyAvIHMnO1xuICAgICAgICB9IGVsc2UgaWYgKC90aW1lL2kudGVzdChtZXRyaWMuaWQpIHx8IC9sYXRlbmN5L2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IGh1bWFuaXplRHVyYXRpb25GaWx0ZXIodmFsdWUsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybl92YWwgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJldHVybl92YWw7XG4gICAgfTtcbiAgfVxuXSkuZmlsdGVyKFwiaHVtYW5pemVDaGFydE51bWVyaWNUaXRsZVwiLCBbXG4gICdodW1hbml6ZUR1cmF0aW9uRmlsdGVyJywgZnVuY3Rpb24oaHVtYW5pemVEdXJhdGlvbkZpbHRlcikge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgbWV0cmljKSB7XG4gICAgICB2YXIgcmV0dXJuX3ZhbDtcbiAgICAgIHJldHVybl92YWwgPSAnJztcbiAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpICYmIC9wZXJzZWNvbmQvaS50ZXN0KG1ldHJpYy5pZCkpIHtcbiAgICAgICAgICByZXR1cm5fdmFsID0gdmFsdWUgKyAnIEJ5dGVzIC8gcyc7XG4gICAgICAgIH0gZWxzZSBpZiAoL2J5dGVzL2kudGVzdChtZXRyaWMuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlICsgJyBCeXRlcyc7XG4gICAgICAgIH0gZWxzZSBpZiAoL3BlcnNlY29uZC9pLnRlc3QobWV0cmljLmlkKSkge1xuICAgICAgICAgIHJldHVybl92YWwgPSB2YWx1ZSArICcgLyBzJztcbiAgICAgICAgfSBlbHNlIGlmICgvdGltZS9pLnRlc3QobWV0cmljLmlkKSB8fCAvbGF0ZW5jeS9pLnRlc3QobWV0cmljLmlkKSkge1xuICAgICAgICAgIHJldHVybl92YWwgPSBodW1hbml6ZUR1cmF0aW9uRmlsdGVyKHZhbHVlLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuX3ZhbCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0dXJuX3ZhbDtcbiAgICB9O1xuICB9XG5dKS5maWx0ZXIoXCJzZWFyY2hNZXRyaWNzXCIsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24oYXZhaWxhYmxlTWV0cmljcywgcXVlcnkpIHtcbiAgICB2YXIgbWV0cmljLCBxdWVyeVJlZ2V4O1xuICAgIHF1ZXJ5UmVnZXggPSBuZXcgUmVnRXhwKHF1ZXJ5LCBcImdpXCIpO1xuICAgIHJldHVybiAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSwgbGVuLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gYXZhaWxhYmxlTWV0cmljcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBtZXRyaWMgPSBhdmFpbGFibGVNZXRyaWNzW2ldO1xuICAgICAgICBpZiAobWV0cmljLmlkLm1hdGNoKHF1ZXJ5UmVnZXgpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKG1ldHJpYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pKCk7XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnTWFpblNlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgQGxvYWRDb25maWcgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiY29uZmlnXCJcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cblxuICBAXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5zZXJ2aWNlKCdNYWluU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkQ29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJjb25maWdcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJDb25maWdDb250cm9sbGVyJywgKCRzY29wZSwgSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlLmxvYWRDb25maWcoKS50aGVuIChkYXRhKSAtPlxuICAgIGlmICEkc2NvcGUuam9ibWFuYWdlcj9cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge31cbiAgICAkc2NvcGUuam9ibWFuYWdlclsnY29uZmlnJ10gPSBkYXRhXG5cbi5jb250cm9sbGVyICdKb2JNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4gKGRhdGEpIC0+XG4gICAgaWYgISRzY29wZS5qb2JtYW5hZ2VyP1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fVxuICAgICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlLmxvYWRMb2dzKCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyWydsb2cnXSA9IGRhdGFcblxuLmNvbnRyb2xsZXIgJ0pvYk1hbmFnZXJTdGRvdXRDb250cm9sbGVyJywgKCRzY29wZSwgSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UpIC0+XG4gIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuIChkYXRhKSAtPlxuICAgIGlmICEkc2NvcGUuam9ibWFuYWdlcj9cbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge31cbiAgICAkc2NvcGUuam9ibWFuYWdlclsnc3Rkb3V0J10gPSBkYXRhXG5cbiAgJHNjb3BlLnJlbG9hZERhdGEgPSAoKSAtPlxuICAgIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmpvYm1hbmFnZXJbJ3N0ZG91dCddID0gZGF0YVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignSm9iTWFuYWdlckNvbmZpZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYk1hbmFnZXJDb25maWdTZXJ2aWNlKSB7XG4gIHJldHVybiBKb2JNYW5hZ2VyQ29uZmlnU2VydmljZS5sb2FkQ29uZmlnKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCRzY29wZS5qb2JtYW5hZ2VyID09IG51bGwpIHtcbiAgICAgICRzY29wZS5qb2JtYW5hZ2VyID0ge307XG4gICAgfVxuICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnY29uZmlnJ10gPSBkYXRhO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYk1hbmFnZXJMb2dzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgSm9iTWFuYWdlckxvZ3NTZXJ2aWNlKSB7XG4gIEpvYk1hbmFnZXJMb2dzU2VydmljZS5sb2FkTG9ncygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICgkc2NvcGUuam9ibWFuYWdlciA9PSBudWxsKSB7XG4gICAgICAkc2NvcGUuam9ibWFuYWdlciA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gJHNjb3BlLmpvYm1hbmFnZXJbJ2xvZyddID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUucmVsb2FkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JNYW5hZ2VyTG9nc1NlcnZpY2UubG9hZExvZ3MoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuam9ibWFuYWdlclsnbG9nJ10gPSBkYXRhO1xuICAgIH0pO1xuICB9O1xufSkuY29udHJvbGxlcignSm9iTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlKSB7XG4gIEpvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlLmxvYWRTdGRvdXQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoJHNjb3BlLmpvYm1hbmFnZXIgPT0gbnVsbCkge1xuICAgICAgJHNjb3BlLmpvYm1hbmFnZXIgPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLnJlbG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9iTWFuYWdlclN0ZG91dFNlcnZpY2UubG9hZFN0ZG91dCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS5qb2JtYW5hZ2VyWydzdGRvdXQnXSA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnSm9iTWFuYWdlckNvbmZpZ1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgY29uZmlnID0ge31cblxuICBAbG9hZENvbmZpZyA9IC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2NvbmZpZ1wiKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGNvbmZpZyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyTG9nc1NlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgbG9ncyA9IHt9XG5cbiAgQGxvYWRMb2dzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvbG9nXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgbG9ncyA9IGRhdGFcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdKb2JNYW5hZ2VyU3Rkb3V0U2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRxKSAtPlxuICBzdGRvdXQgPSB7fVxuXG4gIEBsb2FkU3Rkb3V0ID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm1hbmFnZXIvc3Rkb3V0XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgc3Rkb3V0ID0gZGF0YVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ0pvYk1hbmFnZXJDb25maWdTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgY29uZmlnO1xuICBjb25maWcgPSB7fTtcbiAgdGhpcy5sb2FkQ29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBjb25maWcgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnSm9iTWFuYWdlckxvZ3NTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgbG9ncztcbiAgbG9ncyA9IHt9O1xuICB0aGlzLmxvYWRMb2dzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL2xvZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBsb2dzID0gZGF0YTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pLnNlcnZpY2UoJ0pvYk1hbmFnZXJTdGRvdXRTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgc3Rkb3V0O1xuICBzdGRvdXQgPSB7fTtcbiAgdGhpcy5sb2FkU3Rkb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JtYW5hZ2VyL3N0ZG91dFwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBzdGRvdXQgPSBkYXRhO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuLmNvbnRyb2xsZXIgJ1J1bm5pbmdKb2JzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gLT5cbiAgICAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKVxuXG4gIEpvYnNTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgSm9ic1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcblxuICAkc2NvcGUuam9iT2JzZXJ2ZXIoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdDb21wbGV0ZWRKb2JzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gLT5cbiAgICAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ2ZpbmlzaGVkJylcblxuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcilcbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG5cbiAgJHNjb3BlLmpvYk9ic2VydmVyKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnU2luZ2xlSm9iQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UsICRyb290U2NvcGUsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwsICRxKSAtPlxuICAkc2NvcGUuam9iaWQgPSAkc3RhdGVQYXJhbXMuam9iaWRcbiAgJHNjb3BlLmpvYiA9IG51bGxcbiAgJHNjb3BlLnBsYW4gPSBudWxsXG4gICRzY29wZS53YXRlcm1hcmtzID0ge31cbiAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbFxuICAkc2NvcGUuYmFja1ByZXNzdXJlT3BlcmF0b3JTdGF0cyA9IHt9XG5cbiAgcmVmcmVzaGVyID0gJGludGVydmFsIC0+XG4gICAgSm9ic1NlcnZpY2UubG9hZEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuam9iID0gZGF0YVxuICAgICAgTWV0cmljc1NlcnZpY2UuZ2V0V2F0ZXJtYXJrcygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS53YXRlcm1hcmtzID0gZGF0YVxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkc2NvcGUuam9iID0gbnVsbFxuICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICRzY29wZS53YXRlcm1hcmtzID0ge31cbiAgICAkc2NvcGUudmVydGljZXMgPSBudWxsXG4gICAgJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHMgPSBudWxsXG5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2hlcilcblxuICAkc2NvcGUuY2FuY2VsSm9iID0gKGNhbmNlbEV2ZW50KSAtPlxuICAgIGFuZ3VsYXIuZWxlbWVudChjYW5jZWxFdmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImJ0blwiKS5yZW1vdmVDbGFzcyhcImJ0bi1kZWZhdWx0XCIpLmh0bWwoJ0NhbmNlbGxpbmcuLi4nKVxuICAgIEpvYnNTZXJ2aWNlLmNhbmNlbEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICB7fVxuXG4gICRzY29wZS5zdG9wSm9iID0gKHN0b3BFdmVudCkgLT5cbiAgICBhbmd1bGFyLmVsZW1lbnQoc3RvcEV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiYnRuXCIpLnJlbW92ZUNsYXNzKFwiYnRuLWRlZmF1bHRcIikuaHRtbCgnU3RvcHBpbmcuLi4nKVxuICAgIEpvYnNTZXJ2aWNlLnN0b3BKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuIChkYXRhKSAtPlxuICAgICAge31cblxuICBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAkc2NvcGUuam9iID0gZGF0YVxuICAgICRzY29wZS52ZXJ0aWNlcyA9IGRhdGEudmVydGljZXNcbiAgICAkc2NvcGUucGxhbiA9IGRhdGEucGxhblxuICAgIE1ldHJpY3NTZXJ2aWNlLnNldHVwTWV0cmljcygkc3RhdGVQYXJhbXMuam9iaWQsIGRhdGEudmVydGljZXMpXG4gICAgTWV0cmljc1NlcnZpY2UuZ2V0V2F0ZXJtYXJrcygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUud2F0ZXJtYXJrcyA9IGRhdGFcblxuICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgbG93V2F0ZXJtYXJrIGlzICE9IE5hTlxuICAkc2NvcGUuaGFzV2F0ZXJtYXJrID0gKG5vZGVpZCkgLT5cbiAgICAkc2NvcGUud2F0ZXJtYXJrc1tub2RlaWRdICYmICFpc05hTigkc2NvcGUud2F0ZXJtYXJrc1tub2RlaWRdW1wibG93V2F0ZXJtYXJrXCJdKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkd2luZG93LCBKb2JzU2VydmljZSkgLT5cbiAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlXG4gICRzY29wZS5zdGF0ZUxpc3QgPSBKb2JzU2VydmljZS5zdGF0ZUxpc3QoKVxuXG4gICRzY29wZS5jaGFuZ2VOb2RlID0gKG5vZGVpZCkgLT5cbiAgICBpZiBub2RlaWQgIT0gJHNjb3BlLm5vZGVpZFxuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZFxuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGxcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGxcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsXG4gICAgICAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsXG5cbiAgICAgICRzY29wZS4kYnJvYWRjYXN0ICdyZWxvYWQnXG4gICAgICAkc2NvcGUuJGJyb2FkY2FzdCAnbm9kZTpjaGFuZ2UnLCAkc2NvcGUubm9kZWlkXG5cbiAgICBlbHNlXG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbFxuICAgICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlXG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcbiAgICAgICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IG51bGxcblxuICAkc2NvcGUuZGVhY3RpdmF0ZU5vZGUgPSAtPlxuICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlXG4gICAgJHNjb3BlLnZlcnRleCA9IG51bGxcbiAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcbiAgICAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsXG5cbiAgJHNjb3BlLnRvZ2dsZUZvbGQgPSAtPlxuICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSAhJHNjb3BlLm5vZGVVbmZvbGRlZFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UpIC0+XG4gICRzY29wZS5hZ2dyZWdhdGUgPSBmYWxzZVxuXG4gIGdldFN1YnRhc2tzID0gLT5cbiAgICBpZiAkc2NvcGUuYWdncmVnYXRlXG4gICAgICBKb2JzU2VydmljZS5nZXRUYXNrTWFuYWdlcnMoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLnRhc2ttYW5hZ2VycyA9IGRhdGFcbiAgICBlbHNlXG4gICAgICBKb2JzU2VydmljZS5nZXRTdWJ0YXNrcygkc2NvcGUubm9kZWlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgICAkc2NvcGUuc3VidGFza3MgPSBkYXRhXG5cbiAgaWYgJHNjb3BlLm5vZGVpZCBhbmQgKCEkc2NvcGUudmVydGV4IG9yICEkc2NvcGUudmVydGV4LnN0KVxuICAgIGdldFN1YnRhc2tzKClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgZ2V0U3VidGFza3MoKSBpZiAkc2NvcGUubm9kZWlkXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5BY2N1bXVsYXRvcnNDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UpIC0+XG4gIGdldEFjY3VtdWxhdG9ycyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0QWNjdW11bGF0b3JzKCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gZGF0YS5tYWluXG4gICAgICAkc2NvcGUuc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3NcblxuICBpZiAkc2NvcGUubm9kZWlkIGFuZCAoISRzY29wZS52ZXJ0ZXggb3IgISRzY29wZS52ZXJ0ZXguYWNjdW11bGF0b3JzKVxuICAgIGdldEFjY3VtdWxhdG9ycygpXG5cbiAgJHNjb3BlLiRvbiAncmVsb2FkJywgKGV2ZW50KSAtPlxuICAgIGdldEFjY3VtdWxhdG9ycygpIGlmICRzY29wZS5ub2RlaWRcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uY29udHJvbGxlciAnSm9iUGxhbkNoZWNrcG9pbnRzQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgIyBVcGRhdGVkIGJ5IHRoZSBkZXRhaWxzIGhhbmRsZXIgZm9yIHRoZSBzdWIgY2hlY2twb2ludHMgbmF2IGJhci5cbiAgJHNjb3BlLmNoZWNrcG9pbnREZXRhaWxzID0ge31cbiAgJHNjb3BlLmNoZWNrcG9pbnREZXRhaWxzLmlkID0gLTFcblxuICAjIFJlcXVlc3QgdGhlIGNvbmZpZyBvbmNlIChpdCdzIHN0YXRpYylcbiAgSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludENvbmZpZygpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLmNoZWNrcG9pbnRDb25maWcgPSBkYXRhXG5cbiAgIyBHZW5lcmFsIHN0YXRzIGxpa2UgY291bnRzLCBoaXN0b3J5LCBldGMuXG4gIGdldEdlbmVyYWxDaGVja3BvaW50U3RhdHMgPSAtPlxuICAgIEpvYnNTZXJ2aWNlLmdldENoZWNrcG9pbnRTdGF0cygpLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiAoZGF0YSAhPSBudWxsKVxuICAgICAgICAkc2NvcGUuY2hlY2twb2ludFN0YXRzID0gZGF0YVxuXG4gICMgVHJpZ2dlciByZXF1ZXN0XG4gIGdldEdlbmVyYWxDaGVja3BvaW50U3RhdHMoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICAjIFJldHJpZ2dlciByZXF1ZXN0XG4gICAgZ2V0R2VuZXJhbENoZWNrcG9pbnRTdGF0cygpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5DaGVja3BvaW50RGV0YWlsc0NvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIC0+XG4gICRzY29wZS5zdWJ0YXNrRGV0YWlscyA9IHt9XG4gICRzY29wZS5jaGVja3BvaW50RGV0YWlscy5pZCA9ICRzdGF0ZVBhcmFtcy5jaGVja3BvaW50SWRcblxuICAjIERldGFpbGVkIHN0YXRzIGZvciBhIHNpbmdsZSBjaGVja3BvaW50XG4gIGdldENoZWNrcG9pbnREZXRhaWxzID0gKGNoZWNrcG9pbnRJZCkgLT5cbiAgICBKb2JzU2VydmljZS5nZXRDaGVja3BvaW50RGV0YWlscyhjaGVja3BvaW50SWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiAoZGF0YSAhPSBudWxsKVxuICAgICAgICAkc2NvcGUuY2hlY2twb2ludCA9IGRhdGFcbiAgICAgIGVsc2VcbiAgICAgICAgJHNjb3BlLnVua25vd25fY2hlY2twb2ludCA9IHRydWVcblxuICBnZXRDaGVja3BvaW50U3VidGFza0RldGFpbHMgPSAoY2hlY2twb2ludElkLCB2ZXJ0ZXhJZCkgLT5cbiAgICBKb2JzU2VydmljZS5nZXRDaGVja3BvaW50U3VidGFza0RldGFpbHMoY2hlY2twb2ludElkLCB2ZXJ0ZXhJZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIChkYXRhICE9IG51bGwpXG4gICAgICAgICRzY29wZS5zdWJ0YXNrRGV0YWlsc1t2ZXJ0ZXhJZF0gPSBkYXRhXG5cbiAgZ2V0Q2hlY2twb2ludERldGFpbHMoJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZClcblxuICBpZiAoJHNjb3BlLm5vZGVpZClcbiAgICBnZXRDaGVja3BvaW50U3VidGFza0RldGFpbHMoJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZCwgJHNjb3BlLm5vZGVpZClcblxuICAkc2NvcGUuJG9uICdyZWxvYWQnLCAoZXZlbnQpIC0+XG4gICAgZ2V0Q2hlY2twb2ludERldGFpbHMoJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZClcblxuICAgIGlmICgkc2NvcGUubm9kZWlkKVxuICAgICAgZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzKCRzdGF0ZVBhcmFtcy5jaGVja3BvaW50SWQsICRzY29wZS5ub2RlaWQpXG5cbiAgJHNjb3BlLiRvbiAnJGRlc3Ryb3knLCAtPlxuICAgICRzY29wZS5jaGVja3BvaW50RGV0YWlscy5pZCA9IC0xXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlBsYW5CYWNrUHJlc3N1cmVDb250cm9sbGVyJywgKCRzY29wZSwgSm9ic1NlcnZpY2UpIC0+XG4gIGdldE9wZXJhdG9yQmFja1ByZXNzdXJlID0gLT5cbiAgICAkc2NvcGUubm93ID0gRGF0ZS5ub3coKVxuXG4gICAgaWYgJHNjb3BlLm5vZGVpZFxuICAgICAgSm9ic1NlcnZpY2UuZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoJHNjb3BlLm5vZGVpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHNbJHNjb3BlLm5vZGVpZF0gPSBkYXRhXG5cbiAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmNvbnRyb2xsZXIgJ0pvYlRpbWVsaW5lVmVydGV4Q29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgZ2V0VmVydGV4ID0gLT5cbiAgICBKb2JzU2VydmljZS5nZXRWZXJ0ZXgoJHN0YXRlUGFyYW1zLnZlcnRleElkKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLnZlcnRleCA9IGRhdGFcblxuICBnZXRWZXJ0ZXgoKVxuXG4gICRzY29wZS4kb24gJ3JlbG9hZCcsIChldmVudCkgLT5cbiAgICBnZXRWZXJ0ZXgoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JFeGNlcHRpb25zQ29udHJvbGxlcicsICgkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkgLT5cbiAgSm9ic1NlcnZpY2UubG9hZEV4Y2VwdGlvbnMoKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5leGNlcHRpb25zID0gZGF0YVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQcm9wZXJ0aWVzQ29udHJvbGxlcicsICgkc2NvcGUsIEpvYnNTZXJ2aWNlKSAtPlxuICAkc2NvcGUuY2hhbmdlTm9kZSA9IChub2RlaWQpIC0+XG4gICAgaWYgbm9kZWlkICE9ICRzY29wZS5ub2RlaWRcbiAgICAgICRzY29wZS5ub2RlaWQgPSBub2RlaWRcblxuICAgICAgSm9ic1NlcnZpY2UuZ2V0Tm9kZShub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAgICRzY29wZS5ub2RlID0gZGF0YVxuXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgICAgICRzY29wZS5ub2RlID0gbnVsbFxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5jb250cm9sbGVyICdKb2JQbGFuTWV0cmljc0NvbnRyb2xsZXInLCAoJHNjb3BlLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UpIC0+XG4gICRzY29wZS5kcmFnZ2luZyA9IGZhbHNlXG4gICRzY29wZS53aW5kb3cgPSBNZXRyaWNzU2VydmljZS5nZXRXaW5kb3coKVxuICAkc2NvcGUuYXZhaWxhYmxlTWV0cmljcyA9IG51bGxcblxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgTWV0cmljc1NlcnZpY2UudW5SZWdpc3Rlck9ic2VydmVyKClcblxuICBsb2FkTWV0cmljcyA9IC0+XG4gICAgSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUudmVydGV4ID0gZGF0YVxuXG4gICAgTWV0cmljc1NlcnZpY2UuZ2V0QXZhaWxhYmxlTWV0cmljcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuYXZhaWxhYmxlTWV0cmljcyA9IGRhdGEuc29ydChhbHBoYWJldGljYWxTb3J0QnlJZClcbiAgICAgICRzY29wZS5tZXRyaWNzID0gTWV0cmljc1NlcnZpY2UuZ2V0TWV0cmljc1NldHVwKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCkubmFtZXNcblxuICAgICAgTWV0cmljc1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIChkYXRhKSAtPlxuICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCBcIm1ldHJpY3M6ZGF0YTp1cGRhdGVcIiwgZGF0YS50aW1lc3RhbXAsIGRhdGEudmFsdWVzXG4gICAgICApXG5cbiAgYWxwaGFiZXRpY2FsU29ydEJ5SWQgPSAoYSwgYikgLT5cbiAgICBBID0gYS5pZC50b0xvd2VyQ2FzZSgpXG4gICAgQiA9IGIuaWQudG9Mb3dlckNhc2UoKVxuICAgIGlmIEEgPCBCXG4gICAgICByZXR1cm4gLTFcbiAgICBlbHNlIGlmIEEgPiBCXG4gICAgICByZXR1cm4gMVxuICAgIGVsc2VcbiAgICAgIHJldHVybiAwXG5cbiAgJHNjb3BlLmRyb3BwZWQgPSAoZXZlbnQsIGluZGV4LCBpdGVtLCBleHRlcm5hbCwgdHlwZSkgLT5cblxuICAgIE1ldHJpY3NTZXJ2aWNlLm9yZGVyTWV0cmljcygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIGl0ZW0sIGluZGV4KVxuICAgICRzY29wZS4kYnJvYWRjYXN0IFwibWV0cmljczpyZWZyZXNoXCIsIGl0ZW1cbiAgICBsb2FkTWV0cmljcygpXG4gICAgZmFsc2VcblxuICAkc2NvcGUuZHJhZ1N0YXJ0ID0gLT5cbiAgICAkc2NvcGUuZHJhZ2dpbmcgPSB0cnVlXG5cbiAgJHNjb3BlLmRyYWdFbmQgPSAtPlxuICAgICRzY29wZS5kcmFnZ2luZyA9IGZhbHNlXG5cbiAgJHNjb3BlLmFkZE1ldHJpYyA9IChtZXRyaWMpIC0+XG4gICAgTWV0cmljc1NlcnZpY2UuYWRkTWV0cmljKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljLmlkKVxuICAgIGxvYWRNZXRyaWNzKClcblxuICAkc2NvcGUucmVtb3ZlTWV0cmljID0gKG1ldHJpYykgLT5cbiAgICBNZXRyaWNzU2VydmljZS5yZW1vdmVNZXRyaWMoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBtZXRyaWMpXG4gICAgbG9hZE1ldHJpY3MoKVxuXG4gICRzY29wZS5zZXRNZXRyaWNTaXplID0gKG1ldHJpYywgc2l6ZSkgLT5cbiAgICBNZXRyaWNzU2VydmljZS5zZXRNZXRyaWNTaXplKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljLCBzaXplKVxuICAgIGxvYWRNZXRyaWNzKClcblxuICAkc2NvcGUuc2V0TWV0cmljVmlldyA9IChtZXRyaWMsIHZpZXcpIC0+XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljVmlldygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgdmlldylcbiAgICBsb2FkTWV0cmljcygpXG5cbiAgJHNjb3BlLmdldFZhbHVlcyA9IChtZXRyaWMpIC0+XG4gICAgTWV0cmljc1NlcnZpY2UuZ2V0VmFsdWVzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljKVxuXG4gICRzY29wZS4kb24gJ25vZGU6Y2hhbmdlJywgKGV2ZW50LCBub2RlaWQpIC0+XG4gICAgbG9hZE1ldHJpY3MoKSBpZiAhJHNjb3BlLmRyYWdnaW5nXG5cbiAgbG9hZE1ldHJpY3MoKSBpZiAkc2NvcGUubm9kZWlkXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmNvbnRyb2xsZXIoJ1J1bm5pbmdKb2JzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gICRzY29wZS5qb2JPYnNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUuam9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKTtcbiAgfTtcbiAgSm9ic1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUuam9iT2JzZXJ2ZXIoKTtcbn0pLmNvbnRyb2xsZXIoJ0NvbXBsZXRlZEpvYnNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIHtcbiAgJHNjb3BlLmpvYk9ic2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5qb2JzID0gSm9ic1NlcnZpY2UuZ2V0Sm9icygnZmluaXNoZWQnKTtcbiAgfTtcbiAgSm9ic1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUuam9iT2JzZXJ2ZXIoKTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZUpvYkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UsICRyb290U2NvcGUsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwsICRxKSB7XG4gIHZhciByZWZyZXNoZXI7XG4gICRzY29wZS5qb2JpZCA9ICRzdGF0ZVBhcmFtcy5qb2JpZDtcbiAgJHNjb3BlLmpvYiA9IG51bGw7XG4gICRzY29wZS5wbGFuID0gbnVsbDtcbiAgJHNjb3BlLndhdGVybWFya3MgPSB7fTtcbiAgJHNjb3BlLnZlcnRpY2VzID0gbnVsbDtcbiAgJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHMgPSB7fTtcbiAgcmVmcmVzaGVyID0gJGludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuam9iID0gZGF0YTtcbiAgICAgIE1ldHJpY3NTZXJ2aWNlLmdldFdhdGVybWFya3MoJHNjb3BlLmpvYi5qaWQsICRzY29wZS5wbGFuLm5vZGVzKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS53YXRlcm1hcmtzID0gZGF0YTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuICRzY29wZS4kYnJvYWRjYXN0KCdyZWxvYWQnKTtcbiAgICB9KTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuam9iID0gbnVsbDtcbiAgICAkc2NvcGUucGxhbiA9IG51bGw7XG4gICAgJHNjb3BlLndhdGVybWFya3MgPSB7fTtcbiAgICAkc2NvcGUudmVydGljZXMgPSBudWxsO1xuICAgICRzY29wZS5iYWNrUHJlc3N1cmVPcGVyYXRvclN0YXRzID0gbnVsbDtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoZXIpO1xuICB9KTtcbiAgJHNjb3BlLmNhbmNlbEpvYiA9IGZ1bmN0aW9uKGNhbmNlbEV2ZW50KSB7XG4gICAgYW5ndWxhci5lbGVtZW50KGNhbmNlbEV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiYnRuXCIpLnJlbW92ZUNsYXNzKFwiYnRuLWRlZmF1bHRcIikuaHRtbCgnQ2FuY2VsbGluZy4uLicpO1xuICAgIHJldHVybiBKb2JzU2VydmljZS5jYW5jZWxKb2IoJHN0YXRlUGFyYW1zLmpvYmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLnN0b3BKb2IgPSBmdW5jdGlvbihzdG9wRXZlbnQpIHtcbiAgICBhbmd1bGFyLmVsZW1lbnQoc3RvcEV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiYnRuXCIpLnJlbW92ZUNsYXNzKFwiYnRuLWRlZmF1bHRcIikuaHRtbCgnU3RvcHBpbmcuLi4nKTtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2Uuc3RvcEpvYigkc3RhdGVQYXJhbXMuam9iaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH0pO1xuICB9O1xuICBKb2JzU2VydmljZS5sb2FkSm9iKCRzdGF0ZVBhcmFtcy5qb2JpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgJHNjb3BlLmpvYiA9IGRhdGE7XG4gICAgJHNjb3BlLnZlcnRpY2VzID0gZGF0YS52ZXJ0aWNlcztcbiAgICAkc2NvcGUucGxhbiA9IGRhdGEucGxhbjtcbiAgICBNZXRyaWNzU2VydmljZS5zZXR1cE1ldHJpY3MoJHN0YXRlUGFyYW1zLmpvYmlkLCBkYXRhLnZlcnRpY2VzKTtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0V2F0ZXJtYXJrcygkc2NvcGUuam9iLmppZCwgJHNjb3BlLnBsYW4ubm9kZXMpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS53YXRlcm1hcmtzID0gZGF0YTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAkc2NvcGUuaGFzV2F0ZXJtYXJrID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgcmV0dXJuICRzY29wZS53YXRlcm1hcmtzW25vZGVpZF0gJiYgIWlzTmFOKCRzY29wZS53YXRlcm1hcmtzW25vZGVpZF1bXCJsb3dXYXRlcm1hcmtcIl0pO1xuICB9O1xufSkuY29udHJvbGxlcignSm9iUGxhbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkd2luZG93LCBKb2JzU2VydmljZSkge1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAkc2NvcGUuc3RhdGVMaXN0ID0gSm9ic1NlcnZpY2Uuc3RhdGVMaXN0KCk7XG4gICRzY29wZS5jaGFuZ2VOb2RlID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgaWYgKG5vZGVpZCAhPT0gJHNjb3BlLm5vZGVpZCkge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG5vZGVpZDtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgICRzY29wZS5hY2N1bXVsYXRvcnMgPSBudWxsO1xuICAgICAgJHNjb3BlLm9wZXJhdG9yQ2hlY2twb2ludFN0YXRzID0gbnVsbDtcbiAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdyZWxvYWQnKTtcbiAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdCgnbm9kZTpjaGFuZ2UnLCAkc2NvcGUubm9kZWlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2U7XG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbDtcbiAgICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUub3BlcmF0b3JDaGVja3BvaW50U3RhdHMgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmRlYWN0aXZhdGVOb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm5vZGVpZCA9IG51bGw7XG4gICAgJHNjb3BlLm5vZGVVbmZvbGRlZCA9IGZhbHNlO1xuICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICRzY29wZS5zdWJ0YXNrcyA9IG51bGw7XG4gICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgcmV0dXJuICRzY29wZS5vcGVyYXRvckNoZWNrcG9pbnRTdGF0cyA9IG51bGw7XG4gIH07XG4gIHJldHVybiAkc2NvcGUudG9nZ2xlRm9sZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUubm9kZVVuZm9sZGVkID0gISRzY29wZS5ub2RlVW5mb2xkZWQ7XG4gIH07XG59KS5jb250cm9sbGVyKCdKb2JQbGFuU3VidGFza3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0U3VidGFza3M7XG4gICRzY29wZS5hZ2dyZWdhdGUgPSBmYWxzZTtcbiAgZ2V0U3VidGFza3MgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmFnZ3JlZ2F0ZSkge1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldFRhc2tNYW5hZ2Vycygkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS50YXNrbWFuYWdlcnMgPSBkYXRhO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRTdWJ0YXNrcygkc2NvcGUubm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrcyA9IGRhdGE7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGlmICgkc2NvcGUubm9kZWlkICYmICghJHNjb3BlLnZlcnRleCB8fCAhJHNjb3BlLnZlcnRleC5zdCkpIHtcbiAgICBnZXRTdWJ0YXNrcygpO1xuICB9XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgICByZXR1cm4gZ2V0U3VidGFza3MoKTtcbiAgICB9XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkFjY3VtdWxhdG9yc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRBY2N1bXVsYXRvcnM7XG4gIGdldEFjY3VtdWxhdG9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBKb2JzU2VydmljZS5nZXRBY2N1bXVsYXRvcnMoJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gZGF0YS5tYWluO1xuICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrQWNjdW11bGF0b3JzID0gZGF0YS5zdWJ0YXNrcztcbiAgICB9KTtcbiAgfTtcbiAgaWYgKCRzY29wZS5ub2RlaWQgJiYgKCEkc2NvcGUudmVydGV4IHx8ICEkc2NvcGUudmVydGV4LmFjY3VtdWxhdG9ycykpIHtcbiAgICBnZXRBY2N1bXVsYXRvcnMoKTtcbiAgfVxuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldEFjY3VtdWxhdG9ycygpO1xuICAgIH1cbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JQbGFuQ2hlY2twb2ludHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgSm9ic1NlcnZpY2UpIHtcbiAgdmFyIGdldEdlbmVyYWxDaGVja3BvaW50U3RhdHM7XG4gICRzY29wZS5jaGVja3BvaW50RGV0YWlscyA9IHt9O1xuICAkc2NvcGUuY2hlY2twb2ludERldGFpbHMuaWQgPSAtMTtcbiAgSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludENvbmZpZygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiAkc2NvcGUuY2hlY2twb2ludENvbmZpZyA9IGRhdGE7XG4gIH0pO1xuICBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldENoZWNrcG9pbnRTdGF0cygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5jaGVja3BvaW50U3RhdHMgPSBkYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzKCk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCdyZWxvYWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgIHJldHVybiBnZXRHZW5lcmFsQ2hlY2twb2ludFN0YXRzKCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkNoZWNrcG9pbnREZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRDaGVja3BvaW50RGV0YWlscywgZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzO1xuICAkc2NvcGUuc3VidGFza0RldGFpbHMgPSB7fTtcbiAgJHNjb3BlLmNoZWNrcG9pbnREZXRhaWxzLmlkID0gJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZDtcbiAgZ2V0Q2hlY2twb2ludERldGFpbHMgPSBmdW5jdGlvbihjaGVja3BvaW50SWQpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludERldGFpbHMoY2hlY2twb2ludElkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUuY2hlY2twb2ludCA9IGRhdGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHNjb3BlLnVua25vd25fY2hlY2twb2ludCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIGdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscyA9IGZ1bmN0aW9uKGNoZWNrcG9pbnRJZCwgdmVydGV4SWQpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzKGNoZWNrcG9pbnRJZCwgdmVydGV4SWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5zdWJ0YXNrRGV0YWlsc1t2ZXJ0ZXhJZF0gPSBkYXRhO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBnZXRDaGVja3BvaW50RGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkKTtcbiAgaWYgKCRzY29wZS5ub2RlaWQpIHtcbiAgICBnZXRDaGVja3BvaW50U3VidGFza0RldGFpbHMoJHN0YXRlUGFyYW1zLmNoZWNrcG9pbnRJZCwgJHNjb3BlLm5vZGVpZCk7XG4gIH1cbiAgJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBnZXRDaGVja3BvaW50RGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIGdldENoZWNrcG9pbnRTdWJ0YXNrRGV0YWlscygkc3RhdGVQYXJhbXMuY2hlY2twb2ludElkLCAkc2NvcGUubm9kZWlkKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLmNoZWNrcG9pbnREZXRhaWxzLmlkID0gLTE7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iUGxhbkJhY2tQcmVzc3VyZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEpvYnNTZXJ2aWNlKSB7XG4gIHZhciBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZTtcbiAgZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubm93ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoJHNjb3BlLm5vZGVpZCkge1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldE9wZXJhdG9yQmFja1ByZXNzdXJlKCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJHNjb3BlLmJhY2tQcmVzc3VyZU9wZXJhdG9yU3RhdHNbJHNjb3BlLm5vZGVpZF0gPSBkYXRhO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBnZXRPcGVyYXRvckJhY2tQcmVzc3VyZSgpO1xuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUoKTtcbiAgfSk7XG59KS5jb250cm9sbGVyKCdKb2JUaW1lbGluZVZlcnRleENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICB2YXIgZ2V0VmVydGV4O1xuICBnZXRWZXJ0ZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzdGF0ZVBhcmFtcy52ZXJ0ZXhJZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLnZlcnRleCA9IGRhdGE7XG4gICAgfSk7XG4gIH07XG4gIGdldFZlcnRleCgpO1xuICByZXR1cm4gJHNjb3BlLiRvbigncmVsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gZ2V0VmVydGV4KCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignSm9iRXhjZXB0aW9uc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBKb2JzU2VydmljZSkge1xuICByZXR1cm4gSm9ic1NlcnZpY2UubG9hZEV4Y2VwdGlvbnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLmV4Y2VwdGlvbnMgPSBkYXRhO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ0pvYlByb3BlcnRpZXNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSkge1xuICByZXR1cm4gJHNjb3BlLmNoYW5nZU5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICBpZiAobm9kZWlkICE9PSAkc2NvcGUubm9kZWlkKSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkO1xuICAgICAgcmV0dXJuIEpvYnNTZXJ2aWNlLmdldE5vZGUobm9kZWlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRzY29wZS5ub2RlID0gZGF0YTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUubm9kZSA9IG51bGw7XG4gICAgfVxuICB9O1xufSkuY29udHJvbGxlcignSm9iUGxhbk1ldHJpY3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JzU2VydmljZSwgTWV0cmljc1NlcnZpY2UpIHtcbiAgdmFyIGFscGhhYmV0aWNhbFNvcnRCeUlkLCBsb2FkTWV0cmljcztcbiAgJHNjb3BlLmRyYWdnaW5nID0gZmFsc2U7XG4gICRzY29wZS53aW5kb3cgPSBNZXRyaWNzU2VydmljZS5nZXRXaW5kb3coKTtcbiAgJHNjb3BlLmF2YWlsYWJsZU1ldHJpY3MgPSBudWxsO1xuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNZXRyaWNzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoKTtcbiAgfSk7XG4gIGxvYWRNZXRyaWNzID0gZnVuY3Rpb24oKSB7XG4gICAgSm9ic1NlcnZpY2UuZ2V0VmVydGV4KCRzY29wZS5ub2RlaWQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuICRzY29wZS52ZXJ0ZXggPSBkYXRhO1xuICAgIH0pO1xuICAgIHJldHVybiBNZXRyaWNzU2VydmljZS5nZXRBdmFpbGFibGVNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuYXZhaWxhYmxlTWV0cmljcyA9IGRhdGEuc29ydChhbHBoYWJldGljYWxTb3J0QnlJZCk7XG4gICAgICAkc2NvcGUubWV0cmljcyA9IE1ldHJpY3NTZXJ2aWNlLmdldE1ldHJpY3NTZXR1cCgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQpLm5hbWVzO1xuICAgICAgcmV0dXJuIE1ldHJpY3NTZXJ2aWNlLnJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYmlkLCAkc2NvcGUubm9kZWlkLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkc2NvcGUuJGJyb2FkY2FzdChcIm1ldHJpY3M6ZGF0YTp1cGRhdGVcIiwgZGF0YS50aW1lc3RhbXAsIGRhdGEudmFsdWVzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuICBhbHBoYWJldGljYWxTb3J0QnlJZCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgQSwgQjtcbiAgICBBID0gYS5pZC50b0xvd2VyQ2FzZSgpO1xuICAgIEIgPSBiLmlkLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKEEgPCBCKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSBlbHNlIGlmIChBID4gQikge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmRyb3BwZWQgPSBmdW5jdGlvbihldmVudCwgaW5kZXgsIGl0ZW0sIGV4dGVybmFsLCB0eXBlKSB7XG4gICAgTWV0cmljc1NlcnZpY2Uub3JkZXJNZXRyaWNzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgaXRlbSwgaW5kZXgpO1xuICAgICRzY29wZS4kYnJvYWRjYXN0KFwibWV0cmljczpyZWZyZXNoXCIsIGl0ZW0pO1xuICAgIGxvYWRNZXRyaWNzKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICAkc2NvcGUuZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5kcmFnZ2luZyA9IHRydWU7XG4gIH07XG4gICRzY29wZS5kcmFnRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5kcmFnZ2luZyA9IGZhbHNlO1xuICB9O1xuICAkc2NvcGUuYWRkTWV0cmljID0gZnVuY3Rpb24obWV0cmljKSB7XG4gICAgTWV0cmljc1NlcnZpY2UuYWRkTWV0cmljKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljLmlkKTtcbiAgICByZXR1cm4gbG9hZE1ldHJpY3MoKTtcbiAgfTtcbiAgJHNjb3BlLnJlbW92ZU1ldHJpYyA9IGZ1bmN0aW9uKG1ldHJpYykge1xuICAgIE1ldHJpY3NTZXJ2aWNlLnJlbW92ZU1ldHJpYygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYyk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5zZXRNZXRyaWNTaXplID0gZnVuY3Rpb24obWV0cmljLCBzaXplKSB7XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljU2l6ZSgkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgc2l6ZSk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5zZXRNZXRyaWNWaWV3ID0gZnVuY3Rpb24obWV0cmljLCB2aWV3KSB7XG4gICAgTWV0cmljc1NlcnZpY2Uuc2V0TWV0cmljVmlldygkc2NvcGUuam9iaWQsICRzY29wZS5ub2RlaWQsIG1ldHJpYywgdmlldyk7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH07XG4gICRzY29wZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbihtZXRyaWMpIHtcbiAgICByZXR1cm4gTWV0cmljc1NlcnZpY2UuZ2V0VmFsdWVzKCRzY29wZS5qb2JpZCwgJHNjb3BlLm5vZGVpZCwgbWV0cmljKTtcbiAgfTtcbiAgJHNjb3BlLiRvbignbm9kZTpjaGFuZ2UnLCBmdW5jdGlvbihldmVudCwgbm9kZWlkKSB7XG4gICAgaWYgKCEkc2NvcGUuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybiBsb2FkTWV0cmljcygpO1xuICAgIH1cbiAgfSk7XG4gIGlmICgkc2NvcGUubm9kZWlkKSB7XG4gICAgcmV0dXJuIGxvYWRNZXRyaWNzKCk7XG4gIH1cbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICd2ZXJ0ZXgnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZSBzZWNvbmRhcnknIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiXG5cbiAgc2NvcGU6XG4gICAgZGF0YTogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICBhbmFseXplVGltZSA9IChkYXRhKSAtPlxuICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpXG5cbiAgICAgIHRlc3REYXRhID0gW11cblxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEuc3VidGFza3MsIChzdWJ0YXNrLCBpKSAtPlxuICAgICAgICB0aW1lcyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJTY2hlZHVsZWRcIlxuICAgICAgICAgICAgY29sb3I6IFwiIzY2NlwiXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCJcbiAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlNDSEVEVUxFRFwiXVxuICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIkRlcGxveWluZ1wiXG4gICAgICAgICAgICBjb2xvcjogXCIjYWFhXCJcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTVcIlxuICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiREVQTE9ZSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiUlVOTklOR1wiXVxuICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgfVxuICAgICAgICBdXG5cbiAgICAgICAgaWYgc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl0gPiAwXG4gICAgICAgICAgdGltZXMucHVzaCB7XG4gICAgICAgICAgICBsYWJlbDogXCJSdW5uaW5nXCJcbiAgICAgICAgICAgIGNvbG9yOiBcIiNkZGRcIlxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiXG4gICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJSVU5OSU5HXCJdXG4gICAgICAgICAgICBlbmRpbmdfdGltZTogc3VidGFzay50aW1lc3RhbXBzW1wiRklOSVNIRURcIl1cbiAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgIH1cblxuICAgICAgICB0ZXN0RGF0YS5wdXNoIHtcbiAgICAgICAgICBsYWJlbDogXCIoI3tzdWJ0YXNrLnN1YnRhc2t9KSAje3N1YnRhc2suaG9zdH1cIlxuICAgICAgICAgIHRpbWVzOiB0aW1lc1xuICAgICAgICB9XG5cbiAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpXG4gICAgICAudGlja0Zvcm1hdCh7XG4gICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKVxuICAgICAgICAjIHRpY2tJbnRlcnZhbDogMVxuICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgfSlcbiAgICAgIC5wcmVmaXgoXCJzaW5nbGVcIilcbiAgICAgIC5sYWJlbEZvcm1hdCgobGFiZWwpIC0+XG4gICAgICAgIGxhYmVsXG4gICAgICApXG4gICAgICAubWFyZ2luKHsgbGVmdDogMTAwLCByaWdodDogMCwgdG9wOiAwLCBib3R0b206IDAgfSlcbiAgICAgIC5pdGVtSGVpZ2h0KDMwKVxuICAgICAgLnJlbGF0aXZlVGltZSgpXG5cbiAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmdFbClcbiAgICAgIC5kYXR1bSh0ZXN0RGF0YSlcbiAgICAgIC5jYWxsKGNoYXJ0KVxuXG4gICAgYW5hbHl6ZVRpbWUoc2NvcGUuZGF0YSlcblxuICAgIHJldHVyblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAndGltZWxpbmUnLCAoJHN0YXRlKSAtPlxuICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZScgd2lkdGg9JzAnIGhlaWdodD0nMCc+PC9zdmc+XCJcblxuICBzY29wZTpcbiAgICB2ZXJ0aWNlczogXCI9XCJcbiAgICBqb2JpZDogXCI9XCJcblxuICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSAtPlxuICAgIHN2Z0VsID0gZWxlbS5jaGlsZHJlbigpWzBdXG5cbiAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpXG4gICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpXG5cbiAgICB0cmFuc2xhdGVMYWJlbCA9IChsYWJlbCkgLT5cbiAgICAgIGxhYmVsLnJlcGxhY2UoXCImZ3Q7XCIsIFwiPlwiKVxuXG4gICAgYW5hbHl6ZVRpbWUgPSAoZGF0YSkgLT5cbiAgICAgIGQzLnNlbGVjdChzdmdFbCkuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKVxuXG4gICAgICB0ZXN0RGF0YSA9IFtdXG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLCAodmVydGV4KSAtPlxuICAgICAgICBpZiB2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSA+IC0xXG4gICAgICAgICAgaWYgdmVydGV4LnR5cGUgaXMgJ3NjaGVkdWxlZCdcbiAgICAgICAgICAgIHRlc3REYXRhLnB1c2hcbiAgICAgICAgICAgICAgdGltZXM6IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlTGFiZWwodmVydGV4Lm5hbWUpXG4gICAgICAgICAgICAgICAgY29sb3I6IFwiI2NjY2NjY1wiXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NTU1NVwiXG4gICAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogdmVydGV4WydzdGFydC10aW1lJ11cbiAgICAgICAgICAgICAgICBlbmRpbmdfdGltZTogdmVydGV4WydlbmQtdGltZSddXG4gICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRlc3REYXRhLnB1c2hcbiAgICAgICAgICAgICAgdGltZXM6IFtcbiAgICAgICAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlTGFiZWwodmVydGV4Lm5hbWUpXG4gICAgICAgICAgICAgICAgY29sb3I6IFwiI2Q5ZjFmN1wiXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzYyY2RlYVwiXG4gICAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogdmVydGV4WydzdGFydC10aW1lJ11cbiAgICAgICAgICAgICAgICBlbmRpbmdfdGltZTogdmVydGV4WydlbmQtdGltZSddXG4gICAgICAgICAgICAgICAgbGluazogdmVydGV4LmlkXG4gICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgXVxuXG4gICAgICBjaGFydCA9IGQzLnRpbWVsaW5lKCkuc3RhY2soKS5jbGljaygoZCwgaSwgZGF0dW0pIC0+XG4gICAgICAgIGlmIGQubGlua1xuICAgICAgICAgICRzdGF0ZS5nbyBcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsIHsgam9iaWQ6IHNjb3BlLmpvYmlkLCB2ZXJ0ZXhJZDogZC5saW5rIH1cblxuICAgICAgKVxuICAgICAgLnRpY2tGb3JtYXQoe1xuICAgICAgICBmb3JtYXQ6IGQzLnRpbWUuZm9ybWF0KFwiJUxcIilcbiAgICAgICAgIyB0aWNrVGltZTogZDMudGltZS5zZWNvbmRcbiAgICAgICAgIyB0aWNrSW50ZXJ2YWw6IDAuNVxuICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgfSlcbiAgICAgIC5wcmVmaXgoXCJtYWluXCIpXG4gICAgICAubWFyZ2luKHsgbGVmdDogMCwgcmlnaHQ6IDAsIHRvcDogMCwgYm90dG9tOiAwIH0pXG4gICAgICAuaXRlbUhlaWdodCgzMClcbiAgICAgIC5zaG93Qm9yZGVyTGluZSgpXG4gICAgICAuc2hvd0hvdXJUaW1lbGluZSgpXG5cbiAgICAgIHN2ZyA9IGQzLnNlbGVjdChzdmdFbClcbiAgICAgIC5kYXR1bSh0ZXN0RGF0YSlcbiAgICAgIC5jYWxsKGNoYXJ0KVxuXG4gICAgc2NvcGUuJHdhdGNoIGF0dHJzLnZlcnRpY2VzLCAoZGF0YSkgLT5cbiAgICAgIGFuYWx5emVUaW1lKGRhdGEpIGlmIGRhdGFcblxuICAgIHJldHVyblxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLmRpcmVjdGl2ZSAnc3BsaXQnLCAoKSAtPlxuICByZXR1cm4gY29tcGlsZTogKHRFbGVtLCB0QXR0cnMpIC0+XG4gICAgICBTcGxpdCh0RWxlbS5jaGlsZHJlbigpLCAoXG4gICAgICAgIHNpemVzOiBbNTAsIDUwXVxuICAgICAgICBkaXJlY3Rpb246ICd2ZXJ0aWNhbCdcbiAgICAgICkpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdqb2JQbGFuJywgKCR0aW1lb3V0KSAtPlxuICB0ZW1wbGF0ZTogXCJcbiAgICA8c3ZnIGNsYXNzPSdncmFwaCc+PGcgLz48L3N2Zz5cbiAgICA8c3ZnIGNsYXNzPSd0bXAnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxnIC8+PC9zdmc+XG4gICAgPGRpdiBjbGFzcz0nYnRuLWdyb3VwIHpvb20tYnV0dG9ucyc+XG4gICAgICA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IHpvb20taW4nIG5nLWNsaWNrPSd6b29tSW4oKSc+PGkgY2xhc3M9J2ZhIGZhLXBsdXMnIC8+PC9hPlxuICAgICAgPGEgY2xhc3M9J2J0biBidG4tZGVmYXVsdCB6b29tLW91dCcgbmctY2xpY2s9J3pvb21PdXQoKSc+PGkgY2xhc3M9J2ZhIGZhLW1pbnVzJyAvPjwvYT5cbiAgICA8L2Rpdj5cIlxuXG4gIHNjb3BlOlxuICAgIHBsYW46ICc9J1xuICAgIHdhdGVybWFya3M6ICc9J1xuICAgIHNldE5vZGU6ICcmJ1xuXG4gIGxpbms6IChzY29wZSwgZWxlbSwgYXR0cnMpIC0+XG4gICAgZyA9IG51bGxcbiAgICBtYWluWm9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgIHN1YmdyYXBocyA9IFtdXG4gICAgam9iaWQgPSBhdHRycy5qb2JpZFxuXG4gICAgbWFpblN2Z0VsZW1lbnQgPSBlbGVtLmNoaWxkcmVuKClbMF1cbiAgICBtYWluRyA9IGVsZW0uY2hpbGRyZW4oKS5jaGlsZHJlbigpWzBdXG4gICAgbWFpblRtcEVsZW1lbnQgPSBlbGVtLmNoaWxkcmVuKClbMV1cblxuICAgIGQzbWFpblN2ZyA9IGQzLnNlbGVjdChtYWluU3ZnRWxlbWVudClcbiAgICBkM21haW5TdmdHID0gZDMuc2VsZWN0KG1haW5HKVxuICAgIGQzdG1wU3ZnID0gZDMuc2VsZWN0KG1haW5UbXBFbGVtZW50KVxuXG4gICAgIyBhbmd1bGFyLmVsZW1lbnQobWFpbkcpLmVtcHR5KClcbiAgICAjIGQzbWFpblN2Z0cuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKVxuXG4gICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKVxuICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtLmNoaWxkcmVuKClbMF0pLndpZHRoKGNvbnRhaW5lclcpXG5cbiAgICBsYXN0Wm9vbVNjYWxlID0gMFxuICAgIGxhc3RQb3NpdGlvbiA9IDBcblxuICAgIHNjb3BlLnpvb21JbiA9IC0+XG4gICAgICBpZiBtYWluWm9vbS5zY2FsZSgpIDwgMi45OVxuXG4gICAgICAgICMgQ2FsY3VsYXRlIGFuZCBzdG9yZSBuZXcgdmFsdWVzIGluIHpvb20gb2JqZWN0XG4gICAgICAgIHRyYW5zbGF0ZSA9IG1haW5ab29tLnRyYW5zbGF0ZSgpXG4gICAgICAgIHYxID0gdHJhbnNsYXRlWzBdICogKG1haW5ab29tLnNjYWxlKCkgKyAwLjEgLyAobWFpblpvb20uc2NhbGUoKSkpXG4gICAgICAgIHYyID0gdHJhbnNsYXRlWzFdICogKG1haW5ab29tLnNjYWxlKCkgKyAwLjEgLyAobWFpblpvb20uc2NhbGUoKSkpXG4gICAgICAgIG1haW5ab29tLnNjYWxlIG1haW5ab29tLnNjYWxlKCkgKyAwLjFcbiAgICAgICAgbWFpblpvb20udHJhbnNsYXRlIFsgdjEsIHYyIF1cblxuICAgICAgICAjIFRyYW5zZm9ybSBzdmdcbiAgICAgICAgZDNtYWluU3ZnRy5hdHRyIFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdjEgKyBcIixcIiArIHYyICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiXG5cbiAgICAgICAgbGFzdFpvb21TY2FsZSA9IG1haW5ab29tLnNjYWxlKClcbiAgICAgICAgbGFzdFBvc2l0aW9uID0gbWFpblpvb20udHJhbnNsYXRlKClcblxuICAgIHNjb3BlLnpvb21PdXQgPSAtPlxuICAgICAgaWYgbWFpblpvb20uc2NhbGUoKSA+IDAuMzFcblxuICAgICAgICAjIENhbGN1bGF0ZSBhbmQgc3RvcmUgbmV3IHZhbHVlcyBpbiBtYWluWm9vbSBvYmplY3RcbiAgICAgICAgbWFpblpvb20uc2NhbGUgbWFpblpvb20uc2NhbGUoKSAtIDAuMVxuICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKVxuICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUgWyB2MSwgdjIgXVxuXG4gICAgICAgICMgVHJhbnNmb3JtIHN2Z1xuICAgICAgICBkM21haW5TdmdHLmF0dHIgXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB2MSArIFwiLFwiICsgdjIgKyBcIikgc2NhbGUoXCIgKyBtYWluWm9vbS5zY2FsZSgpICsgXCIpXCJcblxuICAgICAgICBsYXN0Wm9vbVNjYWxlID0gbWFpblpvb20uc2NhbGUoKVxuICAgICAgICBsYXN0UG9zaXRpb24gPSBtYWluWm9vbS50cmFuc2xhdGUoKVxuXG4gICAgI2NyZWF0ZSBhIGxhYmVsIG9mIGFuIGVkZ2VcbiAgICBjcmVhdGVMYWJlbEVkZ2UgPSAoZWwpIC0+XG4gICAgICBsYWJlbFZhbHVlID0gXCJcIlxuICAgICAgaWYgZWwuc2hpcF9zdHJhdGVneT8gb3IgZWwubG9jYWxfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8ZGl2IGNsYXNzPSdlZGdlLWxhYmVsJz5cIlxuICAgICAgICBsYWJlbFZhbHVlICs9IGVsLnNoaXBfc3RyYXRlZ3kgIGlmIGVsLnNoaXBfc3RyYXRlZ3k/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCIgKFwiICsgZWwudGVtcF9tb2RlICsgXCIpXCIgIHVubGVzcyBlbC50ZW1wX21vZGUgaXMgYHVuZGVmaW5lZGBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneSAgdW5sZXNzIGVsLmxvY2FsX3N0cmF0ZWd5IGlzIGB1bmRlZmluZWRgXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8L2Rpdj5cIlxuICAgICAgbGFiZWxWYWx1ZVxuXG5cbiAgICAjIHRydWUsIGlmIHRoZSBub2RlIGlzIGEgc3BlY2lhbCBub2RlIGZyb20gYW4gaXRlcmF0aW9uXG4gICAgaXNTcGVjaWFsSXRlcmF0aW9uTm9kZSA9IChpbmZvKSAtPlxuICAgICAgKGluZm8gaXMgXCJwYXJ0aWFsU29sdXRpb25cIiBvciBpbmZvIGlzIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIG9yIGluZm8gaXMgXCJ3b3Jrc2V0XCIgb3IgaW5mbyBpcyBcIm5leHRXb3Jrc2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uU2V0XCIgb3IgaW5mbyBpcyBcInNvbHV0aW9uRGVsdGFcIilcblxuICAgIGdldE5vZGVUeXBlID0gKGVsLCBpbmZvKSAtPlxuICAgICAgaWYgaW5mbyBpcyBcIm1pcnJvclwiXG4gICAgICAgICdub2RlLW1pcnJvcidcblxuICAgICAgZWxzZSBpZiBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pXG4gICAgICAgICdub2RlLWl0ZXJhdGlvbidcblxuICAgICAgZWxzZVxuICAgICAgICAnbm9kZS1ub3JtYWwnXG5cbiAgICAjIGNyZWF0ZXMgdGhlIGxhYmVsIG9mIGEgbm9kZSwgaW4gaW5mbyBpcyBzdG9yZWQsIHdoZXRoZXIgaXQgaXMgYSBzcGVjaWFsIG5vZGUgKGxpa2UgYSBtaXJyb3IgaW4gYW4gaXRlcmF0aW9uKVxuICAgIGNyZWF0ZUxhYmVsTm9kZSA9IChlbCwgaW5mbywgbWF4VywgbWF4SCkgLT5cbiAgICAgICMgbGFiZWxWYWx1ZSA9IFwiPGEgaHJlZj0nIy9qb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0ZXgvXCIgKyBlbC5pZCArIFwiJyBjbGFzcz0nbm9kZS1sYWJlbCBcIiArIGdldE5vZGVUeXBlKGVsLCBpbmZvKSArIFwiJz5cIlxuICAgICAgbGFiZWxWYWx1ZSA9IFwiPGRpdiBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiXG5cbiAgICAgICMgTm9kZW5hbWVcbiAgICAgIGlmIGluZm8gaXMgXCJtaXJyb3JcIlxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGgzIGNsYXNzPSdub2RlLW5hbWUnPk1pcnJvciBvZiBcIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiXG4gICAgICBlbHNlXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+XCIgKyBlbC5vcGVyYXRvciArIFwiPC9oMz5cIlxuICAgICAgaWYgZWwuZGVzY3JpcHRpb24gaXMgXCJcIlxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgc3RlcE5hbWUgPSBlbC5kZXNjcmlwdGlvblxuXG4gICAgICAgICMgY2xlYW4gc3RlcE5hbWVcbiAgICAgICAgc3RlcE5hbWUgPSBzaG9ydGVuU3RyaW5nKHN0ZXBOYW1lKVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg0IGNsYXNzPSdzdGVwLW5hbWUnPlwiICsgc3RlcE5hbWUgKyBcIjwvaDQ+XCJcblxuICAgICAgIyBJZiB0aGlzIG5vZGUgaXMgYW4gXCJpdGVyYXRpb25cIiB3ZSBuZWVkIGEgZGlmZmVyZW50IHBhbmVsLWJvZHlcbiAgICAgIGlmIGVsLnN0ZXBfZnVuY3Rpb24/XG4gICAgICAgIGxhYmVsVmFsdWUgKz0gZXh0ZW5kTGFiZWxOb2RlRm9ySXRlcmF0aW9uKGVsLmlkLCBtYXhXLCBtYXhIKVxuICAgICAgZWxzZVxuXG4gICAgICAgICMgT3RoZXJ3aXNlIGFkZCBpbmZvc1xuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1PlwiICsgaW5mbyArIFwiIE5vZGU8L2g1PlwiICBpZiBpc1NwZWNpYWxJdGVyYXRpb25Ob2RlKGluZm8pXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+UGFyYWxsZWxpc206IFwiICsgZWwucGFyYWxsZWxpc20gKyBcIjwvaDU+XCIgIHVubGVzcyBlbC5wYXJhbGxlbGlzbSBpcyBcIlwiXG4gICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+TG93IFdhdGVybWFyazogXCIgKyBlbC5sb3dXYXRlcm1hcmsgKyBcIjwvaDU+XCIgIHVubGVzcyBlbC5sb3dXYXRlcm1hcmsgaXMgYHVuZGVmaW5lZGBcbiAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5PcGVyYXRpb246IFwiICsgc2hvcnRlblN0cmluZyhlbC5vcGVyYXRvcl9zdHJhdGVneSkgKyBcIjwvaDU+XCIgdW5sZXNzIGVsLm9wZXJhdG9yIGlzIGB1bmRlZmluZWRgIG9yIG5vdCBlbC5vcGVyYXRvcl9zdHJhdGVneVxuICAgICAgIyBsYWJlbFZhbHVlICs9IFwiPC9hPlwiXG4gICAgICBsYWJlbFZhbHVlICs9IFwiPC9kaXY+XCJcbiAgICAgIGxhYmVsVmFsdWVcblxuICAgICMgRXh0ZW5kcyB0aGUgbGFiZWwgb2YgYSBub2RlIHdpdGggYW4gYWRkaXRpb25hbCBzdmcgRWxlbWVudCB0byBwcmVzZW50IHRoZSBpdGVyYXRpb24uXG4gICAgZXh0ZW5kTGFiZWxOb2RlRm9ySXRlcmF0aW9uID0gKGlkLCBtYXhXLCBtYXhIKSAtPlxuICAgICAgc3ZnSUQgPSBcInN2Zy1cIiArIGlkXG5cbiAgICAgIGxhYmVsVmFsdWUgPSBcIjxzdmcgY2xhc3M9J1wiICsgc3ZnSUQgKyBcIicgd2lkdGg9XCIgKyBtYXhXICsgXCIgaGVpZ2h0PVwiICsgbWF4SCArIFwiPjxnIC8+PC9zdmc+XCJcbiAgICAgIGxhYmVsVmFsdWVcblxuICAgICMgU3BsaXQgYSBzdHJpbmcgaW50byBtdWx0aXBsZSBsaW5lcyBzbyB0aGF0IGVhY2ggbGluZSBoYXMgbGVzcyB0aGFuIDMwIGxldHRlcnMuXG4gICAgc2hvcnRlblN0cmluZyA9IChzKSAtPlxuICAgICAgIyBtYWtlIHN1cmUgdGhhdCBuYW1lIGRvZXMgbm90IGNvbnRhaW4gYSA8IChiZWNhdXNlIG9mIGh0bWwpXG4gICAgICBpZiBzLmNoYXJBdCgwKSBpcyBcIjxcIlxuICAgICAgICBzID0gcy5yZXBsYWNlKFwiPFwiLCBcIiZsdDtcIilcbiAgICAgICAgcyA9IHMucmVwbGFjZShcIj5cIiwgXCImZ3Q7XCIpXG4gICAgICBzYnIgPSBcIlwiXG4gICAgICB3aGlsZSBzLmxlbmd0aCA+IDMwXG4gICAgICAgIHNiciA9IHNiciArIHMuc3Vic3RyaW5nKDAsIDMwKSArIFwiPGJyPlwiXG4gICAgICAgIHMgPSBzLnN1YnN0cmluZygzMCwgcy5sZW5ndGgpXG4gICAgICBzYnIgPSBzYnIgKyBzXG4gICAgICBzYnJcblxuICAgIGNyZWF0ZU5vZGUgPSAoZywgZGF0YSwgZWwsIGlzUGFyZW50ID0gZmFsc2UsIG1heFcsIG1heEgpIC0+XG4gICAgICAjIGNyZWF0ZSBub2RlLCBzZW5kIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25zIGFib3V0IHRoZSBub2RlIGlmIGl0IGlzIGEgc3BlY2lhbCBvbmVcbiAgICAgIGlmIGVsLmlkIGlzIGRhdGEucGFydGlhbF9zb2x1dGlvblxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIiwgbWF4VywgbWF4SClcbiAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICAgIGNsYXNzOiBnZXROb2RlVHlwZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLm5leHRfcGFydGlhbF9zb2x1dGlvblxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJuZXh0UGFydGlhbFNvbHV0aW9uXCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiKVxuXG4gICAgICBlbHNlIGlmIGVsLmlkIGlzIGRhdGEud29ya3NldFxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJ3b3Jrc2V0XCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwid29ya3NldFwiKVxuXG4gICAgICBlbHNlIGlmIGVsLmlkIGlzIGRhdGEubmV4dF93b3Jrc2V0XG4gICAgICAgIGcuc2V0Tm9kZSBlbC5pZCxcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIm5leHRXb3Jrc2V0XCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFdvcmtzZXRcIilcblxuICAgICAgZWxzZSBpZiBlbC5pZCBpcyBkYXRhLnNvbHV0aW9uX3NldFxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJzb2x1dGlvblNldFwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uU2V0XCIpXG5cbiAgICAgIGVsc2UgaWYgZWwuaWQgaXMgZGF0YS5zb2x1dGlvbl9kZWx0YVxuICAgICAgICBnLnNldE5vZGUgZWwuaWQsXG4gICAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsTm9kZShlbCwgXCJzb2x1dGlvbkRlbHRhXCIsIG1heFcsIG1heEgpXG4gICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCdcbiAgICAgICAgICBjbGFzczogZ2V0Tm9kZVR5cGUoZWwsIFwic29sdXRpb25EZWx0YVwiKVxuXG4gICAgICBlbHNlXG4gICAgICAgIGcuc2V0Tm9kZSBlbC5pZCxcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIlwiLCBtYXhXLCBtYXhIKVxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnXG4gICAgICAgICAgY2xhc3M6IGdldE5vZGVUeXBlKGVsLCBcIlwiKVxuXG4gICAgY3JlYXRlRWRnZSA9IChnLCBkYXRhLCBlbCwgZXhpc3RpbmdOb2RlcywgcHJlZCkgLT5cbiAgICAgIGcuc2V0RWRnZSBwcmVkLmlkLCBlbC5pZCxcbiAgICAgICAgbGFiZWw6IGNyZWF0ZUxhYmVsRWRnZShwcmVkKVxuICAgICAgICBsYWJlbFR5cGU6ICdodG1sJ1xuICAgICAgICBhcnJvd2hlYWQ6ICdub3JtYWwnXG5cbiAgICBsb2FkSnNvblRvRGFncmUgPSAoZywgZGF0YSkgLT5cbiAgICAgIGV4aXN0aW5nTm9kZXMgPSBbXVxuXG4gICAgICBpZiBkYXRhLm5vZGVzP1xuICAgICAgICAjIFRoaXMgaXMgdGhlIG5vcm1hbCBqc29uIGRhdGFcbiAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5ub2Rlc1xuXG4gICAgICBlbHNlXG4gICAgICAgICMgVGhpcyBpcyBhbiBpdGVyYXRpb24sIHdlIG5vdyBzdG9yZSBzcGVjaWFsIGl0ZXJhdGlvbiBub2RlcyBpZiBwb3NzaWJsZVxuICAgICAgICB0b0l0ZXJhdGUgPSBkYXRhLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgaXNQYXJlbnQgPSB0cnVlXG5cbiAgICAgIGZvciBlbCBpbiB0b0l0ZXJhdGVcbiAgICAgICAgbWF4VyA9IDBcbiAgICAgICAgbWF4SCA9IDBcblxuICAgICAgICBpZiBlbC5zdGVwX2Z1bmN0aW9uXG4gICAgICAgICAgc2cgPSBuZXcgZGFncmVEMy5ncmFwaGxpYi5HcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICAgIG5vZGVzZXA6IDIwXG4gICAgICAgICAgICBlZGdlc2VwOiAwXG4gICAgICAgICAgICByYW5rc2VwOiAyMFxuICAgICAgICAgICAgcmFua2RpcjogXCJMUlwiXG4gICAgICAgICAgICBtYXJnaW54OiAxMFxuICAgICAgICAgICAgbWFyZ2lueTogMTBcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICBzdWJncmFwaHNbZWwuaWRdID0gc2dcblxuICAgICAgICAgIGxvYWRKc29uVG9EYWdyZShzZywgZWwpXG5cbiAgICAgICAgICByID0gbmV3IGRhZ3JlRDMucmVuZGVyKClcbiAgICAgICAgICBkM3RtcFN2Zy5zZWxlY3QoJ2cnKS5jYWxsKHIsIHNnKVxuICAgICAgICAgIG1heFcgPSBzZy5ncmFwaCgpLndpZHRoXG4gICAgICAgICAgbWF4SCA9IHNnLmdyYXBoKCkuaGVpZ2h0XG5cbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQobWFpblRtcEVsZW1lbnQpLmVtcHR5KClcblxuICAgICAgICBjcmVhdGVOb2RlKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SClcblxuICAgICAgICBleGlzdGluZ05vZGVzLnB1c2ggZWwuaWRcblxuICAgICAgICAjIGNyZWF0ZSBlZGdlcyBmcm9tIGlucHV0cyB0byBjdXJyZW50IG5vZGVcbiAgICAgICAgaWYgZWwuaW5wdXRzP1xuICAgICAgICAgIGZvciBwcmVkIGluIGVsLmlucHV0c1xuICAgICAgICAgICAgY3JlYXRlRWRnZShnLCBkYXRhLCBlbCwgZXhpc3RpbmdOb2RlcywgcHJlZClcblxuICAgICAgZ1xuXG4gICAgIyBzZWFyY2hlcyBpbiB0aGUgZ2xvYmFsIEpTT05EYXRhIGZvciB0aGUgbm9kZSB3aXRoIHRoZSBnaXZlbiBpZFxuICAgIHNlYXJjaEZvck5vZGUgPSAoZGF0YSwgbm9kZUlEKSAtPlxuICAgICAgZm9yIGkgb2YgZGF0YS5ub2Rlc1xuICAgICAgICBlbCA9IGRhdGEubm9kZXNbaV1cbiAgICAgICAgcmV0dXJuIGVsICBpZiBlbC5pZCBpcyBub2RlSURcblxuICAgICAgICAjIGxvb2sgZm9yIG5vZGVzIHRoYXQgYXJlIGluIGl0ZXJhdGlvbnNcbiAgICAgICAgaWYgZWwuc3RlcF9mdW5jdGlvbj9cbiAgICAgICAgICBmb3IgaiBvZiBlbC5zdGVwX2Z1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm4gZWwuc3RlcF9mdW5jdGlvbltqXSAgaWYgZWwuc3RlcF9mdW5jdGlvbltqXS5pZCBpcyBub2RlSURcblxuICAgIG1lcmdlV2F0ZXJtYXJrcyA9IChkYXRhLCB3YXRlcm1hcmtzKSAtPlxuICAgICAgaWYgKCFfLmlzRW1wdHkod2F0ZXJtYXJrcykpXG4gICAgICAgIGZvciBub2RlIGluIGRhdGEubm9kZXNcbiAgICAgICAgICBpZiAod2F0ZXJtYXJrc1tub2RlLmlkXSAmJiAhaXNOYU4od2F0ZXJtYXJrc1tub2RlLmlkXVtcImxvd1dhdGVybWFya1wiXSkpXG4gICAgICAgICAgICBub2RlLmxvd1dhdGVybWFyayA9IHdhdGVybWFya3Nbbm9kZS5pZF1bXCJsb3dXYXRlcm1hcmtcIl1cblxuICAgICAgcmV0dXJuIGRhdGFcblxuICAgIGxhc3RQb3NpdGlvbiA9IDBcbiAgICBsYXN0Wm9vbVNjYWxlID0gMFxuXG4gICAgZHJhd0dyYXBoID0gKCkgLT5cbiAgICAgIGlmIHNjb3BlLnBsYW5cbiAgICAgICAgZyA9IG5ldyBkYWdyZUQzLmdyYXBobGliLkdyYXBoKHsgbXVsdGlncmFwaDogdHJ1ZSwgY29tcG91bmQ6IHRydWUgfSkuc2V0R3JhcGgoe1xuICAgICAgICAgIG5vZGVzZXA6IDcwXG4gICAgICAgICAgZWRnZXNlcDogMFxuICAgICAgICAgIHJhbmtzZXA6IDUwXG4gICAgICAgICAgcmFua2RpcjogXCJMUlwiXG4gICAgICAgICAgbWFyZ2lueDogNDBcbiAgICAgICAgICBtYXJnaW55OiA0MFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIG1lcmdlV2F0ZXJtYXJrcyhzY29wZS5wbGFuLCBzY29wZS53YXRlcm1hcmtzKSlcblxuICAgICAgICBkM21haW5TdmdHLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKClcblxuICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJzY2FsZShcIiArIDEgKyBcIilcIilcblxuICAgICAgICByZW5kZXJlciA9IG5ldyBkYWdyZUQzLnJlbmRlcigpXG4gICAgICAgIGQzbWFpblN2Z0cuY2FsbChyZW5kZXJlciwgZylcblxuICAgICAgICBmb3IgaSwgc2cgb2Ygc3ViZ3JhcGhzXG4gICAgICAgICAgZDNtYWluU3ZnLnNlbGVjdCgnc3ZnLnN2Zy0nICsgaSArICcgZycpLmNhbGwocmVuZGVyZXIsIHNnKVxuXG4gICAgICAgIG5ld1NjYWxlID0gMC41XG5cbiAgICAgICAgeENlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkud2lkdGgoKSAtIGcuZ3JhcGgoKS53aWR0aCAqIG5ld1NjYWxlKSAvIDIpXG4gICAgICAgIHlDZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKChhbmd1bGFyLmVsZW1lbnQobWFpblN2Z0VsZW1lbnQpLmhlaWdodCgpIC0gZy5ncmFwaCgpLmhlaWdodCAqIG5ld1NjYWxlKSAvIDIpXG5cbiAgICAgICAgaWYgbGFzdFpvb21TY2FsZSAhPSAwICYmIGxhc3RQb3NpdGlvbiAhPSAwXG4gICAgICAgICAgbWFpblpvb20uc2NhbGUobGFzdFpvb21TY2FsZSkudHJhbnNsYXRlKGxhc3RQb3NpdGlvbilcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBsYXN0UG9zaXRpb24gKyBcIikgc2NhbGUoXCIgKyBsYXN0Wm9vbVNjYWxlICsgXCIpXCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYWluWm9vbS5zY2FsZShuZXdTY2FsZSkudHJhbnNsYXRlKFt4Q2VudGVyT2Zmc2V0LCB5Q2VudGVyT2Zmc2V0XSlcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB4Q2VudGVyT2Zmc2V0ICsgXCIsIFwiICsgeUNlbnRlck9mZnNldCArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIilcblxuICAgICAgICBtYWluWm9vbS5vbihcInpvb21cIiwgLT5cbiAgICAgICAgICBldiA9IGQzLmV2ZW50XG4gICAgICAgICAgbGFzdFpvb21TY2FsZSA9IGV2LnNjYWxlXG4gICAgICAgICAgbGFzdFBvc2l0aW9uID0gZXYudHJhbnNsYXRlXG4gICAgICAgICAgZDNtYWluU3ZnRy5hdHRyIFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbGFzdFBvc2l0aW9uICsgXCIpIHNjYWxlKFwiICsgbGFzdFpvb21TY2FsZSArIFwiKVwiXG4gICAgICAgIClcbiAgICAgICAgbWFpblpvb20oZDNtYWluU3ZnKVxuXG4gICAgICAgIGQzbWFpblN2Z0cuc2VsZWN0QWxsKCcubm9kZScpLm9uICdjbGljaycsIChkKSAtPlxuICAgICAgICAgIHNjb3BlLnNldE5vZGUoeyBub2RlaWQ6IGQgfSlcblxuICAgIHNjb3BlLiR3YXRjaCBhdHRycy5wbGFuLCAobmV3UGxhbikgLT5cbiAgICAgIGRyYXdHcmFwaCgpIGlmIG5ld1BsYW5cblxuICAgIHNjb3BlLiR3YXRjaCBhdHRycy53YXRlcm1hcmtzLCAobmV3V2F0ZXJtYXJrcykgLT5cbiAgICAgIGRyYXdHcmFwaCgpIGlmIG5ld1dhdGVybWFya3MgJiYgc2NvcGUucGxhblxuXG4gICAgcmV0dXJuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4uZGlyZWN0aXZlICdnbG9iYWxPdmVydmlldycsICgkdGltZW91dCkgLT5cbiAgdGVtcGxhdGU6IFwiXG4gICAgPGRpdiBjbGFzcz0nZ2xvYmFsLW92ZXJ2aWV3Jz5cbiAgICAgIDx0YWJsZSBjbGFzcz0ndGFibGUgdGFibGUtcHJvcGVydGllcyc+XG4gICAgICAgIDx0aGVhZD5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGggY29sc3Bhbj0nMic+R2xvYmFsIE92ZXJ2aWV3PC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPkluY29taW5nPC90ZD5cbiAgICAgICAgICAgIDx0ZCBjbGFzcz0ncmlnaHQnPnt7aW5jb21pbmd9fTwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+T3V0Z29pbmc8L3RkPlxuICAgICAgICAgICAgPHRkIGNsYXNzPSdyaWdodCc+e3tvdXRnb2luZ319PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cIlxuXG4gIHNjb3BlOlxuICAgIGpvYjogJz0nXG5cbiAgbGluazogKHNjb3BlLCBlbGVtLCBhdHRycykgLT5cbiAgICBzY29wZS5pbmNvbWluZyA9IDBcbiAgICBzY29wZS5vdXRnb2luZyA9IDBcblxuICAgIHNjb3BlLiR3YXRjaCBhdHRycy5qb2IsIChkYXRhKSAtPlxuICAgICAgc2NvcGUucHJlZGVjZXNzb3JzID0gW11cbiAgICAgIHNjb3BlLnNvdXJjZXMgPSBbXVxuICAgICAgc2NvcGUuc2lua3MgPSBbXVxuXG4gICAgICBpZiBkYXRhXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEucGxhbi5ub2RlcylcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEucGxhbi5ub2RlcywgKG5vZGUpIC0+XG4gICAgICAgICAgaWYgIW5vZGUuaW5wdXRzXG4gICAgICAgICAgICBzY29wZS5zb3VyY2VzLnB1c2gobm9kZS5pZClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzY29wZS5wcmVkZWNlc3NvcnMgPSBzY29wZS5wcmVkZWNlc3NvcnMuY29uY2F0KF8ubWFwKG5vZGUuaW5wdXRzLCAoaW5wdXQpIC0+IGlucHV0LmlkKSlcbiAgICAgICAgKVxuICAgICAgICBjb25zb2xlLmxvZyhzY29wZS5zb3VyY2VzKVxuXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLnBsYW4ubm9kZXMsIChub2RlKSAtPlxuICAgICAgICAgIGlmICFfLmNvbnRhaW5zKHNjb3BlLnByZWRlY2Vzc29ycywgbm9kZS5pZClcbiAgICAgICAgICAgIHNjb3BlLnNpbmtzLnB1c2gobm9kZS5pZClcbiAgICAgICAgKVxuICAgICAgICBjb25zb2xlLmxvZyhzY29wZS5zaW5rcylcblxuICAgIHJldHVyblxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuZGlyZWN0aXZlKCd2ZXJ0ZXgnLCBmdW5jdGlvbigkc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZW1wbGF0ZTogXCI8c3ZnIGNsYXNzPSd0aW1lbGluZSBzZWNvbmRhcnknIHdpZHRoPScwJyBoZWlnaHQ9JzAnPjwvc3ZnPlwiLFxuICAgIHNjb3BlOiB7XG4gICAgICBkYXRhOiBcIj1cIlxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzKSB7XG4gICAgICB2YXIgYW5hbHl6ZVRpbWUsIGNvbnRhaW5lclcsIHN2Z0VsO1xuICAgICAgc3ZnRWwgPSBlbGVtLmNoaWxkcmVuKClbMF07XG4gICAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpO1xuICAgICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpO1xuICAgICAgYW5hbHl6ZVRpbWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBjaGFydCwgc3ZnLCB0ZXN0RGF0YTtcbiAgICAgICAgZDMuc2VsZWN0KHN2Z0VsKS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICAgICAgICB0ZXN0RGF0YSA9IFtdO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YS5zdWJ0YXNrcywgZnVuY3Rpb24oc3VidGFzaywgaSkge1xuICAgICAgICAgIHZhciB0aW1lcztcbiAgICAgICAgICB0aW1lcyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiU2NoZWR1bGVkXCIsXG4gICAgICAgICAgICAgIGNvbG9yOiBcIiM2NjZcIixcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwiIzU1NVwiLFxuICAgICAgICAgICAgICBzdGFydGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJTQ0hFRFVMRURcIl0sXG4gICAgICAgICAgICAgIGVuZGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJERVBMT1lJTkdcIl0sXG4gICAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBsYWJlbDogXCJEZXBsb3lpbmdcIixcbiAgICAgICAgICAgICAgY29sb3I6IFwiI2FhYVwiLFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCIsXG4gICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIkRFUExPWUlOR1wiXSxcbiAgICAgICAgICAgICAgZW5kaW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlJVTk5JTkdcIl0sXG4gICAgICAgICAgICAgIHR5cGU6ICdyZWd1bGFyJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF07XG4gICAgICAgICAgaWYgKHN1YnRhc2sudGltZXN0YW1wc1tcIkZJTklTSEVEXCJdID4gMCkge1xuICAgICAgICAgICAgdGltZXMucHVzaCh7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIlJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgY29sb3I6IFwiI2RkZFwiLFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCIjNTU1XCIsXG4gICAgICAgICAgICAgIHN0YXJ0aW5nX3RpbWU6IHN1YnRhc2sudGltZXN0YW1wc1tcIlJVTk5JTkdcIl0sXG4gICAgICAgICAgICAgIGVuZGluZ190aW1lOiBzdWJ0YXNrLnRpbWVzdGFtcHNbXCJGSU5JU0hFRFwiXSxcbiAgICAgICAgICAgICAgdHlwZTogJ3JlZ3VsYXInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRlc3REYXRhLnB1c2goe1xuICAgICAgICAgICAgbGFiZWw6IFwiKFwiICsgc3VidGFzay5zdWJ0YXNrICsgXCIpIFwiICsgc3VidGFzay5ob3N0LFxuICAgICAgICAgICAgdGltZXM6IHRpbWVzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjaGFydCA9IGQzLnRpbWVsaW5lKCkuc3RhY2soKS50aWNrRm9ybWF0KHtcbiAgICAgICAgICBmb3JtYXQ6IGQzLnRpbWUuZm9ybWF0KFwiJUxcIiksXG4gICAgICAgICAgdGlja1NpemU6IDFcbiAgICAgICAgfSkucHJlZml4KFwic2luZ2xlXCIpLmxhYmVsRm9ybWF0KGZ1bmN0aW9uKGxhYmVsKSB7XG4gICAgICAgICAgcmV0dXJuIGxhYmVsO1xuICAgICAgICB9KS5tYXJnaW4oe1xuICAgICAgICAgIGxlZnQ6IDEwMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgYm90dG9tOiAwXG4gICAgICAgIH0pLml0ZW1IZWlnaHQoMzApLnJlbGF0aXZlVGltZSgpO1xuICAgICAgICByZXR1cm4gc3ZnID0gZDMuc2VsZWN0KHN2Z0VsKS5kYXR1bSh0ZXN0RGF0YSkuY2FsbChjaGFydCk7XG4gICAgICB9O1xuICAgICAgYW5hbHl6ZVRpbWUoc2NvcGUuZGF0YSk7XG4gICAgfVxuICB9O1xufSkuZGlyZWN0aXZlKCd0aW1lbGluZScsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBcIjxzdmcgY2xhc3M9J3RpbWVsaW5lJyB3aWR0aD0nMCcgaGVpZ2h0PScwJz48L3N2Zz5cIixcbiAgICBzY29wZToge1xuICAgICAgdmVydGljZXM6IFwiPVwiLFxuICAgICAgam9iaWQ6IFwiPVwiXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBhbmFseXplVGltZSwgY29udGFpbmVyVywgc3ZnRWwsIHRyYW5zbGF0ZUxhYmVsO1xuICAgICAgc3ZnRWwgPSBlbGVtLmNoaWxkcmVuKClbMF07XG4gICAgICBjb250YWluZXJXID0gZWxlbS53aWR0aCgpO1xuICAgICAgYW5ndWxhci5lbGVtZW50KHN2Z0VsKS5hdHRyKCd3aWR0aCcsIGNvbnRhaW5lclcpO1xuICAgICAgdHJhbnNsYXRlTGFiZWwgPSBmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICByZXR1cm4gbGFiZWwucmVwbGFjZShcIiZndDtcIiwgXCI+XCIpO1xuICAgICAgfTtcbiAgICAgIGFuYWx5emVUaW1lID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgY2hhcnQsIHN2ZywgdGVzdERhdGE7XG4gICAgICAgIGQzLnNlbGVjdChzdmdFbCkuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgICAgICAgdGVzdERhdGEgPSBbXTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZlcnRleCkge1xuICAgICAgICAgIGlmICh2ZXJ0ZXhbJ3N0YXJ0LXRpbWUnXSA+IC0xKSB7XG4gICAgICAgICAgICBpZiAodmVydGV4LnR5cGUgPT09ICdzY2hlZHVsZWQnKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZXN0RGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICB0aW1lczogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlTGFiZWwodmVydGV4Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCIjY2NjY2NjXCIsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM1NTU1NTVcIixcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogdmVydGV4WydzdGFydC10aW1lJ10sXG4gICAgICAgICAgICAgICAgICAgIGVuZGluZ190aW1lOiB2ZXJ0ZXhbJ2VuZC10aW1lJ10sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHZlcnRleC50eXBlXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZXN0RGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICB0aW1lczogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdHJhbnNsYXRlTGFiZWwodmVydGV4Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogXCIjZDlmMWY3XCIsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcIiM2MmNkZWFcIixcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRpbmdfdGltZTogdmVydGV4WydzdGFydC10aW1lJ10sXG4gICAgICAgICAgICAgICAgICAgIGVuZGluZ190aW1lOiB2ZXJ0ZXhbJ2VuZC10aW1lJ10sXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IHZlcnRleC5pZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdmVydGV4LnR5cGVcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNoYXJ0ID0gZDMudGltZWxpbmUoKS5zdGFjaygpLmNsaWNrKGZ1bmN0aW9uKGQsIGksIGRhdHVtKSB7XG4gICAgICAgICAgaWYgKGQubGluaykge1xuICAgICAgICAgICAgcmV0dXJuICRzdGF0ZS5nbyhcInNpbmdsZS1qb2IudGltZWxpbmUudmVydGV4XCIsIHtcbiAgICAgICAgICAgICAgam9iaWQ6IHNjb3BlLmpvYmlkLFxuICAgICAgICAgICAgICB2ZXJ0ZXhJZDogZC5saW5rXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLnRpY2tGb3JtYXQoe1xuICAgICAgICAgIGZvcm1hdDogZDMudGltZS5mb3JtYXQoXCIlTFwiKSxcbiAgICAgICAgICB0aWNrU2l6ZTogMVxuICAgICAgICB9KS5wcmVmaXgoXCJtYWluXCIpLm1hcmdpbih7XG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgYm90dG9tOiAwXG4gICAgICAgIH0pLml0ZW1IZWlnaHQoMzApLnNob3dCb3JkZXJMaW5lKCkuc2hvd0hvdXJUaW1lbGluZSgpO1xuICAgICAgICByZXR1cm4gc3ZnID0gZDMuc2VsZWN0KHN2Z0VsKS5kYXR1bSh0ZXN0RGF0YSkuY2FsbChjaGFydCk7XG4gICAgICB9O1xuICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLnZlcnRpY2VzLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIGFuYWx5emVUaW1lKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KS5kaXJlY3RpdmUoJ3NwbGl0JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgY29tcGlsZTogZnVuY3Rpb24odEVsZW0sIHRBdHRycykge1xuICAgICAgcmV0dXJuIFNwbGl0KHRFbGVtLmNoaWxkcmVuKCksIHtcbiAgICAgICAgc2l6ZXM6IFs1MCwgNTBdLFxuICAgICAgICBkaXJlY3Rpb246ICd2ZXJ0aWNhbCdcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnam9iUGxhbicsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6IFwiPHN2ZyBjbGFzcz0nZ3JhcGgnPjxnIC8+PC9zdmc+IDxzdmcgY2xhc3M9J3RtcCcgd2lkdGg9JzEnIGhlaWdodD0nMSc+PGcgLz48L3N2Zz4gPGRpdiBjbGFzcz0nYnRuLWdyb3VwIHpvb20tYnV0dG9ucyc+IDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQgem9vbS1pbicgbmctY2xpY2s9J3pvb21JbigpJz48aSBjbGFzcz0nZmEgZmEtcGx1cycgLz48L2E+IDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQgem9vbS1vdXQnIG5nLWNsaWNrPSd6b29tT3V0KCknPjxpIGNsYXNzPSdmYSBmYS1taW51cycgLz48L2E+IDwvZGl2PlwiLFxuICAgIHNjb3BlOiB7XG4gICAgICBwbGFuOiAnPScsXG4gICAgICB3YXRlcm1hcmtzOiAnPScsXG4gICAgICBzZXROb2RlOiAnJidcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xuICAgICAgdmFyIGNvbnRhaW5lclcsIGNyZWF0ZUVkZ2UsIGNyZWF0ZUxhYmVsRWRnZSwgY3JlYXRlTGFiZWxOb2RlLCBjcmVhdGVOb2RlLCBkM21haW5TdmcsIGQzbWFpblN2Z0csIGQzdG1wU3ZnLCBkcmF3R3JhcGgsIGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbiwgZywgZ2V0Tm9kZVR5cGUsIGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUsIGpvYmlkLCBsYXN0UG9zaXRpb24sIGxhc3Rab29tU2NhbGUsIGxvYWRKc29uVG9EYWdyZSwgbWFpbkcsIG1haW5TdmdFbGVtZW50LCBtYWluVG1wRWxlbWVudCwgbWFpblpvb20sIG1lcmdlV2F0ZXJtYXJrcywgc2VhcmNoRm9yTm9kZSwgc2hvcnRlblN0cmluZywgc3ViZ3JhcGhzO1xuICAgICAgZyA9IG51bGw7XG4gICAgICBtYWluWm9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKTtcbiAgICAgIHN1YmdyYXBocyA9IFtdO1xuICAgICAgam9iaWQgPSBhdHRycy5qb2JpZDtcbiAgICAgIG1haW5TdmdFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzBdO1xuICAgICAgbWFpbkcgPSBlbGVtLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVswXTtcbiAgICAgIG1haW5UbXBFbGVtZW50ID0gZWxlbS5jaGlsZHJlbigpWzFdO1xuICAgICAgZDNtYWluU3ZnID0gZDMuc2VsZWN0KG1haW5TdmdFbGVtZW50KTtcbiAgICAgIGQzbWFpblN2Z0cgPSBkMy5zZWxlY3QobWFpbkcpO1xuICAgICAgZDN0bXBTdmcgPSBkMy5zZWxlY3QobWFpblRtcEVsZW1lbnQpO1xuICAgICAgY29udGFpbmVyVyA9IGVsZW0ud2lkdGgoKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtLmNoaWxkcmVuKClbMF0pLndpZHRoKGNvbnRhaW5lclcpO1xuICAgICAgbGFzdFpvb21TY2FsZSA9IDA7XG4gICAgICBsYXN0UG9zaXRpb24gPSAwO1xuICAgICAgc2NvcGUuem9vbUluID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0cmFuc2xhdGUsIHYxLCB2MjtcbiAgICAgICAgaWYgKG1haW5ab29tLnNjYWxlKCkgPCAyLjk5KSB7XG4gICAgICAgICAgdHJhbnNsYXRlID0gbWFpblpvb20udHJhbnNsYXRlKCk7XG4gICAgICAgICAgdjEgPSB0cmFuc2xhdGVbMF0gKiAobWFpblpvb20uc2NhbGUoKSArIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgdjIgPSB0cmFuc2xhdGVbMV0gKiAobWFpblpvb20uc2NhbGUoKSArIDAuMSAvIChtYWluWm9vbS5zY2FsZSgpKSk7XG4gICAgICAgICAgbWFpblpvb20uc2NhbGUobWFpblpvb20uc2NhbGUoKSArIDAuMSk7XG4gICAgICAgICAgbWFpblpvb20udHJhbnNsYXRlKFt2MSwgdjJdKTtcbiAgICAgICAgICBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB2MSArIFwiLFwiICsgdjIgKyBcIikgc2NhbGUoXCIgKyBtYWluWm9vbS5zY2FsZSgpICsgXCIpXCIpO1xuICAgICAgICAgIGxhc3Rab29tU2NhbGUgPSBtYWluWm9vbS5zY2FsZSgpO1xuICAgICAgICAgIHJldHVybiBsYXN0UG9zaXRpb24gPSBtYWluWm9vbS50cmFuc2xhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLnpvb21PdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZSwgdjEsIHYyO1xuICAgICAgICBpZiAobWFpblpvb20uc2NhbGUoKSA+IDAuMzEpIHtcbiAgICAgICAgICBtYWluWm9vbS5zY2FsZShtYWluWm9vbS5zY2FsZSgpIC0gMC4xKTtcbiAgICAgICAgICB0cmFuc2xhdGUgPSBtYWluWm9vbS50cmFuc2xhdGUoKTtcbiAgICAgICAgICB2MSA9IHRyYW5zbGF0ZVswXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKTtcbiAgICAgICAgICB2MiA9IHRyYW5zbGF0ZVsxXSAqIChtYWluWm9vbS5zY2FsZSgpIC0gMC4xIC8gKG1haW5ab29tLnNjYWxlKCkpKTtcbiAgICAgICAgICBtYWluWm9vbS50cmFuc2xhdGUoW3YxLCB2Ml0pO1xuICAgICAgICAgIGQzbWFpblN2Z0cuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHYxICsgXCIsXCIgKyB2MiArIFwiKSBzY2FsZShcIiArIG1haW5ab29tLnNjYWxlKCkgKyBcIilcIik7XG4gICAgICAgICAgbGFzdFpvb21TY2FsZSA9IG1haW5ab29tLnNjYWxlKCk7XG4gICAgICAgICAgcmV0dXJuIGxhc3RQb3NpdGlvbiA9IG1haW5ab29tLnRyYW5zbGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY3JlYXRlTGFiZWxFZGdlID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGxhYmVsVmFsdWU7XG4gICAgICAgIGxhYmVsVmFsdWUgPSBcIlwiO1xuICAgICAgICBpZiAoKGVsLnNoaXBfc3RyYXRlZ3kgIT0gbnVsbCkgfHwgKGVsLmxvY2FsX3N0cmF0ZWd5ICE9IG51bGwpKSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxkaXYgY2xhc3M9J2VkZ2UtbGFiZWwnPlwiO1xuICAgICAgICAgIGlmIChlbC5zaGlwX3N0cmF0ZWd5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gZWwuc2hpcF9zdHJhdGVneTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLnRlbXBfbW9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiIChcIiArIGVsLnRlbXBfbW9kZSArIFwiKVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWwubG9jYWxfc3RyYXRlZ3kgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIiw8YnI+XCIgKyBlbC5sb2NhbF9zdHJhdGVneTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjwvZGl2PlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYWJlbFZhbHVlO1xuICAgICAgfTtcbiAgICAgIGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUgPSBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHJldHVybiBpbmZvID09PSBcInBhcnRpYWxTb2x1dGlvblwiIHx8IGluZm8gPT09IFwibmV4dFBhcnRpYWxTb2x1dGlvblwiIHx8IGluZm8gPT09IFwid29ya3NldFwiIHx8IGluZm8gPT09IFwibmV4dFdvcmtzZXRcIiB8fCBpbmZvID09PSBcInNvbHV0aW9uU2V0XCIgfHwgaW5mbyA9PT0gXCJzb2x1dGlvbkRlbHRhXCI7XG4gICAgICB9O1xuICAgICAgZ2V0Tm9kZVR5cGUgPSBmdW5jdGlvbihlbCwgaW5mbykge1xuICAgICAgICBpZiAoaW5mbyA9PT0gXCJtaXJyb3JcIikge1xuICAgICAgICAgIHJldHVybiAnbm9kZS1taXJyb3InO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUoaW5mbykpIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtaXRlcmF0aW9uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ25vZGUtbm9ybWFsJztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNyZWF0ZUxhYmVsTm9kZSA9IGZ1bmN0aW9uKGVsLCBpbmZvLCBtYXhXLCBtYXhIKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlLCBzdGVwTmFtZTtcbiAgICAgICAgbGFiZWxWYWx1ZSA9IFwiPGRpdiBocmVmPScjL2pvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRleC9cIiArIGVsLmlkICsgXCInIGNsYXNzPSdub2RlLWxhYmVsIFwiICsgZ2V0Tm9kZVR5cGUoZWwsIGluZm8pICsgXCInPlwiO1xuICAgICAgICBpZiAoaW5mbyA9PT0gXCJtaXJyb3JcIikge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDMgY2xhc3M9J25vZGUtbmFtZSc+TWlycm9yIG9mIFwiICsgZWwub3BlcmF0b3IgKyBcIjwvaDM+XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoMyBjbGFzcz0nbm9kZS1uYW1lJz5cIiArIGVsLm9wZXJhdG9yICsgXCI8L2gzPlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5kZXNjcmlwdGlvbiA9PT0gXCJcIikge1xuICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCJcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGVwTmFtZSA9IGVsLmRlc2NyaXB0aW9uO1xuICAgICAgICAgIHN0ZXBOYW1lID0gc2hvcnRlblN0cmluZyhzdGVwTmFtZSk7XG4gICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNCBjbGFzcz0nc3RlcC1uYW1lJz5cIiArIHN0ZXBOYW1lICsgXCI8L2g0PlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbC5zdGVwX2Z1bmN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICBsYWJlbFZhbHVlICs9IGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbihlbC5pZCwgbWF4VywgbWF4SCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGlzU3BlY2lhbEl0ZXJhdGlvbk5vZGUoaW5mbykpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+XCIgKyBpbmZvICsgXCIgTm9kZTwvaDU+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbC5wYXJhbGxlbGlzbSAhPT0gXCJcIikge1xuICAgICAgICAgICAgbGFiZWxWYWx1ZSArPSBcIjxoNT5QYXJhbGxlbGlzbTogXCIgKyBlbC5wYXJhbGxlbGlzbSArIFwiPC9oNT5cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLmxvd1dhdGVybWFyayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsYWJlbFZhbHVlICs9IFwiPGg1PkxvdyBXYXRlcm1hcms6IFwiICsgZWwubG93V2F0ZXJtYXJrICsgXCI8L2g1PlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIShlbC5vcGVyYXRvciA9PT0gdW5kZWZpbmVkIHx8ICFlbC5vcGVyYXRvcl9zdHJhdGVneSkpIHtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgKz0gXCI8aDU+T3BlcmF0aW9uOiBcIiArIHNob3J0ZW5TdHJpbmcoZWwub3BlcmF0b3Jfc3RyYXRlZ3kpICsgXCI8L2g1PlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYWJlbFZhbHVlICs9IFwiPC9kaXY+XCI7XG4gICAgICAgIHJldHVybiBsYWJlbFZhbHVlO1xuICAgICAgfTtcbiAgICAgIGV4dGVuZExhYmVsTm9kZUZvckl0ZXJhdGlvbiA9IGZ1bmN0aW9uKGlkLCBtYXhXLCBtYXhIKSB7XG4gICAgICAgIHZhciBsYWJlbFZhbHVlLCBzdmdJRDtcbiAgICAgICAgc3ZnSUQgPSBcInN2Zy1cIiArIGlkO1xuICAgICAgICBsYWJlbFZhbHVlID0gXCI8c3ZnIGNsYXNzPSdcIiArIHN2Z0lEICsgXCInIHdpZHRoPVwiICsgbWF4VyArIFwiIGhlaWdodD1cIiArIG1heEggKyBcIj48ZyAvPjwvc3ZnPlwiO1xuICAgICAgICByZXR1cm4gbGFiZWxWYWx1ZTtcbiAgICAgIH07XG4gICAgICBzaG9ydGVuU3RyaW5nID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgc2JyO1xuICAgICAgICBpZiAocy5jaGFyQXQoMCkgPT09IFwiPFwiKSB7XG4gICAgICAgICAgcyA9IHMucmVwbGFjZShcIjxcIiwgXCImbHQ7XCIpO1xuICAgICAgICAgIHMgPSBzLnJlcGxhY2UoXCI+XCIsIFwiJmd0O1wiKTtcbiAgICAgICAgfVxuICAgICAgICBzYnIgPSBcIlwiO1xuICAgICAgICB3aGlsZSAocy5sZW5ndGggPiAzMCkge1xuICAgICAgICAgIHNiciA9IHNiciArIHMuc3Vic3RyaW5nKDAsIDMwKSArIFwiPGJyPlwiO1xuICAgICAgICAgIHMgPSBzLnN1YnN0cmluZygzMCwgcy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHNiciA9IHNiciArIHM7XG4gICAgICAgIHJldHVybiBzYnI7XG4gICAgICB9O1xuICAgICAgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKGcsIGRhdGEsIGVsLCBpc1BhcmVudCwgbWF4VywgbWF4SCkge1xuICAgICAgICBpZiAoaXNQYXJlbnQgPT0gbnVsbCkge1xuICAgICAgICAgIGlzUGFyZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsLmlkID09PSBkYXRhLnBhcnRpYWxfc29sdXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInBhcnRpYWxTb2x1dGlvblwiLCBtYXhXLCBtYXhIKSxcbiAgICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnLFxuICAgICAgICAgICAgXCJjbGFzc1wiOiBnZXROb2RlVHlwZShlbCwgXCJwYXJ0aWFsU29sdXRpb25cIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5uZXh0X3BhcnRpYWxfc29sdXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIm5leHRQYXJ0aWFsU29sdXRpb25cIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFBhcnRpYWxTb2x1dGlvblwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLndvcmtzZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcIndvcmtzZXRcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwid29ya3NldFwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmlkID09PSBkYXRhLm5leHRfd29ya3NldCkge1xuICAgICAgICAgIHJldHVybiBnLnNldE5vZGUoZWwuaWQsIHtcbiAgICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwibmV4dFdvcmtzZXRcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwibmV4dFdvcmtzZXRcIilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5pZCA9PT0gZGF0YS5zb2x1dGlvbl9zZXQpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInNvbHV0aW9uU2V0XCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcInNvbHV0aW9uU2V0XCIpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuaWQgPT09IGRhdGEuc29sdXRpb25fZGVsdGEpIHtcbiAgICAgICAgICByZXR1cm4gZy5zZXROb2RlKGVsLmlkLCB7XG4gICAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxOb2RlKGVsLCBcInNvbHV0aW9uRGVsdGFcIiwgbWF4VywgbWF4SCksXG4gICAgICAgICAgICBsYWJlbFR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIFwiY2xhc3NcIjogZ2V0Tm9kZVR5cGUoZWwsIFwic29sdXRpb25EZWx0YVwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBnLnNldE5vZGUoZWwuaWQsIHtcbiAgICAgICAgICAgIGxhYmVsOiBjcmVhdGVMYWJlbE5vZGUoZWwsIFwiXCIsIG1heFcsIG1heEgpLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBcImNsYXNzXCI6IGdldE5vZGVUeXBlKGVsLCBcIlwiKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY3JlYXRlRWRnZSA9IGZ1bmN0aW9uKGcsIGRhdGEsIGVsLCBleGlzdGluZ05vZGVzLCBwcmVkKSB7XG4gICAgICAgIHJldHVybiBnLnNldEVkZ2UocHJlZC5pZCwgZWwuaWQsIHtcbiAgICAgICAgICBsYWJlbDogY3JlYXRlTGFiZWxFZGdlKHByZWQpLFxuICAgICAgICAgIGxhYmVsVHlwZTogJ2h0bWwnLFxuICAgICAgICAgIGFycm93aGVhZDogJ25vcm1hbCdcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgbG9hZEpzb25Ub0RhZ3JlID0gZnVuY3Rpb24oZywgZGF0YSkge1xuICAgICAgICB2YXIgZWwsIGV4aXN0aW5nTm9kZXMsIGlzUGFyZW50LCBrLCBsLCBsZW4sIGxlbjEsIG1heEgsIG1heFcsIHByZWQsIHIsIHJlZiwgc2csIHRvSXRlcmF0ZTtcbiAgICAgICAgZXhpc3RpbmdOb2RlcyA9IFtdO1xuICAgICAgICBpZiAoZGF0YS5ub2RlcyAhPSBudWxsKSB7XG4gICAgICAgICAgdG9JdGVyYXRlID0gZGF0YS5ub2RlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b0l0ZXJhdGUgPSBkYXRhLnN0ZXBfZnVuY3Rpb247XG4gICAgICAgICAgaXNQYXJlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoayA9IDAsIGxlbiA9IHRvSXRlcmF0ZS5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgIGVsID0gdG9JdGVyYXRlW2tdO1xuICAgICAgICAgIG1heFcgPSAwO1xuICAgICAgICAgIG1heEggPSAwO1xuICAgICAgICAgIGlmIChlbC5zdGVwX2Z1bmN0aW9uKSB7XG4gICAgICAgICAgICBzZyA9IG5ldyBkYWdyZUQzLmdyYXBobGliLkdyYXBoKHtcbiAgICAgICAgICAgICAgbXVsdGlncmFwaDogdHJ1ZSxcbiAgICAgICAgICAgICAgY29tcG91bmQ6IHRydWVcbiAgICAgICAgICAgIH0pLnNldEdyYXBoKHtcbiAgICAgICAgICAgICAgbm9kZXNlcDogMjAsXG4gICAgICAgICAgICAgIGVkZ2VzZXA6IDAsXG4gICAgICAgICAgICAgIHJhbmtzZXA6IDIwLFxuICAgICAgICAgICAgICByYW5rZGlyOiBcIkxSXCIsXG4gICAgICAgICAgICAgIG1hcmdpbng6IDEwLFxuICAgICAgICAgICAgICBtYXJnaW55OiAxMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdWJncmFwaHNbZWwuaWRdID0gc2c7XG4gICAgICAgICAgICBsb2FkSnNvblRvRGFncmUoc2csIGVsKTtcbiAgICAgICAgICAgIHIgPSBuZXcgZGFncmVEMy5yZW5kZXIoKTtcbiAgICAgICAgICAgIGQzdG1wU3ZnLnNlbGVjdCgnZycpLmNhbGwociwgc2cpO1xuICAgICAgICAgICAgbWF4VyA9IHNnLmdyYXBoKCkud2lkdGg7XG4gICAgICAgICAgICBtYXhIID0gc2cuZ3JhcGgoKS5oZWlnaHQ7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQobWFpblRtcEVsZW1lbnQpLmVtcHR5KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNyZWF0ZU5vZGUoZywgZGF0YSwgZWwsIGlzUGFyZW50LCBtYXhXLCBtYXhIKTtcbiAgICAgICAgICBleGlzdGluZ05vZGVzLnB1c2goZWwuaWQpO1xuICAgICAgICAgIGlmIChlbC5pbnB1dHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVmID0gZWwuaW5wdXRzO1xuICAgICAgICAgICAgZm9yIChsID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGwgPCBsZW4xOyBsKyspIHtcbiAgICAgICAgICAgICAgcHJlZCA9IHJlZltsXTtcbiAgICAgICAgICAgICAgY3JlYXRlRWRnZShnLCBkYXRhLCBlbCwgZXhpc3RpbmdOb2RlcywgcHJlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnO1xuICAgICAgfTtcbiAgICAgIHNlYXJjaEZvck5vZGUgPSBmdW5jdGlvbihkYXRhLCBub2RlSUQpIHtcbiAgICAgICAgdmFyIGVsLCBpLCBqO1xuICAgICAgICBmb3IgKGkgaW4gZGF0YS5ub2Rlcykge1xuICAgICAgICAgIGVsID0gZGF0YS5ub2Rlc1tpXTtcbiAgICAgICAgICBpZiAoZWwuaWQgPT09IG5vZGVJRCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWwuc3RlcF9mdW5jdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3IgKGogaW4gZWwuc3RlcF9mdW5jdGlvbikge1xuICAgICAgICAgICAgICBpZiAoZWwuc3RlcF9mdW5jdGlvbltqXS5pZCA9PT0gbm9kZUlEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLnN0ZXBfZnVuY3Rpb25bal07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBtZXJnZVdhdGVybWFya3MgPSBmdW5jdGlvbihkYXRhLCB3YXRlcm1hcmtzKSB7XG4gICAgICAgIHZhciBrLCBsZW4sIG5vZGUsIHJlZjtcbiAgICAgICAgaWYgKCFfLmlzRW1wdHkod2F0ZXJtYXJrcykpIHtcbiAgICAgICAgICByZWYgPSBkYXRhLm5vZGVzO1xuICAgICAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgICAgbm9kZSA9IHJlZltrXTtcbiAgICAgICAgICAgIGlmICh3YXRlcm1hcmtzW25vZGUuaWRdICYmICFpc05hTih3YXRlcm1hcmtzW25vZGUuaWRdW1wibG93V2F0ZXJtYXJrXCJdKSkge1xuICAgICAgICAgICAgICBub2RlLmxvd1dhdGVybWFyayA9IHdhdGVybWFya3Nbbm9kZS5pZF1bXCJsb3dXYXRlcm1hcmtcIl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfTtcbiAgICAgIGxhc3RQb3NpdGlvbiA9IDA7XG4gICAgICBsYXN0Wm9vbVNjYWxlID0gMDtcbiAgICAgIGRyYXdHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaSwgbmV3U2NhbGUsIHJlbmRlcmVyLCBzZywgeENlbnRlck9mZnNldCwgeUNlbnRlck9mZnNldDtcbiAgICAgICAgaWYgKHNjb3BlLnBsYW4pIHtcbiAgICAgICAgICBnID0gbmV3IGRhZ3JlRDMuZ3JhcGhsaWIuR3JhcGgoe1xuICAgICAgICAgICAgbXVsdGlncmFwaDogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICAgICAgfSkuc2V0R3JhcGgoe1xuICAgICAgICAgICAgbm9kZXNlcDogNzAsXG4gICAgICAgICAgICBlZGdlc2VwOiAwLFxuICAgICAgICAgICAgcmFua3NlcDogNTAsXG4gICAgICAgICAgICByYW5rZGlyOiBcIkxSXCIsXG4gICAgICAgICAgICBtYXJnaW54OiA0MCxcbiAgICAgICAgICAgIG1hcmdpbnk6IDQwXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbG9hZEpzb25Ub0RhZ3JlKGcsIG1lcmdlV2F0ZXJtYXJrcyhzY29wZS5wbGFuLCBzY29wZS53YXRlcm1hcmtzKSk7XG4gICAgICAgICAgZDNtYWluU3ZnRy5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICAgICAgICAgIGQzbWFpblN2Z0cuYXR0cihcInRyYW5zZm9ybVwiLCBcInNjYWxlKFwiICsgMSArIFwiKVwiKTtcbiAgICAgICAgICByZW5kZXJlciA9IG5ldyBkYWdyZUQzLnJlbmRlcigpO1xuICAgICAgICAgIGQzbWFpblN2Z0cuY2FsbChyZW5kZXJlciwgZyk7XG4gICAgICAgICAgZm9yIChpIGluIHN1YmdyYXBocykge1xuICAgICAgICAgICAgc2cgPSBzdWJncmFwaHNbaV07XG4gICAgICAgICAgICBkM21haW5Tdmcuc2VsZWN0KCdzdmcuc3ZnLScgKyBpICsgJyBnJykuY2FsbChyZW5kZXJlciwgc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZXdTY2FsZSA9IDAuNTtcbiAgICAgICAgICB4Q2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcigoYW5ndWxhci5lbGVtZW50KG1haW5TdmdFbGVtZW50KS53aWR0aCgpIC0gZy5ncmFwaCgpLndpZHRoICogbmV3U2NhbGUpIC8gMik7XG4gICAgICAgICAgeUNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoKGFuZ3VsYXIuZWxlbWVudChtYWluU3ZnRWxlbWVudCkuaGVpZ2h0KCkgLSBnLmdyYXBoKCkuaGVpZ2h0ICogbmV3U2NhbGUpIC8gMik7XG4gICAgICAgICAgaWYgKGxhc3Rab29tU2NhbGUgIT09IDAgJiYgbGFzdFBvc2l0aW9uICE9PSAwKSB7XG4gICAgICAgICAgICBtYWluWm9vbS5zY2FsZShsYXN0Wm9vbVNjYWxlKS50cmFuc2xhdGUobGFzdFBvc2l0aW9uKTtcbiAgICAgICAgICAgIGQzbWFpblN2Z0cuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIGxhc3RQb3NpdGlvbiArIFwiKSBzY2FsZShcIiArIGxhc3Rab29tU2NhbGUgKyBcIilcIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1haW5ab29tLnNjYWxlKG5ld1NjYWxlKS50cmFuc2xhdGUoW3hDZW50ZXJPZmZzZXQsIHlDZW50ZXJPZmZzZXRdKTtcbiAgICAgICAgICAgIGQzbWFpblN2Z0cuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHhDZW50ZXJPZmZzZXQgKyBcIiwgXCIgKyB5Q2VudGVyT2Zmc2V0ICsgXCIpIHNjYWxlKFwiICsgbWFpblpvb20uc2NhbGUoKSArIFwiKVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWFpblpvb20ub24oXCJ6b29tXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGV2O1xuICAgICAgICAgICAgZXYgPSBkMy5ldmVudDtcbiAgICAgICAgICAgIGxhc3Rab29tU2NhbGUgPSBldi5zY2FsZTtcbiAgICAgICAgICAgIGxhc3RQb3NpdGlvbiA9IGV2LnRyYW5zbGF0ZTtcbiAgICAgICAgICAgIHJldHVybiBkM21haW5TdmdHLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBsYXN0UG9zaXRpb24gKyBcIikgc2NhbGUoXCIgKyBsYXN0Wm9vbVNjYWxlICsgXCIpXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIG1haW5ab29tKGQzbWFpblN2Zyk7XG4gICAgICAgICAgcmV0dXJuIGQzbWFpblN2Z0cuc2VsZWN0QWxsKCcubm9kZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zZXROb2RlKHtcbiAgICAgICAgICAgICAgbm9kZWlkOiBkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5wbGFuLCBmdW5jdGlvbihuZXdQbGFuKSB7XG4gICAgICAgIGlmIChuZXdQbGFuKSB7XG4gICAgICAgICAgcmV0dXJuIGRyYXdHcmFwaCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNjb3BlLiR3YXRjaChhdHRycy53YXRlcm1hcmtzLCBmdW5jdGlvbihuZXdXYXRlcm1hcmtzKSB7XG4gICAgICAgIGlmIChuZXdXYXRlcm1hcmtzICYmIHNjb3BlLnBsYW4pIHtcbiAgICAgICAgICByZXR1cm4gZHJhd0dyYXBoKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pLmRpcmVjdGl2ZSgnZ2xvYmFsT3ZlcnZpZXcnLCBmdW5jdGlvbigkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlOiBcIjxkaXYgY2xhc3M9J2dsb2JhbC1vdmVydmlldyc+IDx0YWJsZSBjbGFzcz0ndGFibGUgdGFibGUtcHJvcGVydGllcyc+IDx0aGVhZD4gPHRyPiA8dGggY29sc3Bhbj0nMic+R2xvYmFsIE92ZXJ2aWV3PC90aD4gPC90cj4gPC90aGVhZD4gPHRib2R5PiA8dHI+IDx0ZD5JbmNvbWluZzwvdGQ+IDx0ZCBjbGFzcz0ncmlnaHQnPnt7aW5jb21pbmd9fTwvdGQ+IDwvdHI+IDx0cj4gPHRkPk91dGdvaW5nPC90ZD4gPHRkIGNsYXNzPSdyaWdodCc+e3tvdXRnb2luZ319PC90ZD4gPC90cj4gPC90Ym9keT4gPC90YWJsZT4gPC9kaXY+XCIsXG4gICAgc2NvcGU6IHtcbiAgICAgIGpvYjogJz0nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLmluY29taW5nID0gMDtcbiAgICAgIHNjb3BlLm91dGdvaW5nID0gMDtcbiAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5qb2IsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2NvcGUucHJlZGVjZXNzb3JzID0gW107XG4gICAgICAgIHNjb3BlLnNvdXJjZXMgPSBbXTtcbiAgICAgICAgc2NvcGUuc2lua3MgPSBbXTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLnBsYW4ubm9kZXMpO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLnBsYW4ubm9kZXMsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5pbnB1dHMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnNvdXJjZXMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5wcmVkZWNlc3NvcnMgPSBzY29wZS5wcmVkZWNlc3NvcnMuY29uY2F0KF8ubWFwKG5vZGUuaW5wdXRzLCBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dC5pZDtcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHNjb3BlLnNvdXJjZXMpO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLnBsYW4ubm9kZXMsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghXy5jb250YWlucyhzY29wZS5wcmVkZWNlc3NvcnMsIG5vZGUuaWQpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5zaW5rcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhzY29wZS5zaW5rcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JzU2VydmljZScsICgkaHR0cCwgZmxpbmtDb25maWcsICRsb2csIGFtTW9tZW50LCAkcSwgJHRpbWVvdXQpIC0+XG4gIGN1cnJlbnRKb2IgPSBudWxsXG4gIGN1cnJlbnRQbGFuID0gbnVsbFxuXG4gIGRlZmVycmVkcyA9IHt9XG4gIGpvYnMgPSB7XG4gICAgcnVubmluZzogW11cbiAgICBmaW5pc2hlZDogW11cbiAgICBjYW5jZWxsZWQ6IFtdXG4gICAgZmFpbGVkOiBbXVxuICB9XG5cbiAgam9iT2JzZXJ2ZXJzID0gW11cblxuICBub3RpZnlPYnNlcnZlcnMgPSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBqb2JPYnNlcnZlcnMsIChjYWxsYmFjaykgLT5cbiAgICAgIGNhbGxiYWNrKClcblxuICBAcmVnaXN0ZXJPYnNlcnZlciA9IChjYWxsYmFjaykgLT5cbiAgICBqb2JPYnNlcnZlcnMucHVzaChjYWxsYmFjaylcblxuICBAdW5SZWdpc3Rlck9ic2VydmVyID0gKGNhbGxiYWNrKSAtPlxuICAgIGluZGV4ID0gam9iT2JzZXJ2ZXJzLmluZGV4T2YoY2FsbGJhY2spXG4gICAgam9iT2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSlcblxuICBAc3RhdGVMaXN0ID0gLT5cbiAgICBbIFxuICAgICAgIyAnQ1JFQVRFRCdcbiAgICAgICdTQ0hFRFVMRUQnXG4gICAgICAnREVQTE9ZSU5HJ1xuICAgICAgJ1JVTk5JTkcnXG4gICAgICAnRklOSVNIRUQnXG4gICAgICAnRkFJTEVEJ1xuICAgICAgJ0NBTkNFTElORydcbiAgICAgICdDQU5DRUxFRCdcbiAgICBdXG5cbiAgQHRyYW5zbGF0ZUxhYmVsU3RhdGUgPSAoc3RhdGUpIC0+XG4gICAgc3dpdGNoIHN0YXRlLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoZW4gJ2ZpbmlzaGVkJyB0aGVuICdzdWNjZXNzJ1xuICAgICAgd2hlbiAnZmFpbGVkJyB0aGVuICdkYW5nZXInXG4gICAgICB3aGVuICdzY2hlZHVsZWQnIHRoZW4gJ2RlZmF1bHQnXG4gICAgICB3aGVuICdkZXBsb3lpbmcnIHRoZW4gJ2luZm8nXG4gICAgICB3aGVuICdydW5uaW5nJyB0aGVuICdwcmltYXJ5J1xuICAgICAgd2hlbiAnY2FuY2VsaW5nJyB0aGVuICd3YXJuaW5nJ1xuICAgICAgd2hlbiAncGVuZGluZycgdGhlbiAnaW5mbydcbiAgICAgIHdoZW4gJ3RvdGFsJyB0aGVuICdibGFjaydcbiAgICAgIGVsc2UgJ2RlZmF1bHQnXG5cbiAgQHNldEVuZFRpbWVzID0gKGxpc3QpIC0+XG4gICAgYW5ndWxhci5mb3JFYWNoIGxpc3QsIChpdGVtLCBqb2JLZXkpIC0+XG4gICAgICB1bmxlc3MgaXRlbVsnZW5kLXRpbWUnXSA+IC0xXG4gICAgICAgIGl0ZW1bJ2VuZC10aW1lJ10gPSBpdGVtWydzdGFydC10aW1lJ10gKyBpdGVtWydkdXJhdGlvbiddXG5cbiAgQHByb2Nlc3NWZXJ0aWNlcyA9IChkYXRhKSAtPlxuICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLnZlcnRpY2VzLCAodmVydGV4LCBpKSAtPlxuICAgICAgdmVydGV4LnR5cGUgPSAncmVndWxhcidcblxuICAgIGRhdGEudmVydGljZXMudW5zaGlmdCh7XG4gICAgICBuYW1lOiAnU2NoZWR1bGVkJ1xuICAgICAgJ3N0YXJ0LXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXVxuICAgICAgJ2VuZC10aW1lJzogZGF0YS50aW1lc3RhbXBzWydDUkVBVEVEJ10gKyAxXG4gICAgICB0eXBlOiAnc2NoZWR1bGVkJ1xuICAgIH0pXG5cbiAgQGxpc3RKb2JzID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm92ZXJ2aWV3XCJcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICBhbmd1bGFyLmZvckVhY2ggZGF0YSwgKGxpc3QsIGxpc3RLZXkpID0+XG4gICAgICAgIHN3aXRjaCBsaXN0S2V5XG4gICAgICAgICAgd2hlbiAncnVubmluZycgdGhlbiBqb2JzLnJ1bm5pbmcgPSBAc2V0RW5kVGltZXMobGlzdClcbiAgICAgICAgICB3aGVuICdmaW5pc2hlZCcgdGhlbiBqb2JzLmZpbmlzaGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnY2FuY2VsbGVkJyB0aGVuIGpvYnMuY2FuY2VsbGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG4gICAgICAgICAgd2hlbiAnZmFpbGVkJyB0aGVuIGpvYnMuZmFpbGVkID0gQHNldEVuZFRpbWVzKGxpc3QpXG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoam9icylcbiAgICAgIG5vdGlmeU9ic2VydmVycygpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldEpvYnMgPSAodHlwZSkgLT5cbiAgICBqb2JzW3R5cGVdXG5cbiAgQGdldEFsbEpvYnMgPSAtPlxuICAgIGpvYnNcblxuICBAbG9hZEpvYiA9IChqb2JpZCkgLT5cbiAgICBjdXJyZW50Sm9iID0gbnVsbFxuICAgIGRlZmVycmVkcy5qb2IgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWRcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICBAc2V0RW5kVGltZXMoZGF0YS52ZXJ0aWNlcylcbiAgICAgIEBwcm9jZXNzVmVydGljZXMoZGF0YSlcblxuICAgICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvY29uZmlnXCJcbiAgICAgIC5zdWNjZXNzIChqb2JDb25maWcpIC0+XG4gICAgICAgIGRhdGEgPSBhbmd1bGFyLmV4dGVuZChkYXRhLCBqb2JDb25maWcpXG5cbiAgICAgICAgY3VycmVudEpvYiA9IGRhdGFcblxuICAgICAgICBkZWZlcnJlZHMuam9iLnJlc29sdmUoY3VycmVudEpvYilcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZVxuXG4gIEBnZXROb2RlID0gKG5vZGVpZCkgLT5cbiAgICBzZWVrTm9kZSA9IChub2RlaWQsIGRhdGEpIC0+XG4gICAgICBmb3Igbm9kZSBpbiBkYXRhXG4gICAgICAgIHJldHVybiBub2RlIGlmIG5vZGUuaWQgaXMgbm9kZWlkXG4gICAgICAgIHN1YiA9IHNlZWtOb2RlKG5vZGVpZCwgbm9kZS5zdGVwX2Z1bmN0aW9uKSBpZiBub2RlLnN0ZXBfZnVuY3Rpb25cbiAgICAgICAgcmV0dXJuIHN1YiBpZiBzdWJcblxuICAgICAgbnVsbFxuXG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgIGZvdW5kTm9kZSA9IHNlZWtOb2RlKG5vZGVpZCwgY3VycmVudEpvYi5wbGFuLm5vZGVzKVxuXG4gICAgICBmb3VuZE5vZGUudmVydGV4ID0gQHNlZWtWZXJ0ZXgobm9kZWlkKVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZvdW5kTm9kZSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAc2Vla1ZlcnRleCA9IChub2RlaWQpIC0+XG4gICAgZm9yIHZlcnRleCBpbiBjdXJyZW50Sm9iLnZlcnRpY2VzXG4gICAgICByZXR1cm4gdmVydGV4IGlmIHZlcnRleC5pZCBpcyBub2RlaWRcblxuICAgIHJldHVybiBudWxsXG5cbiAgQGdldFZlcnRleCA9ICh2ZXJ0ZXhpZCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuIChkYXRhKSA9PlxuICAgICAgdmVydGV4ID0gQHNlZWtWZXJ0ZXgodmVydGV4aWQpXG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9zdWJ0YXNrdGltZXNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpID0+XG4gICAgICAgICMgVE9ETzogY2hhbmdlIHRvIHN1YnRhc2t0aW1lc1xuICAgICAgICB2ZXJ0ZXguc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2ZXJ0ZXgpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldFN1YnRhc2tzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgc3VidGFza3MgPSBkYXRhLnN1YnRhc2tzXG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzdWJ0YXNrcylcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAZ2V0VGFza01hbmFnZXJzID0gKHZlcnRleGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAjIHZlcnRleCA9IEBzZWVrVmVydGV4KHZlcnRleGlkKVxuXG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvdGFza21hbmFnZXJzXCJcbiAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICB0YXNrbWFuYWdlcnMgPSBkYXRhLnRhc2ttYW5hZ2Vyc1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodGFza21hbmFnZXJzKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRBY2N1bXVsYXRvcnMgPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgICMgdmVydGV4ID0gQHNlZWtWZXJ0ZXgodmVydGV4aWQpXG4gICAgICBjb25zb2xlLmxvZyhjdXJyZW50Sm9iLmppZClcbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9hY2N1bXVsYXRvcnNcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgIGFjY3VtdWxhdG9ycyA9IGRhdGFbJ3VzZXItYWNjdW11bGF0b3JzJ11cblxuICAgICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvc3VidGFza3MvYWNjdW11bGF0b3JzXCJcbiAgICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgICAgc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3NcblxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeyBtYWluOiBhY2N1bXVsYXRvcnMsIHN1YnRhc2tzOiBzdWJ0YXNrQWNjdW11bGF0b3JzIH0pXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgIyBDaGVja3BvaW50IGNvbmZpZ1xuICBAZ2V0Q2hlY2twb2ludENvbmZpZyA9ICAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9jaGVja3BvaW50cy9jb25maWdcIlxuICAgICAgLnN1Y2Nlc3MgKGRhdGEpIC0+XG4gICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShudWxsKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgR2VuZXJhbCBjaGVja3BvaW50IHN0YXRzIGxpa2UgY291bnRzLCBoaXN0b3J5LCBldGMuXG4gIEBnZXRDaGVja3BvaW50U3RhdHMgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9jaGVja3BvaW50c1wiXG4gICAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpID0+XG4gICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShudWxsKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgRGV0YWlsZWQgY2hlY2twb2ludCBzdGF0cyBmb3IgYSBzaW5nbGUgY2hlY2twb2ludFxuICBAZ2V0Q2hlY2twb2ludERldGFpbHMgPSAoY2hlY2twb2ludGlkKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG4gICAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi9jaGVja3BvaW50cy9kZXRhaWxzL1wiICsgY2hlY2twb2ludGlkXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgIyBJZiBubyBkYXRhIGF2YWlsYWJsZSwgd2UgYXJlIGRvbmUuXG4gICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShudWxsKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgRGV0YWlsZWQgc3VidGFzayBzdGF0cyBmb3IgYSBzaW5nbGUgY2hlY2twb2ludFxuICBAZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzID0gKGNoZWNrcG9pbnRpZCwgdmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbiAoZGF0YSkgPT5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2NoZWNrcG9pbnRzL2RldGFpbHMvXCIgKyBjaGVja3BvaW50aWQgKyBcIi9zdWJ0YXNrcy9cIiArIHZlcnRleGlkXG4gICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgIyBJZiBubyBkYXRhIGF2YWlsYWJsZSwgd2UgYXJlIGRvbmUuXG4gICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShudWxsKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICMgT3BlcmF0b3ItbGV2ZWwgYmFjayBwcmVzc3VyZSBzdGF0c1xuICBAZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSAodmVydGV4aWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvYmFja3ByZXNzdXJlXCJcbiAgICAuc3VjY2VzcyAoZGF0YSkgPT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAdHJhbnNsYXRlQmFja1ByZXNzdXJlTGFiZWxTdGF0ZSA9IChzdGF0ZSkgLT5cbiAgICBzd2l0Y2ggc3RhdGUudG9Mb3dlckNhc2UoKVxuICAgICAgd2hlbiAnaW4tcHJvZ3Jlc3MnIHRoZW4gJ2RhbmdlcidcbiAgICAgIHdoZW4gJ29rJyB0aGVuICdzdWNjZXNzJ1xuICAgICAgd2hlbiAnbG93JyB0aGVuICd3YXJuaW5nJ1xuICAgICAgd2hlbiAnaGlnaCcgdGhlbiAnZGFuZ2VyJ1xuICAgICAgZWxzZSAnZGVmYXVsdCdcblxuICBAbG9hZEV4Y2VwdGlvbnMgPSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4gKGRhdGEpID0+XG5cbiAgICAgICRodHRwLmdldCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2V4Y2VwdGlvbnNcIlxuICAgICAgLnN1Y2Nlc3MgKGV4Y2VwdGlvbnMpIC0+XG4gICAgICAgIGN1cnJlbnRKb2IuZXhjZXB0aW9ucyA9IGV4Y2VwdGlvbnNcblxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGV4Y2VwdGlvbnMpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGNhbmNlbEpvYiA9IChqb2JpZCkgLT5cbiAgICAjIHVzZXMgdGhlIG5vbiBSRVNULWNvbXBsaWFudCBHRVQgeWFybi1jYW5jZWwgaGFuZGxlciB3aGljaCBpcyBhdmFpbGFibGUgaW4gYWRkaXRpb24gdG8gdGhlXG4gICAgIyBwcm9wZXIgXCJERUxFVEUgam9icy88am9iaWQ+L1wiXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIveWFybi1jYW5jZWxcIlxuXG4gIEBzdG9wSm9iID0gKGpvYmlkKSAtPlxuICAgICMgdXNlcyB0aGUgbm9uIFJFU1QtY29tcGxpYW50IEdFVCB5YXJuLWNhbmNlbCBoYW5kbGVyIHdoaWNoIGlzIGF2YWlsYWJsZSBpbiBhZGRpdGlvbiB0byB0aGVcbiAgICAjIHByb3BlciBcIkRFTEVURSBqb2JzLzxqb2JpZD4vXCJcbiAgICAkaHR0cC5nZXQgXCJqb2JzL1wiICsgam9iaWQgKyBcIi95YXJuLXN0b3BcIlxuXG4gIEBcbiIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLnNlcnZpY2UoJ0pvYnNTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkbG9nLCBhbU1vbWVudCwgJHEsICR0aW1lb3V0KSB7XG4gIHZhciBjdXJyZW50Sm9iLCBjdXJyZW50UGxhbiwgZGVmZXJyZWRzLCBqb2JPYnNlcnZlcnMsIGpvYnMsIG5vdGlmeU9ic2VydmVycztcbiAgY3VycmVudEpvYiA9IG51bGw7XG4gIGN1cnJlbnRQbGFuID0gbnVsbDtcbiAgZGVmZXJyZWRzID0ge307XG4gIGpvYnMgPSB7XG4gICAgcnVubmluZzogW10sXG4gICAgZmluaXNoZWQ6IFtdLFxuICAgIGNhbmNlbGxlZDogW10sXG4gICAgZmFpbGVkOiBbXVxuICB9O1xuICBqb2JPYnNlcnZlcnMgPSBbXTtcbiAgbm90aWZ5T2JzZXJ2ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaChqb2JPYnNlcnZlcnMsIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9KTtcbiAgfTtcbiAgdGhpcy5yZWdpc3Rlck9ic2VydmVyID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICByZXR1cm4gam9iT2JzZXJ2ZXJzLnB1c2goY2FsbGJhY2spO1xuICB9O1xuICB0aGlzLnVuUmVnaXN0ZXJPYnNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gam9iT2JzZXJ2ZXJzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgIHJldHVybiBqb2JPYnNlcnZlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfTtcbiAgdGhpcy5zdGF0ZUxpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gWydTQ0hFRFVMRUQnLCAnREVQTE9ZSU5HJywgJ1JVTk5JTkcnLCAnRklOSVNIRUQnLCAnRkFJTEVEJywgJ0NBTkNFTElORycsICdDQU5DRUxFRCddO1xuICB9O1xuICB0aGlzLnRyYW5zbGF0ZUxhYmVsU3RhdGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHN3aXRjaCAoc3RhdGUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAnZmluaXNoZWQnOlxuICAgICAgICByZXR1cm4gJ3N1Y2Nlc3MnO1xuICAgICAgY2FzZSAnZmFpbGVkJzpcbiAgICAgICAgcmV0dXJuICdkYW5nZXInO1xuICAgICAgY2FzZSAnc2NoZWR1bGVkJzpcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0JztcbiAgICAgIGNhc2UgJ2RlcGxveWluZyc6XG4gICAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgcmV0dXJuICdwcmltYXJ5JztcbiAgICAgIGNhc2UgJ2NhbmNlbGluZyc6XG4gICAgICAgIHJldHVybiAnd2FybmluZyc7XG4gICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgcmV0dXJuICdpbmZvJztcbiAgICAgIGNhc2UgJ3RvdGFsJzpcbiAgICAgICAgcmV0dXJuICdibGFjayc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5zZXRFbmRUaW1lcyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICByZXR1cm4gYW5ndWxhci5mb3JFYWNoKGxpc3QsIGZ1bmN0aW9uKGl0ZW0sIGpvYktleSkge1xuICAgICAgaWYgKCEoaXRlbVsnZW5kLXRpbWUnXSA+IC0xKSkge1xuICAgICAgICByZXR1cm4gaXRlbVsnZW5kLXRpbWUnXSA9IGl0ZW1bJ3N0YXJ0LXRpbWUnXSArIGl0ZW1bJ2R1cmF0aW9uJ107XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHRoaXMucHJvY2Vzc1ZlcnRpY2VzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLnZlcnRpY2VzLCBmdW5jdGlvbih2ZXJ0ZXgsIGkpIHtcbiAgICAgIHJldHVybiB2ZXJ0ZXgudHlwZSA9ICdyZWd1bGFyJztcbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YS52ZXJ0aWNlcy51bnNoaWZ0KHtcbiAgICAgIG5hbWU6ICdTY2hlZHVsZWQnLFxuICAgICAgJ3N0YXJ0LXRpbWUnOiBkYXRhLnRpbWVzdGFtcHNbJ0NSRUFURUQnXSxcbiAgICAgICdlbmQtdGltZSc6IGRhdGEudGltZXN0YW1wc1snQ1JFQVRFRCddICsgMSxcbiAgICAgIHR5cGU6ICdzY2hlZHVsZWQnXG4gICAgfSk7XG4gIH07XG4gIHRoaXMubGlzdEpvYnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYm92ZXJ2aWV3XCIpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKGxpc3QsIGxpc3RLZXkpIHtcbiAgICAgICAgICBzd2l0Y2ggKGxpc3RLZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3J1bm5pbmcnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5ydW5uaW5nID0gX3RoaXMuc2V0RW5kVGltZXMobGlzdCk7XG4gICAgICAgICAgICBjYXNlICdmaW5pc2hlZCc6XG4gICAgICAgICAgICAgIHJldHVybiBqb2JzLmZpbmlzaGVkID0gX3RoaXMuc2V0RW5kVGltZXMobGlzdCk7XG4gICAgICAgICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAgICAgICByZXR1cm4gam9icy5jYW5jZWxsZWQgPSBfdGhpcy5zZXRFbmRUaW1lcyhsaXN0KTtcbiAgICAgICAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgICAgICAgIHJldHVybiBqb2JzLmZhaWxlZCA9IF90aGlzLnNldEVuZFRpbWVzKGxpc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoam9icyk7XG4gICAgICAgIHJldHVybiBub3RpZnlPYnNlcnZlcnMoKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldEpvYnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgcmV0dXJuIGpvYnNbdHlwZV07XG4gIH07XG4gIHRoaXMuZ2V0QWxsSm9icyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBqb2JzO1xuICB9O1xuICB0aGlzLmxvYWRKb2IgPSBmdW5jdGlvbihqb2JpZCkge1xuICAgIGN1cnJlbnRKb2IgPSBudWxsO1xuICAgIGRlZmVycmVkcy5qb2IgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCkuc3VjY2VzcygoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICBfdGhpcy5zZXRFbmRUaW1lcyhkYXRhLnZlcnRpY2VzKTtcbiAgICAgICAgX3RoaXMucHJvY2Vzc1ZlcnRpY2VzKGRhdGEpO1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvY29uZmlnXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oam9iQ29uZmlnKSB7XG4gICAgICAgICAgZGF0YSA9IGFuZ3VsYXIuZXh0ZW5kKGRhdGEsIGpvYkNvbmZpZyk7XG4gICAgICAgICAgY3VycmVudEpvYiA9IGRhdGE7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkcy5qb2IucmVzb2x2ZShjdXJyZW50Sm9iKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWRzLmpvYi5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldE5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICB2YXIgZGVmZXJyZWQsIHNlZWtOb2RlO1xuICAgIHNlZWtOb2RlID0gZnVuY3Rpb24obm9kZWlkLCBkYXRhKSB7XG4gICAgICB2YXIgaiwgbGVuLCBub2RlLCBzdWI7XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIG5vZGUgPSBkYXRhW2pdO1xuICAgICAgICBpZiAobm9kZS5pZCA9PT0gbm9kZWlkKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuc3RlcF9mdW5jdGlvbikge1xuICAgICAgICAgIHN1YiA9IHNlZWtOb2RlKG5vZGVpZCwgbm9kZS5zdGVwX2Z1bmN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgcmV0dXJuIHN1YjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZm91bmROb2RlO1xuICAgICAgICBmb3VuZE5vZGUgPSBzZWVrTm9kZShub2RlaWQsIGN1cnJlbnRKb2IucGxhbi5ub2Rlcyk7XG4gICAgICAgIGZvdW5kTm9kZS52ZXJ0ZXggPSBfdGhpcy5zZWVrVmVydGV4KG5vZGVpZCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGZvdW5kTm9kZSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5zZWVrVmVydGV4ID0gZnVuY3Rpb24obm9kZWlkKSB7XG4gICAgdmFyIGosIGxlbiwgcmVmLCB2ZXJ0ZXg7XG4gICAgcmVmID0gY3VycmVudEpvYi52ZXJ0aWNlcztcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZlcnRleCA9IHJlZltqXTtcbiAgICAgIGlmICh2ZXJ0ZXguaWQgPT09IG5vZGVpZCkge1xuICAgICAgICByZXR1cm4gdmVydGV4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgdGhpcy5nZXRWZXJ0ZXggPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgdmVydGV4O1xuICAgICAgICB2ZXJ0ZXggPSBfdGhpcy5zZWVrVmVydGV4KHZlcnRleGlkKTtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQgKyBcIi9zdWJ0YXNrdGltZXNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmVydGV4LnN1YnRhc2tzID0gZGF0YS5zdWJ0YXNrcztcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh2ZXJ0ZXgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldFN1YnRhc2tzID0gZnVuY3Rpb24odmVydGV4aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL3ZlcnRpY2VzL1wiICsgdmVydGV4aWQpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBzdWJ0YXNrcztcbiAgICAgICAgICBzdWJ0YXNrcyA9IGRhdGEuc3VidGFza3M7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoc3VidGFza3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldFRhc2tNYW5hZ2VycyA9IGZ1bmN0aW9uKHZlcnRleGlkKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZHMuam9iLnByb21pc2UudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvdGFza21hbmFnZXJzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciB0YXNrbWFuYWdlcnM7XG4gICAgICAgICAgdGFza21hbmFnZXJzID0gZGF0YS50YXNrbWFuYWdlcnM7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUodGFza21hbmFnZXJzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRBY2N1bXVsYXRvcnMgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhjdXJyZW50Sm9iLmppZCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgY3VycmVudEpvYi5qaWQgKyBcIi92ZXJ0aWNlcy9cIiArIHZlcnRleGlkICsgXCIvYWNjdW11bGF0b3JzXCIpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBhY2N1bXVsYXRvcnM7XG4gICAgICAgICAgYWNjdW11bGF0b3JzID0gZGF0YVsndXNlci1hY2N1bXVsYXRvcnMnXTtcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL3N1YnRhc2tzL2FjY3VtdWxhdG9yc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBzdWJ0YXNrQWNjdW11bGF0b3JzO1xuICAgICAgICAgICAgc3VidGFza0FjY3VtdWxhdG9ycyA9IGRhdGEuc3VidGFza3M7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIG1haW46IGFjY3VtdWxhdG9ycyxcbiAgICAgICAgICAgICAgc3VidGFza3M6IHN1YnRhc2tBY2N1bXVsYXRvcnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldENoZWNrcG9pbnRDb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2NoZWNrcG9pbnRzL2NvbmZpZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoe30sIGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldENoZWNrcG9pbnRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvY2hlY2twb2ludHNcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0Q2hlY2twb2ludERldGFpbHMgPSBmdW5jdGlvbihjaGVja3BvaW50aWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkcy5qb2IucHJvbWlzZS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBjdXJyZW50Sm9iLmppZCArIFwiL2NoZWNrcG9pbnRzL2RldGFpbHMvXCIgKyBjaGVja3BvaW50aWQpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0Q2hlY2twb2ludFN1YnRhc2tEZXRhaWxzID0gZnVuY3Rpb24oY2hlY2twb2ludGlkLCB2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvY2hlY2twb2ludHMvZGV0YWlscy9cIiArIGNoZWNrcG9pbnRpZCArIFwiL3N1YnRhc2tzL1wiICsgdmVydGV4aWQpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh7fSwgZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZ2V0T3BlcmF0b3JCYWNrUHJlc3N1cmUgPSBmdW5jdGlvbih2ZXJ0ZXhpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvdmVydGljZXMvXCIgKyB2ZXJ0ZXhpZCArIFwiL2JhY2twcmVzc3VyZVwiKS5zdWNjZXNzKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy50cmFuc2xhdGVCYWNrUHJlc3N1cmVMYWJlbFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2luLXByb2dyZXNzJzpcbiAgICAgICAgcmV0dXJuICdkYW5nZXInO1xuICAgICAgY2FzZSAnb2snOlxuICAgICAgICByZXR1cm4gJ3N1Y2Nlc3MnO1xuICAgICAgY2FzZSAnbG93JzpcbiAgICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICAgIGNhc2UgJ2hpZ2gnOlxuICAgICAgICByZXR1cm4gJ2Rhbmdlcic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5sb2FkRXhjZXB0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWRzLmpvYi5wcm9taXNlLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGN1cnJlbnRKb2IuamlkICsgXCIvZXhjZXB0aW9uc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGV4Y2VwdGlvbnMpIHtcbiAgICAgICAgICBjdXJyZW50Sm9iLmV4Y2VwdGlvbnMgPSBleGNlcHRpb25zO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGV4Y2VwdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmNhbmNlbEpvYiA9IGZ1bmN0aW9uKGpvYmlkKSB7XG4gICAgcmV0dXJuICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3lhcm4tY2FuY2VsXCIpO1xuICB9O1xuICB0aGlzLnN0b3BKb2IgPSBmdW5jdGlvbihqb2JpZCkge1xuICAgIHJldHVybiAkaHR0cC5nZXQoXCJqb2JzL1wiICsgam9iaWQgKyBcIi95YXJuLXN0b3BcIik7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSk7XG4iLCIjXG4jIExpY2Vuc2VkIHRvIHRoZSBBcGFjaGUgU29mdHdhcmUgRm91bmRhdGlvbiAoQVNGKSB1bmRlciBvbmVcbiMgb3IgbW9yZSBjb250cmlidXRvciBsaWNlbnNlIGFncmVlbWVudHMuICBTZWUgdGhlIE5PVElDRSBmaWxlXG4jIGRpc3RyaWJ1dGVkIHdpdGggdGhpcyB3b3JrIGZvciBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4jIHJlZ2FyZGluZyBjb3B5cmlnaHQgb3duZXJzaGlwLiAgVGhlIEFTRiBsaWNlbnNlcyB0aGlzIGZpbGVcbiMgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZVxuIyBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbiMgd2l0aCB0aGUgTGljZW5zZS4gIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuI1xuIyAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4jXG4jIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiMgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiNcblxuYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJylcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi5kaXJlY3RpdmUgJ21ldHJpY3NHcmFwaCcsIC0+XG4gIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHQgcGFuZWwtbWV0cmljXCI+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1ldHJpYy10aXRsZVwiPnt7bWV0cmljLmlkfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmctY2xhc3M9XCJbYnRuQ2xhc3Nlcywge2FjdGl2ZTogbWV0cmljLnNpemUgIT0gXFwnYmlnXFwnfV1cIiBuZy1jbGljaz1cInNldFNpemUoXFwnc21hbGxcXCcpXCI+U21hbGw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy5zaXplID09IFxcJ2JpZ1xcJ31dXCIgbmctY2xpY2s9XCJzZXRTaXplKFxcJ2JpZ1xcJylcIj5CaWc8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICA8YSB0aXRsZT1cIlJlbW92ZVwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyByZW1vdmVcIiBuZy1jbGljaz1cInJlbW92ZU1ldHJpYygpXCI+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiIC8+PC9hPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxzdmcgbmctaWY9XCJtZXRyaWMudmlldyA9PSBcXCdjaGFydFxcJ1wiLz5cbiAgICAgICAgICAgICAgICAgIDxkaXYgbmctaWY9XCJtZXRyaWMudmlldyAhPSBcXCdjaGFydFxcJ1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZXRyaWMtbnVtZXJpY1wiIHRpdGxlPVwie3t2YWx1ZSB8IGh1bWFuaXplQ2hhcnROdW1lcmljVGl0bGU6bWV0cmljfX1cIj57e3ZhbHVlIHwgaHVtYW5pemVDaGFydE51bWVyaWM6bWV0cmljfX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmctY2xhc3M9XCJbYnRuQ2xhc3Nlcywge2FjdGl2ZTogbWV0cmljLnZpZXcgPT0gXFwnY2hhcnRcXCd9XVwiIG5nLWNsaWNrPVwic2V0VmlldyhcXCdjaGFydFxcJylcIj5DaGFydDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy52aWV3ICE9IFxcJ2NoYXJ0XFwnfV1cIiBuZy1jbGljaz1cInNldFZpZXcoXFwnbnVtZXJpY1xcJylcIj5OdW1lcmljPC9idXR0b24+XG4gICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgIDwvZGl2PidcbiAgcmVwbGFjZTogdHJ1ZVxuICBzY29wZTpcbiAgICBtZXRyaWM6IFwiPVwiXG4gICAgd2luZG93OiBcIj1cIlxuICAgIHJlbW92ZU1ldHJpYzogXCImXCJcbiAgICBzZXRNZXRyaWNTaXplOiBcIj1cIlxuICAgIHNldE1ldHJpY1ZpZXc6IFwiPVwiXG4gICAgZ2V0VmFsdWVzOiBcIiZcIlxuXG4gIGxpbms6IChzY29wZSwgZWxlbWVudCwgYXR0cnMpIC0+XG4gICAgc2NvcGUuYnRuQ2xhc3NlcyA9IFsnYnRuJywgJ2J0bi1kZWZhdWx0JywgJ2J0bi14cyddXG5cbiAgICBzY29wZS52YWx1ZSA9IG51bGxcbiAgICBzY29wZS5kYXRhID0gW3tcbiAgICAgIHZhbHVlczogc2NvcGUuZ2V0VmFsdWVzKClcbiAgICB9XVxuXG4gICAgc2NvcGUub3B0aW9ucyA9IHtcbiAgICAgIHg6IChkLCBpKSAtPlxuICAgICAgICBkLnhcbiAgICAgIHk6IChkLCBpKSAtPlxuICAgICAgICBkLnlcblxuICAgICAgeFRpY2tGb3JtYXQ6IChkKSAtPlxuICAgICAgICBkMy50aW1lLmZvcm1hdCgnJUg6JU06JVMnKShuZXcgRGF0ZShkKSlcblxuICAgICAgeVRpY2tGb3JtYXQ6IChkKSAtPlxuICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgIHBvdyA9IDBcbiAgICAgICAgc3RlcCA9IDFcbiAgICAgICAgYWJzRCA9IE1hdGguYWJzKGQpXG5cbiAgICAgICAgd2hpbGUgIWZvdW5kICYmIHBvdyA8IDUwXG4gICAgICAgICAgaWYgTWF0aC5wb3coMTAsIHBvdykgPD0gYWJzRCAmJiBhYnNEIDwgTWF0aC5wb3coMTAsIHBvdyArIHN0ZXApXG4gICAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3cgKz0gc3RlcFxuXG4gICAgICAgIGlmIGZvdW5kICYmIHBvdyA+IDZcbiAgICAgICAgICBcIiN7ZCAvIE1hdGgucG93KDEwLCBwb3cpfUUje3Bvd31cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCIje2R9XCJcbiAgICB9XG5cbiAgICBzY29wZS5zaG93Q2hhcnQgPSAtPlxuICAgICAgZDMuc2VsZWN0KGVsZW1lbnQuZmluZChcInN2Z1wiKVswXSlcbiAgICAgIC5kYXR1bShzY29wZS5kYXRhKVxuICAgICAgLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyNTApXG4gICAgICAuY2FsbChzY29wZS5jaGFydClcblxuICAgIHNjb3BlLmNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpXG4gICAgICAub3B0aW9ucyhzY29wZS5vcHRpb25zKVxuICAgICAgLnNob3dMZWdlbmQoZmFsc2UpXG4gICAgICAubWFyZ2luKHtcbiAgICAgICAgdG9wOiAxNVxuICAgICAgICBsZWZ0OiA2MFxuICAgICAgICBib3R0b206IDMwXG4gICAgICAgIHJpZ2h0OiAzMFxuICAgICAgfSlcblxuICAgIHNjb3BlLmNoYXJ0LnlBeGlzLnNob3dNYXhNaW4oZmFsc2UpXG4gICAgc2NvcGUuY2hhcnQudG9vbHRpcC5oaWRlRGVsYXkoMClcbiAgICBzY29wZS5jaGFydC50b29sdGlwLmNvbnRlbnRHZW5lcmF0b3IoKG9iaikgLT5cbiAgICAgIFwiPHA+I3tkMy50aW1lLmZvcm1hdCgnJUg6JU06JVMnKShuZXcgRGF0ZShvYmoucG9pbnQueCkpfSB8ICN7b2JqLnBvaW50Lnl9PC9wPlwiXG4gICAgKVxuXG4gICAgbnYudXRpbHMud2luZG93UmVzaXplKHNjb3BlLmNoYXJ0LnVwZGF0ZSk7XG5cbiAgICBzY29wZS5zZXRTaXplID0gKHNpemUpIC0+XG4gICAgICBzY29wZS5zZXRNZXRyaWNTaXplKHNjb3BlLm1ldHJpYywgc2l6ZSlcblxuICAgIHNjb3BlLnNldFZpZXcgPSAodmlldykgLT5cbiAgICAgIHNjb3BlLnNldE1ldHJpY1ZpZXcoc2NvcGUubWV0cmljLCB2aWV3KVxuICAgICAgc2NvcGUuc2hvd0NoYXJ0KCkgaWYgdmlldyA9PSAnY2hhcnQnXG5cbiAgICBzY29wZS5zaG93Q2hhcnQoKSBpZiBzY29wZS5tZXRyaWMudmlldyA9PSAnY2hhcnQnXG5cbiAgICBzY29wZS4kb24gJ21ldHJpY3M6ZGF0YTp1cGRhdGUnLCAoZXZlbnQsIHRpbWVzdGFtcCwgZGF0YSkgLT5cbiAgICAgIHNjb3BlLnZhbHVlID0gcGFyc2VGbG9hdChkYXRhW3Njb3BlLm1ldHJpYy5pZF0pXG5cbiAgICAgIHNjb3BlLmRhdGFbMF0udmFsdWVzLnB1c2gge1xuICAgICAgICB4OiB0aW1lc3RhbXBcbiAgICAgICAgeTogc2NvcGUudmFsdWVcbiAgICAgIH1cblxuICAgICAgaWYgc2NvcGUuZGF0YVswXS52YWx1ZXMubGVuZ3RoID4gc2NvcGUud2luZG93XG4gICAgICAgIHNjb3BlLmRhdGFbMF0udmFsdWVzLnNoaWZ0KClcblxuICAgICAgc2NvcGUuc2hvd0NoYXJ0KCkgaWYgc2NvcGUubWV0cmljLnZpZXcgPT0gJ2NoYXJ0J1xuICAgICAgc2NvcGUuY2hhcnQuY2xlYXJIaWdobGlnaHRzKCkgaWYgc2NvcGUubWV0cmljLnZpZXcgPT0gJ2NoYXJ0J1xuICAgICAgc2NvcGUuY2hhcnQudG9vbHRpcC5oaWRkZW4odHJ1ZSlcblxuICAgIGVsZW1lbnQuZmluZChcIi5tZXRyaWMtdGl0bGVcIikucXRpcCh7XG4gICAgICBjb250ZW50OiB7XG4gICAgICAgIHRleHQ6IHNjb3BlLm1ldHJpYy5pZFxuICAgICAgfSxcbiAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgIG15OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICBhdDogJ3RvcCBsZWZ0J1xuICAgICAgfSxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIGNsYXNzZXM6ICdxdGlwLWxpZ2h0IHF0aXAtdGltZWxpbmUtYmFyJ1xuICAgICAgfVxuICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpLmRpcmVjdGl2ZSgnbWV0cmljc0dyYXBoJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdCBwYW5lbC1tZXRyaWNcIj4gPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4gPHNwYW4gY2xhc3M9XCJtZXRyaWMtdGl0bGVcIj57e21ldHJpYy5pZH19PC9zcGFuPiA8ZGl2IGNsYXNzPVwiYnV0dG9uc1wiPiA8ZGl2IGNsYXNzPVwiYnRuLWdyb3VwXCI+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy5zaXplICE9IFxcJ2JpZ1xcJ31dXCIgbmctY2xpY2s9XCJzZXRTaXplKFxcJ3NtYWxsXFwnKVwiPlNtYWxsPC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG5nLWNsYXNzPVwiW2J0bkNsYXNzZXMsIHthY3RpdmU6IG1ldHJpYy5zaXplID09IFxcJ2JpZ1xcJ31dXCIgbmctY2xpY2s9XCJzZXRTaXplKFxcJ2JpZ1xcJylcIj5CaWc8L2J1dHRvbj4gPC9kaXY+IDxhIHRpdGxlPVwiUmVtb3ZlXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzIHJlbW92ZVwiIG5nLWNsaWNrPVwicmVtb3ZlTWV0cmljKClcIj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCIgLz48L2E+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4gPHN2ZyBuZy1pZj1cIm1ldHJpYy52aWV3ID09IFxcJ2NoYXJ0XFwnXCIvPiA8ZGl2IG5nLWlmPVwibWV0cmljLnZpZXcgIT0gXFwnY2hhcnRcXCdcIj4gPGRpdiBjbGFzcz1cIm1ldHJpYy1udW1lcmljXCIgdGl0bGU9XCJ7e3ZhbHVlIHwgaHVtYW5pemVDaGFydE51bWVyaWNUaXRsZTptZXRyaWN9fVwiPnt7dmFsdWUgfCBodW1hbml6ZUNoYXJ0TnVtZXJpYzptZXRyaWN9fTwvZGl2PiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJidXR0b25zXCI+IDxkaXYgY2xhc3M9XCJidG4tZ3JvdXBcIj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbmctY2xhc3M9XCJbYnRuQ2xhc3Nlcywge2FjdGl2ZTogbWV0cmljLnZpZXcgPT0gXFwnY2hhcnRcXCd9XVwiIG5nLWNsaWNrPVwic2V0VmlldyhcXCdjaGFydFxcJylcIj5DaGFydDwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBuZy1jbGFzcz1cIltidG5DbGFzc2VzLCB7YWN0aXZlOiBtZXRyaWMudmlldyAhPSBcXCdjaGFydFxcJ31dXCIgbmctY2xpY2s9XCJzZXRWaWV3KFxcJ251bWVyaWNcXCcpXCI+TnVtZXJpYzwvYnV0dG9uPiA8L2Rpdj4gPC9kaXY+JyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBtZXRyaWM6IFwiPVwiLFxuICAgICAgd2luZG93OiBcIj1cIixcbiAgICAgIHJlbW92ZU1ldHJpYzogXCImXCIsXG4gICAgICBzZXRNZXRyaWNTaXplOiBcIj1cIixcbiAgICAgIHNldE1ldHJpY1ZpZXc6IFwiPVwiLFxuICAgICAgZ2V0VmFsdWVzOiBcIiZcIlxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS5idG5DbGFzc2VzID0gWydidG4nLCAnYnRuLWRlZmF1bHQnLCAnYnRuLXhzJ107XG4gICAgICBzY29wZS52YWx1ZSA9IG51bGw7XG4gICAgICBzY29wZS5kYXRhID0gW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsdWVzOiBzY29wZS5nZXRWYWx1ZXMoKVxuICAgICAgICB9XG4gICAgICBdO1xuICAgICAgc2NvcGUub3B0aW9ucyA9IHtcbiAgICAgICAgeDogZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAgIHJldHVybiBkLng7XG4gICAgICAgIH0sXG4gICAgICAgIHk6IGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gZC55O1xuICAgICAgICB9LFxuICAgICAgICB4VGlja0Zvcm1hdDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBkMy50aW1lLmZvcm1hdCgnJUg6JU06JVMnKShuZXcgRGF0ZShkKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHlUaWNrRm9ybWF0OiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgdmFyIGFic0QsIGZvdW5kLCBwb3csIHN0ZXA7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICBwb3cgPSAwO1xuICAgICAgICAgIHN0ZXAgPSAxO1xuICAgICAgICAgIGFic0QgPSBNYXRoLmFicyhkKTtcbiAgICAgICAgICB3aGlsZSAoIWZvdW5kICYmIHBvdyA8IDUwKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5wb3coMTAsIHBvdykgPD0gYWJzRCAmJiBhYnNEIDwgTWF0aC5wb3coMTAsIHBvdyArIHN0ZXApKSB7XG4gICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBvdyArPSBzdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZm91bmQgJiYgcG93ID4gNikge1xuICAgICAgICAgICAgcmV0dXJuIChkIC8gTWF0aC5wb3coMTAsIHBvdykpICsgXCJFXCIgKyBwb3c7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5zaG93Q2hhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGQzLnNlbGVjdChlbGVtZW50LmZpbmQoXCJzdmdcIilbMF0pLmRhdHVtKHNjb3BlLmRhdGEpLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyNTApLmNhbGwoc2NvcGUuY2hhcnQpO1xuICAgICAgfTtcbiAgICAgIHNjb3BlLmNoYXJ0ID0gbnYubW9kZWxzLmxpbmVDaGFydCgpLm9wdGlvbnMoc2NvcGUub3B0aW9ucykuc2hvd0xlZ2VuZChmYWxzZSkubWFyZ2luKHtcbiAgICAgICAgdG9wOiAxNSxcbiAgICAgICAgbGVmdDogNjAsXG4gICAgICAgIGJvdHRvbTogMzAsXG4gICAgICAgIHJpZ2h0OiAzMFxuICAgICAgfSk7XG4gICAgICBzY29wZS5jaGFydC55QXhpcy5zaG93TWF4TWluKGZhbHNlKTtcbiAgICAgIHNjb3BlLmNoYXJ0LnRvb2x0aXAuaGlkZURlbGF5KDApO1xuICAgICAgc2NvcGUuY2hhcnQudG9vbHRpcC5jb250ZW50R2VuZXJhdG9yKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gXCI8cD5cIiArIChkMy50aW1lLmZvcm1hdCgnJUg6JU06JVMnKShuZXcgRGF0ZShvYmoucG9pbnQueCkpKSArIFwiIHwgXCIgKyBvYmoucG9pbnQueSArIFwiPC9wPlwiO1xuICAgICAgfSk7XG4gICAgICBudi51dGlscy53aW5kb3dSZXNpemUoc2NvcGUuY2hhcnQudXBkYXRlKTtcbiAgICAgIHNjb3BlLnNldFNpemUgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgICAgIHJldHVybiBzY29wZS5zZXRNZXRyaWNTaXplKHNjb3BlLm1ldHJpYywgc2l6ZSk7XG4gICAgICB9O1xuICAgICAgc2NvcGUuc2V0VmlldyA9IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgc2NvcGUuc2V0TWV0cmljVmlldyhzY29wZS5tZXRyaWMsIHZpZXcpO1xuICAgICAgICBpZiAodmlldyA9PT0gJ2NoYXJ0Jykge1xuICAgICAgICAgIHJldHVybiBzY29wZS5zaG93Q2hhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChzY29wZS5tZXRyaWMudmlldyA9PT0gJ2NoYXJ0Jykge1xuICAgICAgICBzY29wZS5zaG93Q2hhcnQoKTtcbiAgICAgIH1cbiAgICAgIHNjb3BlLiRvbignbWV0cmljczpkYXRhOnVwZGF0ZScsIGZ1bmN0aW9uKGV2ZW50LCB0aW1lc3RhbXAsIGRhdGEpIHtcbiAgICAgICAgc2NvcGUudmFsdWUgPSBwYXJzZUZsb2F0KGRhdGFbc2NvcGUubWV0cmljLmlkXSk7XG4gICAgICAgIHNjb3BlLmRhdGFbMF0udmFsdWVzLnB1c2goe1xuICAgICAgICAgIHg6IHRpbWVzdGFtcCxcbiAgICAgICAgICB5OiBzY29wZS52YWx1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNjb3BlLmRhdGFbMF0udmFsdWVzLmxlbmd0aCA+IHNjb3BlLndpbmRvdykge1xuICAgICAgICAgIHNjb3BlLmRhdGFbMF0udmFsdWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3BlLm1ldHJpYy52aWV3ID09PSAnY2hhcnQnKSB7XG4gICAgICAgICAgc2NvcGUuc2hvd0NoYXJ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3BlLm1ldHJpYy52aWV3ID09PSAnY2hhcnQnKSB7XG4gICAgICAgICAgc2NvcGUuY2hhcnQuY2xlYXJIaWdobGlnaHRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjb3BlLmNoYXJ0LnRvb2x0aXAuaGlkZGVuKHRydWUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZWxlbWVudC5maW5kKFwiLm1ldHJpYy10aXRsZVwiKS5xdGlwKHtcbiAgICAgICAgY29udGVudDoge1xuICAgICAgICAgIHRleHQ6IHNjb3BlLm1ldHJpYy5pZFxuICAgICAgICB9LFxuICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgIG15OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgIGF0OiAndG9wIGxlZnQnXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgY2xhc3NlczogJ3F0aXAtbGlnaHQgcXRpcC10aW1lbGluZS1iYXInXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdNZXRyaWNzU2VydmljZScsICgkaHR0cCwgJHEsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwsIHdhdGVybWFya3NDb25maWcpIC0+XG4gIEBtZXRyaWNzID0ge31cbiAgQHZhbHVlcyA9IHt9XG4gIEB3YXRjaGVkID0ge31cbiAgQG9ic2VydmVyID0ge1xuICAgIGpvYmlkOiBudWxsXG4gICAgbm9kZWlkOiBudWxsXG4gICAgY2FsbGJhY2s6IG51bGxcbiAgfVxuXG4gIEByZWZyZXNoID0gJGludGVydmFsID0+XG4gICAgYW5ndWxhci5mb3JFYWNoIEBtZXRyaWNzLCAodmVydGljZXMsIGpvYmlkKSA9PlxuICAgICAgYW5ndWxhci5mb3JFYWNoIHZlcnRpY2VzLCAobWV0cmljcywgbm9kZWlkKSA9PlxuICAgICAgICBuYW1lcyA9IFtdXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCBtZXRyaWNzLCAobWV0cmljLCBpbmRleCkgPT5cbiAgICAgICAgICBuYW1lcy5wdXNoIG1ldHJpYy5pZFxuXG4gICAgICAgIGlmIG5hbWVzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZ2V0TWV0cmljcyhqb2JpZCwgbm9kZWlkLCBuYW1lcykudGhlbiAodmFsdWVzKSA9PlxuICAgICAgICAgICAgaWYgam9iaWQgPT0gQG9ic2VydmVyLmpvYmlkICYmIG5vZGVpZCA9PSBAb2JzZXJ2ZXIubm9kZWlkXG4gICAgICAgICAgICAgIEBvYnNlcnZlci5jYWxsYmFjayh2YWx1ZXMpIGlmIEBvYnNlcnZlci5jYWxsYmFja1xuXG5cbiAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICBAcmVnaXN0ZXJPYnNlcnZlciA9IChqb2JpZCwgbm9kZWlkLCBjYWxsYmFjaykgLT5cbiAgICBAb2JzZXJ2ZXIuam9iaWQgPSBqb2JpZFxuICAgIEBvYnNlcnZlci5ub2RlaWQgPSBub2RlaWRcbiAgICBAb2JzZXJ2ZXIuY2FsbGJhY2sgPSBjYWxsYmFja1xuXG4gIEB1blJlZ2lzdGVyT2JzZXJ2ZXIgPSAtPlxuICAgIEBvYnNlcnZlciA9IHtcbiAgICAgIGpvYmlkOiBudWxsXG4gICAgICBub2RlaWQ6IG51bGxcbiAgICAgIGNhbGxiYWNrOiBudWxsXG4gICAgfVxuXG4gIEBzZXR1cE1ldHJpY3MgPSAoam9iaWQsIHZlcnRpY2VzKSAtPlxuICAgIEBzZXR1cExTKClcblxuICAgIEB3YXRjaGVkW2pvYmlkXSA9IFtdXG4gICAgYW5ndWxhci5mb3JFYWNoIHZlcnRpY2VzLCAodiwgaykgPT5cbiAgICAgIEB3YXRjaGVkW2pvYmlkXS5wdXNoKHYuaWQpIGlmIHYuaWRcblxuICBAZ2V0V2luZG93ID0gLT5cbiAgICAxMDBcblxuICBAc2V0dXBMUyA9IC0+XG4gICAgaWYgIXNlc3Npb25TdG9yYWdlLmZsaW5rTWV0cmljcz9cbiAgICAgIEBzYXZlU2V0dXAoKVxuXG4gICAgQG1ldHJpY3MgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmZsaW5rTWV0cmljcylcblxuICBAc2F2ZVNldHVwID0gLT5cbiAgICBzZXNzaW9uU3RvcmFnZS5mbGlua01ldHJpY3MgPSBKU09OLnN0cmluZ2lmeShAbWV0cmljcylcblxuICBAc2F2ZVZhbHVlID0gKGpvYmlkLCBub2RlaWQsIHZhbHVlKSAtPlxuICAgIHVubGVzcyBAdmFsdWVzW2pvYmlkXT9cbiAgICAgIEB2YWx1ZXNbam9iaWRdID0ge31cblxuICAgIHVubGVzcyBAdmFsdWVzW2pvYmlkXVtub2RlaWRdP1xuICAgICAgQHZhbHVlc1tqb2JpZF1bbm9kZWlkXSA9IFtdXG5cbiAgICBAdmFsdWVzW2pvYmlkXVtub2RlaWRdLnB1c2godmFsdWUpXG5cbiAgICBpZiBAdmFsdWVzW2pvYmlkXVtub2RlaWRdLmxlbmd0aCA+IEBnZXRXaW5kb3coKVxuICAgICAgQHZhbHVlc1tqb2JpZF1bbm9kZWlkXS5zaGlmdCgpXG5cbiAgQGdldFZhbHVlcyA9IChqb2JpZCwgbm9kZWlkLCBtZXRyaWNpZCkgLT5cbiAgICByZXR1cm4gW10gdW5sZXNzIEB2YWx1ZXNbam9iaWRdP1xuICAgIHJldHVybiBbXSB1bmxlc3MgQHZhbHVlc1tqb2JpZF1bbm9kZWlkXT9cblxuICAgIHJlc3VsdHMgPSBbXVxuICAgIGFuZ3VsYXIuZm9yRWFjaCBAdmFsdWVzW2pvYmlkXVtub2RlaWRdLCAodiwgaykgPT5cbiAgICAgIGlmIHYudmFsdWVzW21ldHJpY2lkXT9cbiAgICAgICAgcmVzdWx0cy5wdXNoIHtcbiAgICAgICAgICB4OiB2LnRpbWVzdGFtcFxuICAgICAgICAgIHk6IHYudmFsdWVzW21ldHJpY2lkXVxuICAgICAgICB9XG5cbiAgICByZXN1bHRzXG5cbiAgQHNldHVwTFNGb3IgPSAoam9iaWQsIG5vZGVpZCkgLT5cbiAgICBpZiAhQG1ldHJpY3Nbam9iaWRdP1xuICAgICAgQG1ldHJpY3Nbam9iaWRdID0ge31cblxuICAgIGlmICFAbWV0cmljc1tqb2JpZF1bbm9kZWlkXT9cbiAgICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdID0gW11cblxuICBAYWRkTWV0cmljID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSAtPlxuICAgIEBzZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpXG5cbiAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5wdXNoKHtpZDogbWV0cmljaWQsIHNpemU6ICdzbWFsbCcsIHZpZXc6ICdjaGFydCd9KVxuXG4gICAgQHNhdmVTZXR1cCgpXG5cbiAgQHJlbW92ZU1ldHJpYyA9IChqb2JpZCwgbm9kZWlkLCBtZXRyaWMpID0+XG4gICAgaWYgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0/XG4gICAgICBpID0gQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZihtZXRyaWMpXG4gICAgICBpID0gXy5maW5kSW5kZXgoQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHsgaWQ6IG1ldHJpYyB9KSBpZiBpID09IC0xXG5cbiAgICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShpLCAxKSBpZiBpICE9IC0xXG5cbiAgICAgIEBzYXZlU2V0dXAoKVxuXG4gIEBzZXRNZXRyaWNTaXplID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpYywgc2l6ZSkgPT5cbiAgICBpZiBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXT9cbiAgICAgIGkgPSBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5pbmRleE9mKG1ldHJpYy5pZClcbiAgICAgIGkgPSBfLmZpbmRJbmRleChAbWV0cmljc1tqb2JpZF1bbm9kZWlkXSwgeyBpZDogbWV0cmljLmlkIH0pIGlmIGkgPT0gLTFcblxuICAgICAgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF1baV0gPSB7IGlkOiBtZXRyaWMuaWQsIHNpemU6IHNpemUsIHZpZXc6IG1ldHJpYy52aWV3IH0gaWYgaSAhPSAtMVxuXG4gICAgICBAc2F2ZVNldHVwKClcblxuICBAc2V0TWV0cmljVmlldyA9IChqb2JpZCwgbm9kZWlkLCBtZXRyaWMsIHZpZXcpID0+XG4gICAgaWYgQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0/XG4gICAgICBpID0gQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZihtZXRyaWMuaWQpXG4gICAgICBpID0gXy5maW5kSW5kZXgoQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHsgaWQ6IG1ldHJpYy5pZCB9KSBpZiBpID09IC0xXG5cbiAgICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdW2ldID0geyBpZDogbWV0cmljLmlkLCBzaXplOiBtZXRyaWMuc2l6ZSwgdmlldzogdmlldyB9IGlmIGkgIT0gLTFcblxuICAgICAgQHNhdmVTZXR1cCgpXG5cbiAgQG9yZGVyTWV0cmljcyA9IChqb2JpZCwgbm9kZWlkLCBpdGVtLCBpbmRleCkgLT5cbiAgICBAc2V0dXBMU0Zvcihqb2JpZCwgbm9kZWlkKVxuXG4gICAgYW5ndWxhci5mb3JFYWNoIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLCAodiwgaykgPT5cbiAgICAgIGlmIHYuaWQgPT0gaXRlbS5pZFxuICAgICAgICBAbWV0cmljc1tqb2JpZF1bbm9kZWlkXS5zcGxpY2UoaywgMSlcbiAgICAgICAgaWYgayA8IGluZGV4XG4gICAgICAgICAgaW5kZXggPSBpbmRleCAtIDFcblxuICAgIEBtZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShpbmRleCwgMCwgaXRlbSlcblxuICAgIEBzYXZlU2V0dXAoKVxuXG4gIEBnZXRNZXRyaWNzU2V0dXAgPSAoam9iaWQsIG5vZGVpZCkgPT5cbiAgICB7XG4gICAgICBuYW1lczogXy5tYXAoQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0sICh2YWx1ZSkgPT5cbiAgICAgICAgaWYgXy5pc1N0cmluZyh2YWx1ZSkgdGhlbiB7IGlkOiB2YWx1ZSwgc2l6ZTogXCJzbWFsbFwiLCB2aWV3OiBcImNoYXJ0XCIgfSBlbHNlIHZhbHVlXG4gICAgICApXG4gICAgfVxuXG4gIEBnZXRBdmFpbGFibGVNZXRyaWNzID0gKGpvYmlkLCBub2RlaWQpID0+XG4gICAgQHNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZClcblxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvdmVydGljZXMvXCIgKyBub2RlaWQgKyBcIi9tZXRyaWNzXCJcbiAgICAuc3VjY2VzcyAoZGF0YSkgPT5cbiAgICAgIHJlc3VsdHMgPSBbXVxuICAgICAgYW5ndWxhci5mb3JFYWNoIGRhdGEsICh2LCBrKSA9PlxuICAgICAgICBpID0gQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZih2LmlkKVxuICAgICAgICBpID0gXy5maW5kSW5kZXgoQG1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHsgaWQ6IHYuaWQgfSkgaWYgaSA9PSAtMVxuXG4gICAgICAgIGlmIGkgPT0gLTFcbiAgICAgICAgICByZXN1bHRzLnB1c2godilcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRzKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRBbGxBdmFpbGFibGVNZXRyaWNzID0gKGpvYmlkLCBub2RlaWQpID0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3NcIlxuICAgIC5zdWNjZXNzIChkYXRhKSA9PlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRNZXRyaWNzID0gKGpvYmlkLCBub2RlaWQsIG1ldHJpY0lkcykgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgIGlkcyA9IG1ldHJpY0lkcy5qb2luKFwiLFwiKVxuXG4gICAgJGh0dHAuZ2V0IGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiam9icy9cIiArIGpvYmlkICsgXCIvdmVydGljZXMvXCIgKyBub2RlaWQgKyBcIi9tZXRyaWNzP2dldD1cIiArIGlkc1xuICAgIC5zdWNjZXNzIChkYXRhKSA9PlxuICAgICAgcmVzdWx0ID0ge31cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCBkYXRhLCAodiwgaykgLT5cbiAgICAgICAgcmVzdWx0W3YuaWRdID0gcGFyc2VJbnQodi52YWx1ZSlcblxuICAgICAgbmV3VmFsdWUgPSB7XG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB2YWx1ZXM6IHJlc3VsdFxuICAgICAgfVxuICAgICAgQHNhdmVWYWx1ZShqb2JpZCwgbm9kZWlkLCBuZXdWYWx1ZSlcbiAgICAgIGRlZmVycmVkLnJlc29sdmUobmV3VmFsdWUpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cblxuICAjIEFzeW5jaHJvbm91c2x5IHJlcXVlc3RzIHRoZSB3YXRlcm1hcmsgbWV0cmljcyBmb3IgdGhlIGdpdmVuIG5vZGVzLiBUaGVcbiAgIyByZXR1cm5lZCBvYmplY3QgaGFzIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAjXG4gICMge1xuICAjICAgIFwiPG5vZGVJZD5cIjoge1xuICAjICAgICAgICAgIFwibG93V2F0ZXJtYXJrXCI6IDxsb3dXYXRlcm1hcms+XG4gICMgICAgICAgICAgXCJ3YXRlcm1hcmtzXCI6IHtcbiAgIyAgICAgICAgICAgICAgIDA6IDx3YXRlcm1hcmsgZm9yIHN1YnRhc2sgMD5cbiAgIyAgICAgICAgICAgICAgIC4uLlxuICAjICAgICAgICAgICAgICAgbjogPHdhdGVybWFyayBmb3Igc3VidGFzayBuPlxuICAjICAgICAgICAgICAgfVxuICAjICAgICAgIH1cbiAgIyB9XG4gICNcbiAgIyBJZiBubyB3YXRlcm1hcmsgaXMgYXZhaWxhYmxlLCBsb3dXYXRlcm1hcmsgd2lsbCBiZSBOYU4gYW5kXG4gICMgdGhlIHdhdGVybWFya3Mgd2lsbCBiZSBlbXB0eS5cbiAgQGdldFdhdGVybWFya3MgPSAoamlkLCBub2RlcykgLT5cbiAgICAjIFJlcXVlc3RzIHRoZSB3YXRlcm1hcmtzIGZvciBhIHNpbmdsZSB2ZXJ0ZXguIFRyaWdnZXJzIGEgcmVxdWVzdFxuICAgICMgdG8gdGhlIE1ldHJpY3Mgc2VydmljZS5cbiAgICByZXF1ZXN0V2F0ZXJtYXJrRm9yTm9kZSA9IChub2RlKSA9PlxuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAgICMgUmVxdWVzdCBtZXRyaWNzIGZvciBlYWNoIHN1YnRhc2tcbiAgICAgIG1ldHJpY0lkcyA9IChpICsgXCIuY3VycmVudExvd1dhdGVybWFya1wiIGZvciBpIGluIFswLi5ub2RlLnBhcmFsbGVsaXNtIC0gMV0pXG4gICAgICBAZ2V0TWV0cmljcyhqaWQsIG5vZGUuaWQsIG1ldHJpY0lkcykudGhlbiAobWV0cmljcykgLT5cbiAgICAgICAgbWluVmFsdWUgPSBOYU5cbiAgICAgICAgd2F0ZXJtYXJrcyA9IHt9XG5cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgbWV0cmljcy52YWx1ZXNcbiAgICAgICAgICBzdWJ0YXNrSW5kZXggPSBrZXkucmVwbGFjZSgnLmN1cnJlbnRMb3dXYXRlcm1hcmsnLCAnJylcbiAgICAgICAgICB3YXRlcm1hcmtzW3N1YnRhc2tJbmRleF0gPSB2YWx1ZVxuXG4gICAgICAgICAgaWYgKGlzTmFOKG1pblZhbHVlKSB8fCB2YWx1ZSA8IG1pblZhbHVlKVxuICAgICAgICAgICAgbWluVmFsdWUgPSB2YWx1ZVxuXG4gICAgICAgIGlmICghaXNOYU4obWluVmFsdWUpICYmIG1pblZhbHVlID4gd2F0ZXJtYXJrc0NvbmZpZy5ub1dhdGVybWFyaylcbiAgICAgICAgICBsb3dXYXRlcm1hcmsgPSBtaW5WYWx1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBOYU4gaW5kaWNhdGVzIG5vIHdhdGVybWFyayBhdmFpbGFibGVcbiAgICAgICAgICBsb3dXYXRlcm1hcmsgPSBOYU5cblxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcImxvd1dhdGVybWFya1wiOiBsb3dXYXRlcm1hcmssIFwid2F0ZXJtYXJrc1wiOiB3YXRlcm1hcmtzfSlcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgd2F0ZXJtYXJrcyA9IHt9XG5cbiAgICAjIFJlcXVlc3Qgd2F0ZXJtYXJrcyBmb3IgZWFjaCBub2RlIGFuZCB1cGRhdGUgd2F0ZXJtYXJrc1xuICAgIGxlbiA9IG5vZGVzLmxlbmd0aFxuICAgIGFuZ3VsYXIuZm9yRWFjaCBub2RlcywgKG5vZGUsIGluZGV4KSA9PlxuICAgICAgcHIgPSByZXF1ZXN0V2F0ZXJtYXJrRm9yTm9kZShub2RlKS50aGVuIChkYXRhKSAtPlxuICAgICAgICB3YXRlcm1hcmtzW25vZGUuaWRdID0gZGF0YVxuXG4gICAgICBwcm9taXNlcy5wdXNoKHByKVxuXG4gICAgJHEuYWxsKHByb21pc2VzKS50aGVuICgpID0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHdhdGVybWFya3MpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGdldEdsb2JhbE92ZXJ2aWV3ID0gKGppZCwgbm9kZXMpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICBwcm9taXNlcyA9IFtdXG5cbiAgICBnZXRTb3VyY2VzQW5kU2lua3MgPSAoKSA9PlxuICAgICAgcHJlZGVjZXNzb3JzID0gW11cbiAgICAgIHNvdXJjZXMgPSBbXVxuICAgICAgc2lua3MgPSBbXVxuXG4gICAgICBhbmd1bGFyLmZvckVhY2gobm9kZXMsIChub2RlKSAtPlxuICAgICAgICBpZiAhbm9kZS5pbnB1dHNcbiAgICAgICAgICBzb3VyY2VzLnB1c2gobm9kZS5pZClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByZWRlY2Vzc29ycyA9IHByZWRlY2Vzc29ycy5jb25jYXQoXy5tYXAobm9kZS5pbnB1dHMsIChpbnB1dCkgLT4gaW5wdXQuaWQpKVxuICAgICAgKVxuXG4gICAgICBhbmd1bGFyLmZvckVhY2gobm9kZXMsIChub2RlKSAtPlxuICAgICAgICBpZiAhXy5jb250YWlucyhwcmVkZWNlc3NvcnMsIG5vZGUuaWQpXG4gICAgICAgICAgc2lua3MucHVzaChub2RlLmlkKVxuICAgICAgKVxuXG4gICAgICBbc291cmNlcywgc2lua3NdXG5cbiAgICBbc291cmNlcywgc2lua3NdID0gZ2V0U291cmNlc0FuZFNpbmtzKClcblxuICAgIGluY29taW5nID0gMFxuICAgIG91dGdvaW5nID0gMFxuXG4gICAgYW5ndWxhci5mb3JFYWNoIG5vZGVzLCAobm9kZSkgPT5cbiAgICAgIG1ldHJpY0lkcyA9IChpICsgXCIubnVtQnl0ZXNPdXRQZXJTZWNvbmRcIiBmb3IgaSBpbiBbMC4ubm9kZS5wYXJhbGxlbGlzbSAtIDFdKS5jb25jYXQgKGkgKyBcIi5udW1CeXRlc0luUGVyU2Vjb25kXCIgZm9yIGkgaW4gWzAuLm5vZGUucGFyYWxsZWxpc20gLSAxXSlcbiAgICAgIHByID0gQGdldE1ldHJpY3MoamlkLCBub2RlLmlkLCBtZXRyaWNJZHMpLnRoZW4gKG1ldHJpY3MpIC0+XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChfLmtleXMobWV0cmljcy52YWx1ZXMpLCAoa2V5KSA9PlxuICAgICAgICAgIGlmIGtleS5pbmRleE9mKFwibnVtQnl0ZXNPdXRQZXJTZWNvbmRcIikgIT0gLTEgJiYgXy5jb250YWlucyhzb3VyY2VzLCBub2RlLmlkKVxuICAgICAgICAgICAgb3V0Z29pbmcgKz0gbWV0cmljcy52YWx1ZXNba2V5XVxuICAgICAgICAgIGVsc2UgaWYga2V5LmluZGV4T2YoXCJudW1CeXRlc0luUGVyU2Vjb25kXCIpICE9IC0xICYmIF8uY29udGFpbnMoc2lua3MsIG5vZGUuaWQpXG4gICAgICAgICAgICBpbmNvbWluZyArPSBtZXRyaWNzLnZhbHVlc1trZXldXG4gICAgICAgIClcblxuICAgICAgcHJvbWlzZXMucHVzaChwcilcblxuICAgICRxLmFsbChwcm9taXNlcykudGhlbiAoKSA9PlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIGluY29taW5nOiBpbmNvbWluZyxcbiAgICAgICAgb3V0Z29pbmc6IG91dGdvaW5nLFxuICAgICAgfSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAc2V0dXBMUygpXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnTWV0cmljc1NlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgJHEsIGZsaW5rQ29uZmlnLCAkaW50ZXJ2YWwsIHdhdGVybWFya3NDb25maWcpIHtcbiAgdGhpcy5tZXRyaWNzID0ge307XG4gIHRoaXMudmFsdWVzID0ge307XG4gIHRoaXMud2F0Y2hlZCA9IHt9O1xuICB0aGlzLm9ic2VydmVyID0ge1xuICAgIGpvYmlkOiBudWxsLFxuICAgIG5vZGVpZDogbnVsbCxcbiAgICBjYWxsYmFjazogbnVsbFxuICB9O1xuICB0aGlzLnJlZnJlc2ggPSAkaW50ZXJ2YWwoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaChfdGhpcy5tZXRyaWNzLCBmdW5jdGlvbih2ZXJ0aWNlcywgam9iaWQpIHtcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZm9yRWFjaCh2ZXJ0aWNlcywgZnVuY3Rpb24obWV0cmljcywgbm9kZWlkKSB7XG4gICAgICAgICAgdmFyIG5hbWVzO1xuICAgICAgICAgIG5hbWVzID0gW107XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG1ldHJpY3MsIGZ1bmN0aW9uKG1ldHJpYywgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBuYW1lcy5wdXNoKG1ldHJpYy5pZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5nZXRNZXRyaWNzKGpvYmlkLCBub2RlaWQsIG5hbWVzKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICBpZiAoam9iaWQgPT09IF90aGlzLm9ic2VydmVyLmpvYmlkICYmIG5vZGVpZCA9PT0gX3RoaXMub2JzZXJ2ZXIubm9kZWlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLm9ic2VydmVyLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMub2JzZXJ2ZXIuY2FsbGJhY2sodmFsdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9KSh0aGlzKSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgdGhpcy5yZWdpc3Rlck9ic2VydmVyID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLm9ic2VydmVyLmpvYmlkID0gam9iaWQ7XG4gICAgdGhpcy5vYnNlcnZlci5ub2RlaWQgPSBub2RlaWQ7XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2ZXIuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgfTtcbiAgdGhpcy51blJlZ2lzdGVyT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vYnNlcnZlciA9IHtcbiAgICAgIGpvYmlkOiBudWxsLFxuICAgICAgbm9kZWlkOiBudWxsLFxuICAgICAgY2FsbGJhY2s6IG51bGxcbiAgICB9O1xuICB9O1xuICB0aGlzLnNldHVwTWV0cmljcyA9IGZ1bmN0aW9uKGpvYmlkLCB2ZXJ0aWNlcykge1xuICAgIHRoaXMuc2V0dXBMUygpO1xuICAgIHRoaXMud2F0Y2hlZFtqb2JpZF0gPSBbXTtcbiAgICByZXR1cm4gYW5ndWxhci5mb3JFYWNoKHZlcnRpY2VzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIGlmICh2LmlkKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLndhdGNoZWRbam9iaWRdLnB1c2godi5pZCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuICB0aGlzLmdldFdpbmRvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAxMDA7XG4gIH07XG4gIHRoaXMuc2V0dXBMUyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChzZXNzaW9uU3RvcmFnZS5mbGlua01ldHJpY3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5zYXZlU2V0dXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWV0cmljcyA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZmxpbmtNZXRyaWNzKTtcbiAgfTtcbiAgdGhpcy5zYXZlU2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UuZmxpbmtNZXRyaWNzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5tZXRyaWNzKTtcbiAgfTtcbiAgdGhpcy5zYXZlVmFsdWUgPSBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCB2YWx1ZSkge1xuICAgIGlmICh0aGlzLnZhbHVlc1tqb2JpZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy52YWx1ZXNbam9iaWRdID0ge307XG4gICAgfVxuICAgIGlmICh0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXS5wdXNoKHZhbHVlKTtcbiAgICBpZiAodGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0ubGVuZ3RoID4gdGhpcy5nZXRXaW5kb3coKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW2pvYmlkXVtub2RlaWRdLnNoaWZ0KCk7XG4gICAgfVxuICB9O1xuICB0aGlzLmdldFZhbHVlcyA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSB7XG4gICAgdmFyIHJlc3VsdHM7XG4gICAgaWYgKHRoaXMudmFsdWVzW2pvYmlkXSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICh0aGlzLnZhbHVlc1tqb2JpZF1bbm9kZWlkXSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBhbmd1bGFyLmZvckVhY2godGhpcy52YWx1ZXNbam9iaWRdW25vZGVpZF0sIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgaWYgKHYudmFsdWVzW21ldHJpY2lkXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICB4OiB2LnRpbWVzdGFtcCxcbiAgICAgICAgICAgIHk6IHYudmFsdWVzW21ldHJpY2lkXVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcbiAgdGhpcy5zZXR1cExTRm9yID0gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCkge1xuICAgIGlmICh0aGlzLm1ldHJpY3Nbam9iaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMubWV0cmljc1tqb2JpZF0gPSB7fTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdID0gW107XG4gICAgfVxuICB9O1xuICB0aGlzLmFkZE1ldHJpYyA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpY2lkKSB7XG4gICAgdGhpcy5zZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpO1xuICAgIHRoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5wdXNoKHtcbiAgICAgIGlkOiBtZXRyaWNpZCxcbiAgICAgIHNpemU6ICdzbWFsbCcsXG4gICAgICB2aWV3OiAnY2hhcnQnXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc2F2ZVNldHVwKCk7XG4gIH07XG4gIHRoaXMucmVtb3ZlTWV0cmljID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpYykge1xuICAgICAgdmFyIGk7XG4gICAgICBpZiAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSAhPSBudWxsKSB7XG4gICAgICAgIGkgPSBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljKTtcbiAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgaSA9IF8uZmluZEluZGV4KF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHtcbiAgICAgICAgICAgIGlkOiBtZXRyaWNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuc2F2ZVNldHVwKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcyk7XG4gIHRoaXMuc2V0TWV0cmljU2l6ZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBtZXRyaWMsIHNpemUpIHtcbiAgICAgIHZhciBpO1xuICAgICAgaWYgKF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0gIT0gbnVsbCkge1xuICAgICAgICBpID0gX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXS5pbmRleE9mKG1ldHJpYy5pZCk7XG4gICAgICAgIGlmIChpID09PSAtMSkge1xuICAgICAgICAgIGkgPSBfLmZpbmRJbmRleChfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7XG4gICAgICAgICAgICBpZDogbWV0cmljLmlkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICAgICAgX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXVtpXSA9IHtcbiAgICAgICAgICAgIGlkOiBtZXRyaWMuaWQsXG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgdmlldzogbWV0cmljLnZpZXdcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy5zYXZlU2V0dXAoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5zZXRNZXRyaWNWaWV3ID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIG1ldHJpYywgdmlldykge1xuICAgICAgdmFyIGk7XG4gICAgICBpZiAoX3RoaXMubWV0cmljc1tqb2JpZF1bbm9kZWlkXSAhPSBudWxsKSB7XG4gICAgICAgIGkgPSBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLmluZGV4T2YobWV0cmljLmlkKTtcbiAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgaSA9IF8uZmluZEluZGV4KF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIHtcbiAgICAgICAgICAgIGlkOiBtZXRyaWMuaWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgICBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdW2ldID0ge1xuICAgICAgICAgICAgaWQ6IG1ldHJpYy5pZCxcbiAgICAgICAgICAgIHNpemU6IG1ldHJpYy5zaXplLFxuICAgICAgICAgICAgdmlldzogdmlld1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzLnNhdmVTZXR1cCgpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKHRoaXMpO1xuICB0aGlzLm9yZGVyTWV0cmljcyA9IGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQsIGl0ZW0sIGluZGV4KSB7XG4gICAgdGhpcy5zZXR1cExTRm9yKGpvYmlkLCBub2RlaWQpO1xuICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgaWYgKHYuaWQgPT09IGl0ZW0uaWQpIHtcbiAgICAgICAgICBfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLnNwbGljZShrLCAxKTtcbiAgICAgICAgICBpZiAoayA8IGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPSBpbmRleCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uc3BsaWNlKGluZGV4LCAwLCBpdGVtKTtcbiAgICByZXR1cm4gdGhpcy5zYXZlU2V0dXAoKTtcbiAgfTtcbiAgdGhpcy5nZXRNZXRyaWNzU2V0dXAgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oam9iaWQsIG5vZGVpZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZXM6IF8ubWFwKF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogdmFsdWUsXG4gICAgICAgICAgICAgIHNpemU6IFwic21hbGxcIixcbiAgICAgICAgICAgICAgdmlldzogXCJjaGFydFwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRBdmFpbGFibGVNZXRyaWNzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIF90aGlzLnNldHVwTFNGb3Ioam9iaWQsIG5vZGVpZCk7XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqb2JzL1wiICsgam9iaWQgKyBcIi92ZXJ0aWNlcy9cIiArIG5vZGVpZCArIFwiL21ldHJpY3NcIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgaSA9IF90aGlzLm1ldHJpY3Nbam9iaWRdW25vZGVpZF0uaW5kZXhPZih2LmlkKTtcbiAgICAgICAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGkgPSBfLmZpbmRJbmRleChfdGhpcy5tZXRyaWNzW2pvYmlkXVtub2RlaWRdLCB7XG4gICAgICAgICAgICAgIGlkOiB2LmlkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5wdXNoKHYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbiAgdGhpcy5nZXRBbGxBdmFpbGFibGVNZXRyaWNzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGpvYmlkLCBub2RlaWQpIHtcbiAgICAgIHZhciBkZWZlcnJlZDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG4gIH0pKHRoaXMpO1xuICB0aGlzLmdldE1ldHJpY3MgPSBmdW5jdGlvbihqb2JpZCwgbm9kZWlkLCBtZXRyaWNJZHMpIHtcbiAgICB2YXIgZGVmZXJyZWQsIGlkcztcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgaWRzID0gbWV0cmljSWRzLmpvaW4oXCIsXCIpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImpvYnMvXCIgKyBqb2JpZCArIFwiL3ZlcnRpY2VzL1wiICsgbm9kZWlkICsgXCIvbWV0cmljcz9nZXQ9XCIgKyBpZHMpLnN1Y2Nlc3MoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgbmV3VmFsdWUsIHJlc3VsdDtcbiAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFt2LmlkXSA9IHBhcnNlSW50KHYudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgbmV3VmFsdWUgPSB7XG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHZhbHVlczogcmVzdWx0XG4gICAgICAgIH07XG4gICAgICAgIF90aGlzLnNhdmVWYWx1ZShqb2JpZCwgbm9kZWlkLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKG5ld1ZhbHVlKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldFdhdGVybWFya3MgPSBmdW5jdGlvbihqaWQsIG5vZGVzKSB7XG4gICAgdmFyIGRlZmVycmVkLCBsZW4sIHJlcXVlc3RXYXRlcm1hcmtGb3JOb2RlLCB3YXRlcm1hcmtzO1xuICAgIHJlcXVlc3RXYXRlcm1hcmtGb3JOb2RlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQsIGksIG1ldHJpY0lkcztcbiAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICBtZXRyaWNJZHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGosIHJlZiwgcmVzdWx0czE7XG4gICAgICAgICAgcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICBmb3IgKGkgPSBqID0gMCwgcmVmID0gbm9kZS5wYXJhbGxlbGlzbSAtIDE7IDAgPD0gcmVmID8gaiA8PSByZWYgOiBqID49IHJlZjsgaSA9IDAgPD0gcmVmID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKGkgKyBcIi5jdXJyZW50TG93V2F0ZXJtYXJrXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIF90aGlzLmdldE1ldHJpY3MoamlkLCBub2RlLmlkLCBtZXRyaWNJZHMpLnRoZW4oZnVuY3Rpb24obWV0cmljcykge1xuICAgICAgICAgIHZhciBrZXksIGxvd1dhdGVybWFyaywgbWluVmFsdWUsIHJlZiwgc3VidGFza0luZGV4LCB2YWx1ZSwgd2F0ZXJtYXJrcztcbiAgICAgICAgICBtaW5WYWx1ZSA9IDAvMDtcbiAgICAgICAgICB3YXRlcm1hcmtzID0ge307XG4gICAgICAgICAgcmVmID0gbWV0cmljcy52YWx1ZXM7XG4gICAgICAgICAgZm9yIChrZXkgaW4gcmVmKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICAgICAgc3VidGFza0luZGV4ID0ga2V5LnJlcGxhY2UoJy5jdXJyZW50TG93V2F0ZXJtYXJrJywgJycpO1xuICAgICAgICAgICAgd2F0ZXJtYXJrc1tzdWJ0YXNrSW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNOYU4obWluVmFsdWUpIHx8IHZhbHVlIDwgbWluVmFsdWUpIHtcbiAgICAgICAgICAgICAgbWluVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpc05hTihtaW5WYWx1ZSkgJiYgbWluVmFsdWUgPiB3YXRlcm1hcmtzQ29uZmlnLm5vV2F0ZXJtYXJrKSB7XG4gICAgICAgICAgICBsb3dXYXRlcm1hcmsgPSBtaW5WYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG93V2F0ZXJtYXJrID0gMC8wO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBcImxvd1dhdGVybWFya1wiOiBsb3dXYXRlcm1hcmssXG4gICAgICAgICAgICBcIndhdGVybWFya3NcIjogd2F0ZXJtYXJrc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICB3YXRlcm1hcmtzID0ge307XG4gICAgbGVuID0gbm9kZXMubGVuZ3RoO1xuICAgIGFuZ3VsYXIuZm9yRWFjaChub2RlcywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24obm9kZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHByO1xuICAgICAgICBwciA9IHJlcXVlc3RXYXRlcm1hcmtGb3JOb2RlKG5vZGUpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiB3YXRlcm1hcmtzW25vZGUuaWRdID0gZGF0YTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlcy5wdXNoKHByKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgICRxLmFsbChwcm9taXNlcykudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUod2F0ZXJtYXJrcyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5nZXRHbG9iYWxPdmVydmlldyA9IGZ1bmN0aW9uKGppZCwgbm9kZXMpIHtcbiAgICB2YXIgZGVmZXJyZWQsIGdldFNvdXJjZXNBbmRTaW5rcywgaW5jb21pbmcsIG91dGdvaW5nLCBwcm9taXNlcywgcmVmLCBzaW5rcywgc291cmNlcztcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgcHJvbWlzZXMgPSBbXTtcbiAgICBnZXRTb3VyY2VzQW5kU2lua3MgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZWRlY2Vzc29ycywgc2lua3MsIHNvdXJjZXM7XG4gICAgICAgIHByZWRlY2Vzc29ycyA9IFtdO1xuICAgICAgICBzb3VyY2VzID0gW107XG4gICAgICAgIHNpbmtzID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChub2RlcywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgIGlmICghbm9kZS5pbnB1dHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2VzLnB1c2gobm9kZS5pZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVkZWNlc3NvcnMgPSBwcmVkZWNlc3NvcnMuY29uY2F0KF8ubWFwKG5vZGUuaW5wdXRzLCBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5wdXQuaWQ7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKG5vZGVzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHByZWRlY2Vzc29ycywgbm9kZS5pZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzaW5rcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbc291cmNlcywgc2lua3NdO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICByZWYgPSBnZXRTb3VyY2VzQW5kU2lua3MoKSwgc291cmNlcyA9IHJlZlswXSwgc2lua3MgPSByZWZbMV07XG4gICAgaW5jb21pbmcgPSAwO1xuICAgIG91dGdvaW5nID0gMDtcbiAgICBhbmd1bGFyLmZvckVhY2gobm9kZXMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGksIG1ldHJpY0lkcywgcHI7XG4gICAgICAgIG1ldHJpY0lkcyA9ICgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGosIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChpID0gaiA9IDAsIHJlZjEgPSBub2RlLnBhcmFsbGVsaXNtIC0gMTsgMCA8PSByZWYxID8gaiA8PSByZWYxIDogaiA+PSByZWYxOyBpID0gMCA8PSByZWYxID8gKytqIDogLS1qKSB7XG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKGkgKyBcIi5udW1CeXRlc091dFBlclNlY29uZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KSgpKS5jb25jYXQoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBqLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAoaSA9IGogPSAwLCByZWYxID0gbm9kZS5wYXJhbGxlbGlzbSAtIDE7IDAgPD0gcmVmMSA/IGogPD0gcmVmMSA6IGogPj0gcmVmMTsgaSA9IDAgPD0gcmVmMSA/ICsraiA6IC0taikge1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChpICsgXCIubnVtQnl0ZXNJblBlclNlY29uZFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KSgpKTtcbiAgICAgICAgcHIgPSBfdGhpcy5nZXRNZXRyaWNzKGppZCwgbm9kZS5pZCwgbWV0cmljSWRzKS50aGVuKGZ1bmN0aW9uKG1ldHJpY3MpIHtcbiAgICAgICAgICByZXR1cm4gYW5ndWxhci5mb3JFYWNoKF8ua2V5cyhtZXRyaWNzLnZhbHVlcyksIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCJudW1CeXRlc091dFBlclNlY29uZFwiKSAhPT0gLTEgJiYgXy5jb250YWlucyhzb3VyY2VzLCBub2RlLmlkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvdXRnb2luZyArPSBtZXRyaWNzLnZhbHVlc1trZXldO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleS5pbmRleE9mKFwibnVtQnl0ZXNJblBlclNlY29uZFwiKSAhPT0gLTEgJiYgXy5jb250YWlucyhzaW5rcywgbm9kZS5pZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5jb21pbmcgKz0gbWV0cmljcy52YWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSh0aGlzKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZXMucHVzaChwcik7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICAkcS5hbGwocHJvbWlzZXMpLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICBpbmNvbWluZzogaW5jb21pbmcsXG4gICAgICAgICAgb3V0Z29pbmc6IG91dGdvaW5nXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuc2V0dXBMUygpO1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdPdmVydmlld0NvbnRyb2xsZXInLCAoJHNjb3BlLCBPdmVydmlld1NlcnZpY2UsIEpvYnNTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSAtPlxuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSAtPlxuICAgICRzY29wZS5ydW5uaW5nSm9icyA9IEpvYnNTZXJ2aWNlLmdldEpvYnMoJ3J1bm5pbmcnKVxuICAgICRzY29wZS5maW5pc2hlZEpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpXG5cbiAgSm9ic1NlcnZpY2UucmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICBKb2JzU2VydmljZS51blJlZ2lzdGVyT2JzZXJ2ZXIoJHNjb3BlLmpvYk9ic2VydmVyKVxuXG4gICRzY29wZS5qb2JPYnNlcnZlcigpXG5cbiAgT3ZlcnZpZXdTZXJ2aWNlLmxvYWRPdmVydmlldygpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YVxuXG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICBPdmVydmlld1NlcnZpY2UubG9hZE92ZXJ2aWV3KCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5vdmVydmlldyA9IGRhdGFcbiAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAkc2NvcGUuJG9uICckZGVzdHJveScsIC0+XG4gICAgJGludGVydmFsLmNhbmNlbChyZWZyZXNoKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignT3ZlcnZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBPdmVydmlld1NlcnZpY2UsIEpvYnNTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gIHZhciByZWZyZXNoO1xuICAkc2NvcGUuam9iT2JzZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucnVubmluZ0pvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdydW5uaW5nJyk7XG4gICAgcmV0dXJuICRzY29wZS5maW5pc2hlZEpvYnMgPSBKb2JzU2VydmljZS5nZXRKb2JzKCdmaW5pc2hlZCcpO1xuICB9O1xuICBKb2JzU2VydmljZS5yZWdpc3Rlck9ic2VydmVyKCRzY29wZS5qb2JPYnNlcnZlcik7XG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEpvYnNTZXJ2aWNlLnVuUmVnaXN0ZXJPYnNlcnZlcigkc2NvcGUuam9iT2JzZXJ2ZXIpO1xuICB9KTtcbiAgJHNjb3BlLmpvYk9ic2VydmVyKCk7XG4gIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm92ZXJ2aWV3ID0gZGF0YTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE92ZXJ2aWV3U2VydmljZS5sb2FkT3ZlcnZpZXcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUub3ZlcnZpZXcgPSBkYXRhO1xuICAgIH0pO1xuICB9LCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl0pO1xuICByZXR1cm4gJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uc2VydmljZSAnT3ZlcnZpZXdTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIG92ZXJ2aWV3ID0ge31cblxuICBAbG9hZE92ZXJ2aWV3ID0gLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcIm92ZXJ2aWV3XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgb3ZlcnZpZXcgPSBkYXRhXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnT3ZlcnZpZXdTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB2YXIgb3ZlcnZpZXc7XG4gIG92ZXJ2aWV3ID0ge307XG4gIHRoaXMubG9hZE92ZXJ2aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJvdmVydmlld1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICBvdmVydmlldyA9IGRhdGE7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiIsIiNcbiMgTGljZW5zZWQgdG8gdGhlIEFwYWNoZSBTb2Z0d2FyZSBGb3VuZGF0aW9uIChBU0YpIHVuZGVyIG9uZVxuIyBvciBtb3JlIGNvbnRyaWJ1dG9yIGxpY2Vuc2UgYWdyZWVtZW50cy4gIFNlZSB0aGUgTk9USUNFIGZpbGVcbiMgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzIHdvcmsgZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cbiMgcmVnYXJkaW5nIGNvcHlyaWdodCBvd25lcnNoaXAuICBUaGUgQVNGIGxpY2Vuc2VzIHRoaXMgZmlsZVxuIyB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlXG4jIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxuIyB3aXRoIHRoZSBMaWNlbnNlLiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4jXG4jICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiNcbiMgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4jIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4jIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuI1xuXG5hbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKVxuXG4uY29udHJvbGxlciAnSm9iU3VibWl0Q29udHJvbGxlcicsICgkc2NvcGUsIEpvYlN1Ym1pdFNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcsICRzdGF0ZSwgJGxvY2F0aW9uKSAtPlxuICAkc2NvcGUueWFybiA9ICRsb2NhdGlvbi5hYnNVcmwoKS5pbmRleE9mKFwiL3Byb3h5L2FwcGxpY2F0aW9uX1wiKSAhPSAtMVxuICAkc2NvcGUubG9hZExpc3QgPSAoKSAtPlxuICAgIEpvYlN1Ym1pdFNlcnZpY2UubG9hZEphckxpc3QoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLmFkZHJlc3MgPSBkYXRhLmFkZHJlc3NcbiAgICAgICRzY29wZS5ub2FjY2VzcyA9IGRhdGEuZXJyb3JcbiAgICAgICRzY29wZS5qYXJzID0gZGF0YS5maWxlc1xuXG4gICRzY29wZS5kZWZhdWx0U3RhdGUgPSAoKSAtPlxuICAgICRzY29wZS5wbGFuID0gbnVsbFxuICAgICRzY29wZS5lcnJvciA9IG51bGxcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZDogbnVsbCxcbiAgICAgIHBhcmFsbGVsaXNtOiBcIlwiLFxuICAgICAgc2F2ZXBvaW50UGF0aDogXCJcIixcbiAgICAgIGFsbG93Tm9uUmVzdG9yZWRTdGF0ZTogZmFsc2VcbiAgICAgICdlbnRyeS1jbGFzcyc6IFwiXCIsXG4gICAgICAncHJvZ3JhbS1hcmdzJzogXCJcIixcbiAgICAgICdwbGFuLWJ1dHRvbic6IFwiU2hvdyBQbGFuXCIsXG4gICAgICAnc3VibWl0LWJ1dHRvbic6IFwiU3VibWl0XCIsXG4gICAgICAnYWN0aW9uLXRpbWUnOiAwXG4gICAgfVxuXG4gICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAkc2NvcGUudXBsb2FkZXIgPSB7fVxuICAkc2NvcGUubG9hZExpc3QoKVxuXG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICAkc2NvcGUubG9hZExpc3QoKVxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG5cbiAgJHNjb3BlLnNlbGVjdEphciA9IChpZCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT0gaWRcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAgIGVsc2VcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAgICAgJHNjb3BlLnN0YXRlLnNlbGVjdGVkID0gaWRcblxuICAkc2NvcGUuZGVsZXRlSmFyID0gKGV2ZW50LCBpZCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT0gaWRcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKVxuICAgIGFuZ3VsYXIuZWxlbWVudChldmVudC5jdXJyZW50VGFyZ2V0KS5yZW1vdmVDbGFzcyhcImZhLXJlbW92ZVwiKS5hZGRDbGFzcyhcImZhLXNwaW4gZmEtc3Bpbm5lclwiKVxuICAgIEpvYlN1Ym1pdFNlcnZpY2UuZGVsZXRlSmFyKGlkKS50aGVuIChkYXRhKSAtPlxuICAgICAgYW5ndWxhci5lbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiZmEtc3BpbiBmYS1zcGlubmVyXCIpLmFkZENsYXNzKFwiZmEtcmVtb3ZlXCIpXG4gICAgICBpZiBkYXRhLmVycm9yP1xuICAgICAgICBhbGVydChkYXRhLmVycm9yKVxuXG4gICRzY29wZS5sb2FkRW50cnlDbGFzcyA9IChuYW1lKSAtPlxuICAgICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSA9IG5hbWVcblxuICAkc2NvcGUuZ2V0UGxhbiA9ICgpIC0+XG4gICAgaWYgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID09IFwiU2hvdyBQbGFuXCJcbiAgICAgIGFjdGlvbiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb25cbiAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIlxuICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJHZXR0aW5nIFBsYW5cIlxuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbFxuICAgICAgJHNjb3BlLnBsYW4gPSBudWxsXG4gICAgICBKb2JTdWJtaXRTZXJ2aWNlLmdldFBsYW4oXG4gICAgICAgICRzY29wZS5zdGF0ZS5zZWxlY3RlZCwge1xuICAgICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgICBwYXJhbGxlbGlzbTogJHNjb3BlLnN0YXRlLnBhcmFsbGVsaXNtLFxuICAgICAgICAgICdwcm9ncmFtLWFyZ3MnOiAkc2NvcGUuc3RhdGVbJ3Byb2dyYW0tYXJncyddXG4gICAgICAgIH1cbiAgICAgICkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgaWYgYWN0aW9uID09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXVxuICAgICAgICAgICRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9IFwiU2hvdyBQbGFuXCJcbiAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBkYXRhLmVycm9yXG4gICAgICAgICAgJHNjb3BlLnBsYW4gPSBkYXRhLnBsYW5cblxuICAkc2NvcGUucnVuSm9iID0gKCkgLT5cbiAgICBpZiAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9PSBcIlN1Ym1pdFwiXG4gICAgICBhY3Rpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgICAgJHNjb3BlLnN0YXRlWydhY3Rpb24tdGltZSddID0gYWN0aW9uXG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0dGluZ1wiXG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiXG4gICAgICAkc2NvcGUuZXJyb3IgPSBudWxsXG4gICAgICBKb2JTdWJtaXRTZXJ2aWNlLnJ1bkpvYihcbiAgICAgICAgJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICAgJ2VudHJ5LWNsYXNzJzogJHNjb3BlLnN0YXRlWydlbnRyeS1jbGFzcyddLFxuICAgICAgICAgIHBhcmFsbGVsaXNtOiAkc2NvcGUuc3RhdGUucGFyYWxsZWxpc20sXG4gICAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ10sXG4gICAgICAgICAgc2F2ZXBvaW50UGF0aDogJHNjb3BlLnN0YXRlWydzYXZlcG9pbnRQYXRoJ10sXG4gICAgICAgICAgYWxsb3dOb25SZXN0b3JlZFN0YXRlOiAkc2NvcGUuc3RhdGVbJ2FsbG93Tm9uUmVzdG9yZWRTdGF0ZSddXG4gICAgICAgIH1cbiAgICAgICkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgaWYgYWN0aW9uID09ICRzY29wZS5zdGF0ZVsnYWN0aW9uLXRpbWUnXVxuICAgICAgICAgICRzY29wZS5zdGF0ZVsnc3VibWl0LWJ1dHRvbiddID0gXCJTdWJtaXRcIlxuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3JcbiAgICAgICAgICBpZiBkYXRhLmpvYmlkP1xuICAgICAgICAgICAgJHN0YXRlLmdvKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtqb2JpZDogZGF0YS5qb2JpZH0pXG5cbiAgIyBqb2IgcGxhbiBkaXNwbGF5IHJlbGF0ZWQgc3R1ZmZcbiAgJHNjb3BlLm5vZGVpZCA9IG51bGxcbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSAobm9kZWlkKSAtPlxuICAgIGlmIG5vZGVpZCAhPSAkc2NvcGUubm9kZWlkXG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkXG4gICAgICAkc2NvcGUudmVydGV4ID0gbnVsbFxuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbFxuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGxcblxuICAgICAgJHNjb3BlLiRicm9hZGNhc3QgJ3JlbG9hZCdcblxuICAgIGVsc2VcbiAgICAgICRzY29wZS5ub2RlaWQgPSBudWxsXG4gICAgICAkc2NvcGUubm9kZVVuZm9sZGVkID0gZmFsc2VcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsXG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsXG4gICAgICAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbFxuXG4gICRzY29wZS5jbGVhckZpbGVzID0gKCkgLT5cbiAgICAkc2NvcGUudXBsb2FkZXIgPSB7fVxuXG4gICRzY29wZS51cGxvYWRGaWxlcyA9IChmaWxlcykgLT5cbiAgICAjIG1ha2Ugc3VyZSBldmVyeXRoaW5nIGlzIGNsZWFyIGFnYWluLlxuICAgICRzY29wZS51cGxvYWRlciA9IHt9XG4gICAgaWYgZmlsZXMubGVuZ3RoID09IDFcbiAgICAgICRzY29wZS51cGxvYWRlclsnZmlsZSddID0gZmlsZXNbMF1cbiAgICAgICRzY29wZS51cGxvYWRlclsndXBsb2FkJ10gPSB0cnVlXG4gICAgZWxzZVxuICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gXCJEaWQgeWEgZm9yZ2V0IHRvIHNlbGVjdCBhIGZpbGU/XCJcblxuICAkc2NvcGUuc3RhcnRVcGxvYWQgPSAoKSAtPlxuICAgIGlmICRzY29wZS51cGxvYWRlclsnZmlsZSddP1xuICAgICAgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgZm9ybWRhdGEuYXBwZW5kKFwiamFyZmlsZVwiLCAkc2NvcGUudXBsb2FkZXJbJ2ZpbGUnXSlcbiAgICAgICRzY29wZS51cGxvYWRlclsndXBsb2FkJ10gPSBmYWxzZVxuICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIkluaXRpYWxpemluZyB1cGxvYWQuLi5cIlxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsXG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IHBhcnNlSW50KDEwMCAqIGV2ZW50LmxvYWRlZCAvIGV2ZW50LnRvdGFsKVxuICAgICAgeGhyLnVwbG9hZC5vbmVycm9yID0gKGV2ZW50KSAtPlxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3Byb2dyZXNzJ10gPSBudWxsXG4gICAgICAgICRzY29wZS51cGxvYWRlclsnZXJyb3InXSA9IFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdXBsb2FkaW5nIHlvdXIgZmlsZVwiXG4gICAgICB4aHIudXBsb2FkLm9ubG9hZCA9IChldmVudCkgLT5cbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gbnVsbFxuICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiU2F2aW5nLi4uXCJcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgICAgICBpZiB4aHIucmVhZHlTdGF0ZSA9PSA0XG4gICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3I/XG4gICAgICAgICAgICAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSByZXNwb25zZS5lcnJvclxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlVwbG9hZGVkIVwiXG4gICAgICB4aHIub3BlbihcIlBPU1RcIiwgZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqYXJzL3VwbG9hZFwiKVxuICAgICAgeGhyLnNlbmQoZm9ybWRhdGEpXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2coXCJVbmV4cGVjdGVkIEVycm9yLiBUaGlzIHNob3VsZCBub3QgaGFwcGVuXCIpXG5cbi5maWx0ZXIgJ2dldEphclNlbGVjdENsYXNzJywgLT5cbiAgKHNlbGVjdGVkLCBhY3R1YWwpIC0+XG4gICAgaWYgc2VsZWN0ZWQgPT0gYWN0dWFsXG4gICAgICBcImZhLWNoZWNrLXNxdWFyZVwiXG4gICAgZWxzZVxuICAgICAgXCJmYS1zcXVhcmUtb1wiXG4iLCJhbmd1bGFyLm1vZHVsZSgnZmxpbmtBcHAnKS5jb250cm9sbGVyKCdKb2JTdWJtaXRDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBKb2JTdWJtaXRTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnLCAkc3RhdGUsICRsb2NhdGlvbikge1xuICB2YXIgcmVmcmVzaDtcbiAgJHNjb3BlLnlhcm4gPSAkbG9jYXRpb24uYWJzVXJsKCkuaW5kZXhPZihcIi9wcm94eS9hcHBsaWNhdGlvbl9cIikgIT09IC0xO1xuICAkc2NvcGUubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSm9iU3VibWl0U2VydmljZS5sb2FkSmFyTGlzdCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLmFkZHJlc3MgPSBkYXRhLmFkZHJlc3M7XG4gICAgICAkc2NvcGUubm9hY2Nlc3MgPSBkYXRhLmVycm9yO1xuICAgICAgcmV0dXJuICRzY29wZS5qYXJzID0gZGF0YS5maWxlcztcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmRlZmF1bHRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wbGFuID0gbnVsbDtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgIHJldHVybiAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZDogbnVsbCxcbiAgICAgIHBhcmFsbGVsaXNtOiBcIlwiLFxuICAgICAgc2F2ZXBvaW50UGF0aDogXCJcIixcbiAgICAgIGFsbG93Tm9uUmVzdG9yZWRTdGF0ZTogZmFsc2UsXG4gICAgICAnZW50cnktY2xhc3MnOiBcIlwiLFxuICAgICAgJ3Byb2dyYW0tYXJncyc6IFwiXCIsXG4gICAgICAncGxhbi1idXR0b24nOiBcIlNob3cgUGxhblwiLFxuICAgICAgJ3N1Ym1pdC1idXR0b24nOiBcIlN1Ym1pdFwiLFxuICAgICAgJ2FjdGlvbi10aW1lJzogMFxuICAgIH07XG4gIH07XG4gICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgJHNjb3BlLnVwbG9hZGVyID0ge307XG4gICRzY29wZS5sb2FkTGlzdCgpO1xuICByZWZyZXNoID0gJGludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUubG9hZExpc3QoKTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGludGVydmFsLmNhbmNlbChyZWZyZXNoKTtcbiAgfSk7XG4gICRzY29wZS5zZWxlY3RKYXIgPSBmdW5jdGlvbihpZCkge1xuICAgIGlmICgkc2NvcGUuc3RhdGUuc2VsZWN0ZWQgPT09IGlkKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLmRlZmF1bHRTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUuZGVmYXVsdFN0YXRlKCk7XG4gICAgICByZXR1cm4gJHNjb3BlLnN0YXRlLnNlbGVjdGVkID0gaWQ7XG4gICAgfVxuICB9O1xuICAkc2NvcGUuZGVsZXRlSmFyID0gZnVuY3Rpb24oZXZlbnQsIGlkKSB7XG4gICAgaWYgKCRzY29wZS5zdGF0ZS5zZWxlY3RlZCA9PT0gaWQpIHtcbiAgICAgICRzY29wZS5kZWZhdWx0U3RhdGUoKTtcbiAgICB9XG4gICAgYW5ndWxhci5lbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKFwiZmEtcmVtb3ZlXCIpLmFkZENsYXNzKFwiZmEtc3BpbiBmYS1zcGlubmVyXCIpO1xuICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmRlbGV0ZUphcihpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoXCJmYS1zcGluIGZhLXNwaW5uZXJcIikuYWRkQ2xhc3MoXCJmYS1yZW1vdmVcIik7XG4gICAgICBpZiAoZGF0YS5lcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhbGVydChkYXRhLmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmxvYWRFbnRyeUNsYXNzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiAkc2NvcGUuc3RhdGVbJ2VudHJ5LWNsYXNzJ10gPSBuYW1lO1xuICB9O1xuICAkc2NvcGUuZ2V0UGxhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3Rpb247XG4gICAgaWYgKCRzY29wZS5zdGF0ZVsncGxhbi1idXR0b24nXSA9PT0gXCJTaG93IFBsYW5cIikge1xuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb247XG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCI7XG4gICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIkdldHRpbmcgUGxhblwiO1xuICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICRzY29wZS5wbGFuID0gbnVsbDtcbiAgICAgIHJldHVybiBKb2JTdWJtaXRTZXJ2aWNlLmdldFBsYW4oJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ11cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoYWN0aW9uID09PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10pIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3BsYW4tYnV0dG9uJ10gPSBcIlNob3cgUGxhblwiO1xuICAgICAgICAgICRzY29wZS5lcnJvciA9IGRhdGEuZXJyb3I7XG4gICAgICAgICAgcmV0dXJuICRzY29wZS5wbGFuID0gZGF0YS5wbGFuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5ydW5Kb2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0aW9uO1xuICAgIGlmICgkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9PT0gXCJTdWJtaXRcIikge1xuICAgICAgYWN0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10gPSBhY3Rpb247XG4gICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0dGluZ1wiO1xuICAgICAgJHNjb3BlLnN0YXRlWydwbGFuLWJ1dHRvbiddID0gXCJTaG93IFBsYW5cIjtcbiAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgICByZXR1cm4gSm9iU3VibWl0U2VydmljZS5ydW5Kb2IoJHNjb3BlLnN0YXRlLnNlbGVjdGVkLCB7XG4gICAgICAgICdlbnRyeS1jbGFzcyc6ICRzY29wZS5zdGF0ZVsnZW50cnktY2xhc3MnXSxcbiAgICAgICAgcGFyYWxsZWxpc206ICRzY29wZS5zdGF0ZS5wYXJhbGxlbGlzbSxcbiAgICAgICAgJ3Byb2dyYW0tYXJncyc6ICRzY29wZS5zdGF0ZVsncHJvZ3JhbS1hcmdzJ10sXG4gICAgICAgIHNhdmVwb2ludFBhdGg6ICRzY29wZS5zdGF0ZVsnc2F2ZXBvaW50UGF0aCddLFxuICAgICAgICBhbGxvd05vblJlc3RvcmVkU3RhdGU6ICRzY29wZS5zdGF0ZVsnYWxsb3dOb25SZXN0b3JlZFN0YXRlJ11cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoYWN0aW9uID09PSAkc2NvcGUuc3RhdGVbJ2FjdGlvbi10aW1lJ10pIHtcbiAgICAgICAgICAkc2NvcGUuc3RhdGVbJ3N1Ym1pdC1idXR0b24nXSA9IFwiU3VibWl0XCI7XG4gICAgICAgICAgJHNjb3BlLmVycm9yID0gZGF0YS5lcnJvcjtcbiAgICAgICAgICBpZiAoZGF0YS5qb2JpZCAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJHN0YXRlLmdvKFwic2luZ2xlLWpvYi5wbGFuLnN1YnRhc2tzXCIsIHtcbiAgICAgICAgICAgICAgam9iaWQ6IGRhdGEuam9iaWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgJHNjb3BlLmNoYW5nZU5vZGUgPSBmdW5jdGlvbihub2RlaWQpIHtcbiAgICBpZiAobm9kZWlkICE9PSAkc2NvcGUubm9kZWlkKSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbm9kZWlkO1xuICAgICAgJHNjb3BlLnZlcnRleCA9IG51bGw7XG4gICAgICAkc2NvcGUuc3VidGFza3MgPSBudWxsO1xuICAgICAgJHNjb3BlLmFjY3VtdWxhdG9ycyA9IG51bGw7XG4gICAgICByZXR1cm4gJHNjb3BlLiRicm9hZGNhc3QoJ3JlbG9hZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubm9kZWlkID0gbnVsbDtcbiAgICAgICRzY29wZS5ub2RlVW5mb2xkZWQgPSBmYWxzZTtcbiAgICAgICRzY29wZS52ZXJ0ZXggPSBudWxsO1xuICAgICAgJHNjb3BlLnN1YnRhc2tzID0gbnVsbDtcbiAgICAgIHJldHVybiAkc2NvcGUuYWNjdW11bGF0b3JzID0gbnVsbDtcbiAgICB9XG4gIH07XG4gICRzY29wZS5jbGVhckZpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS51cGxvYWRlciA9IHt9O1xuICB9O1xuICAkc2NvcGUudXBsb2FkRmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuICAgICRzY29wZS51cGxvYWRlciA9IHt9O1xuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICRzY29wZS51cGxvYWRlclsnZmlsZSddID0gZmlsZXNbMF07XG4gICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWyd1cGxvYWQnXSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkRpZCB5YSBmb3JnZXQgdG8gc2VsZWN0IGEgZmlsZT9cIjtcbiAgICB9XG4gIH07XG4gIHJldHVybiAkc2NvcGUuc3RhcnRVcGxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybWRhdGEsIHhocjtcbiAgICBpZiAoJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10gIT0gbnVsbCkge1xuICAgICAgZm9ybWRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZvcm1kYXRhLmFwcGVuZChcImphcmZpbGVcIiwgJHNjb3BlLnVwbG9hZGVyWydmaWxlJ10pO1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWyd1cGxvYWQnXSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIkluaXRpYWxpemluZyB1cGxvYWQuLi5cIjtcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsO1xuICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydwcm9ncmVzcyddID0gcGFyc2VJbnQoMTAwICogZXZlbnQubG9hZGVkIC8gZXZlbnQudG90YWwpO1xuICAgICAgfTtcbiAgICAgIHhoci51cGxvYWQub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ2Vycm9yJ10gPSBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHVwbG9hZGluZyB5b3VyIGZpbGVcIjtcbiAgICAgIH07XG4gICAgICB4aHIudXBsb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS51cGxvYWRlclsncHJvZ3Jlc3MnXSA9IG51bGw7XG4gICAgICAgIHJldHVybiAkc2NvcGUudXBsb2FkZXJbJ3N1Y2Nlc3MnXSA9IFwiU2F2aW5nLi4uXCI7XG4gICAgICB9O1xuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgJHNjb3BlLnVwbG9hZGVyWydlcnJvciddID0gcmVzcG9uc2UuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBudWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnVwbG9hZGVyWydzdWNjZXNzJ10gPSBcIlVwbG9hZGVkIVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHhoci5vcGVuKFwiUE9TVFwiLCBmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImphcnMvdXBsb2FkXCIpO1xuICAgICAgcmV0dXJuIHhoci5zZW5kKGZvcm1kYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBFcnJvci4gVGhpcyBzaG91bGQgbm90IGhhcHBlblwiKTtcbiAgICB9XG4gIH07XG59KS5maWx0ZXIoJ2dldEphclNlbGVjdENsYXNzJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihzZWxlY3RlZCwgYWN0dWFsKSB7XG4gICAgaWYgKHNlbGVjdGVkID09PSBhY3R1YWwpIHtcbiAgICAgIHJldHVybiBcImZhLWNoZWNrLXNxdWFyZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJmYS1zcXVhcmUtb1wiO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdKb2JTdWJtaXRTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG5cbiAgQGxvYWRKYXJMaXN0ID0gKCkgLT5cbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImphcnMvXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBkZWxldGVKYXIgPSAoaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5kZWxldGUoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJqYXJzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KGlkKSlcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBnZXRQbGFuID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9wbGFuXCIsIHtwYXJhbXM6IGFyZ3N9KVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAcnVuSm9iID0gKGlkLCBhcmdzKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAucG9zdChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcImphcnMvXCIgKyBlbmNvZGVVUklDb21wb25lbnQoaWQpICsgXCIvcnVuXCIsIHt9LCB7cGFyYW1zOiBhcmdzfSlcbiAgICAuc3VjY2VzcyAoZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIC0+XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQFxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnSm9iU3VibWl0U2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkSmFyTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIikuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHRoaXMuZGVsZXRlSmFyID0gZnVuY3Rpb24oaWQpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwW1wiZGVsZXRlXCJdKGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmdldFBsYW4gPSBmdW5jdGlvbihpZCwgYXJncykge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9wbGFuXCIsIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLnJ1bkpvYiA9IGZ1bmN0aW9uKGlkLCBhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkO1xuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cC5wb3N0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwiamFycy9cIiArIGVuY29kZVVSSUNvbXBvbmVudChpZCkgKyBcIi9ydW5cIiwge30sIHtcbiAgICAgIHBhcmFtczogYXJnc1xuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5jb250cm9sbGVyICdBbGxUYXNrTWFuYWdlcnNDb250cm9sbGVyJywgKCRzY29wZSwgVGFza01hbmFnZXJzU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5tYW5hZ2VycyA9IGRhdGFcblxuICByZWZyZXNoID0gJGludGVydmFsIC0+XG4gICAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuIChkYXRhKSAtPlxuICAgICAgJHNjb3BlLm1hbmFnZXJzID0gZGF0YVxuICAsIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXVxuXG4gICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlckNvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLm1ldHJpY3MgPSB7fVxuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZE1ldHJpY3MoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUubWV0cmljcyA9IGRhdGFbMF1cblxuICAgIHJlZnJlc2ggPSAkaW50ZXJ2YWwgLT5cbiAgICAgIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTWV0cmljcygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdXG4gICAgLCBmbGlua0NvbmZpZ1tcInJlZnJlc2gtaW50ZXJ2YWxcIl1cblxuICAgICRzY29wZS4kb24gJyRkZXN0cm95JywgLT5cbiAgICAgICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaClcblxuLmNvbnRyb2xsZXIgJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLmxvZyA9IHt9XG4gICRzY29wZS50YXNrbWFuYWdlcmlkID0gJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWRcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuIChkYXRhKSAtPlxuICAgICRzY29wZS5sb2cgPSBkYXRhXG5cbiAgJHNjb3BlLnJlbG9hZERhdGEgPSAoKSAtPlxuICAgIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkTG9ncygkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbiAoZGF0YSkgLT5cbiAgICAgICRzY29wZS5sb2cgPSBkYXRhXG5cbi5jb250cm9sbGVyICdTaW5nbGVUYXNrTWFuYWdlclN0ZG91dENvbnRyb2xsZXInLCAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykgLT5cbiAgJHNjb3BlLnN0ZG91dCA9IHt9XG4gICRzY29wZS50YXNrbWFuYWdlcmlkID0gJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWRcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRTdGRvdXQoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgJHNjb3BlLnN0ZG91dCA9IGRhdGFcblxuICAkc2NvcGUucmVsb2FkRGF0YSA9ICgpIC0+XG4gICAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRTdGRvdXQoJHN0YXRlUGFyYW1zLnRhc2ttYW5hZ2VyaWQpLnRoZW4gKGRhdGEpIC0+XG4gICAgICAkc2NvcGUuc3Rkb3V0ID0gZGF0YVxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuY29udHJvbGxlcignQWxsVGFza01hbmFnZXJzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgVGFza01hbmFnZXJzU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICB2YXIgcmVmcmVzaDtcbiAgVGFza01hbmFnZXJzU2VydmljZS5sb2FkTWFuYWdlcnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm1hbmFnZXJzID0gZGF0YTtcbiAgfSk7XG4gIHJlZnJlc2ggPSAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFRhc2tNYW5hZ2Vyc1NlcnZpY2UubG9hZE1hbmFnZXJzKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gJHNjb3BlLm1hbmFnZXJzID0gZGF0YTtcbiAgICB9KTtcbiAgfSwgZmxpbmtDb25maWdbXCJyZWZyZXNoLWludGVydmFsXCJdKTtcbiAgcmV0dXJuICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRpbnRlcnZhbC5jYW5jZWwocmVmcmVzaCk7XG4gIH0pO1xufSkuY29udHJvbGxlcignU2luZ2xlVGFza01hbmFnZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZSwgJGludGVydmFsLCBmbGlua0NvbmZpZykge1xuICB2YXIgcmVmcmVzaDtcbiAgJHNjb3BlLm1ldHJpY3MgPSB7fTtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLm1ldHJpY3MgPSBkYXRhWzBdO1xuICB9KTtcbiAgcmVmcmVzaCA9ICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRNZXRyaWNzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUubWV0cmljcyA9IGRhdGFbMF07XG4gICAgfSk7XG4gIH0sIGZsaW5rQ29uZmlnW1wicmVmcmVzaC1pbnRlcnZhbFwiXSk7XG4gIHJldHVybiAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaW50ZXJ2YWwuY2FuY2VsKHJlZnJlc2gpO1xuICB9KTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZVRhc2tNYW5hZ2VyTG9nc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLCAkaW50ZXJ2YWwsIGZsaW5rQ29uZmlnKSB7XG4gICRzY29wZS5sb2cgPSB7fTtcbiAgJHNjb3BlLnRhc2ttYW5hZ2VyaWQgPSAkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZDtcbiAgU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJHNjb3BlLmxvZyA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gJHNjb3BlLnJlbG9hZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlLmxvYWRMb2dzKCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUubG9nID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbn0pLmNvbnRyb2xsZXIoJ1NpbmdsZVRhc2tNYW5hZ2VyU3Rkb3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UsICRpbnRlcnZhbCwgZmxpbmtDb25maWcpIHtcbiAgJHNjb3BlLnN0ZG91dCA9IHt9O1xuICAkc2NvcGUudGFza21hbmFnZXJpZCA9ICRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkO1xuICBTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UubG9hZFN0ZG91dCgkc3RhdGVQYXJhbXMudGFza21hbmFnZXJpZCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICRzY29wZS5zdGRvdXQgPSBkYXRhO1xuICB9KTtcbiAgcmV0dXJuICRzY29wZS5yZWxvYWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFNpbmdsZVRhc2tNYW5hZ2VyU2VydmljZS5sb2FkU3Rkb3V0KCRzdGF0ZVBhcmFtcy50YXNrbWFuYWdlcmlkKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiAkc2NvcGUuc3Rkb3V0ID0gZGF0YTtcbiAgICB9KTtcbiAgfTtcbn0pO1xuIiwiI1xuIyBMaWNlbnNlZCB0byB0aGUgQXBhY2hlIFNvZnR3YXJlIEZvdW5kYXRpb24gKEFTRikgdW5kZXIgb25lXG4jIG9yIG1vcmUgY29udHJpYnV0b3IgbGljZW5zZSBhZ3JlZW1lbnRzLiAgU2VlIHRoZSBOT1RJQ0UgZmlsZVxuIyBkaXN0cmlidXRlZCB3aXRoIHRoaXMgd29yayBmb3IgYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuIyByZWdhcmRpbmcgY29weXJpZ2h0IG93bmVyc2hpcC4gIFRoZSBBU0YgbGljZW5zZXMgdGhpcyBmaWxlXG4jIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGVcbiMgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG4jIHdpdGggdGhlIExpY2Vuc2UuICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiNcbiMgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuI1xuIyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4jIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiMgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4jIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiMgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4jXG5cbmFuZ3VsYXIubW9kdWxlKCdmbGlua0FwcCcpXG5cbi5zZXJ2aWNlICdUYXNrTWFuYWdlcnNTZXJ2aWNlJywgKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIC0+XG4gIEBsb2FkTWFuYWdlcnMgPSAoKSAtPlxuICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuXG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICBAXG5cbi5zZXJ2aWNlICdTaW5nbGVUYXNrTWFuYWdlclNlcnZpY2UnLCAoJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkgLT5cbiAgQGxvYWRNZXRyaWNzID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkKVxuICAgIC5zdWNjZXNzIChkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykgLT5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YVsndGFza21hbmFnZXJzJ10pXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgQGxvYWRMb2dzID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvbG9nXCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBsb2FkU3Rkb3V0ID0gKHRhc2ttYW5hZ2VyaWQpIC0+XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG5cbiAgICAkaHR0cC5nZXQoZmxpbmtDb25maWcuam9iU2VydmVyICsgXCJ0YXNrbWFuYWdlcnMvXCIgKyB0YXNrbWFuYWdlcmlkICsgXCIvc3Rkb3V0XCIpXG4gICAgLnN1Y2Nlc3MgKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSAtPlxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIEBcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2ZsaW5rQXBwJykuc2VydmljZSgnVGFza01hbmFnZXJzU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBmbGlua0NvbmZpZywgJHEpIHtcbiAgdGhpcy5sb2FkTWFuYWdlcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmZXJyZWQ7XG4gICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICRodHRwLmdldChmbGlua0NvbmZpZy5qb2JTZXJ2ZXIgKyBcInRhc2ttYW5hZ2Vyc1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhWyd0YXNrbWFuYWdlcnMnXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIHJldHVybiB0aGlzO1xufSkuc2VydmljZSgnU2luZ2xlVGFza01hbmFnZXJTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGZsaW5rQ29uZmlnLCAkcSkge1xuICB0aGlzLmxvYWRNZXRyaWNzID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnJlc29sdmUoZGF0YVsndGFza21hbmFnZXJzJ10pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuICB0aGlzLmxvYWRMb2dzID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL2xvZ1wiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgdGhpcy5sb2FkU3Rkb3V0ID0gZnVuY3Rpb24odGFza21hbmFnZXJpZCkge1xuICAgIHZhciBkZWZlcnJlZDtcbiAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJGh0dHAuZ2V0KGZsaW5rQ29uZmlnLmpvYlNlcnZlciArIFwidGFza21hbmFnZXJzL1wiICsgdGFza21hbmFnZXJpZCArIFwiL3N0ZG91dFwiKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59KTtcbiJdfQ==
