#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

angular.module('flinkApp')

.service 'MetricsService', ($http, $q, flinkConfig, $interval, watermarksConfig) ->
  @metrics = {}
  @values = {}
  @watched = {}
  @observer = {
    jobid: null
    nodeid: null
    callback: null
  }

  @refresh = $interval =>
    angular.forEach @metrics, (vertices, jobid) =>
      angular.forEach vertices, (metrics, nodeid) =>
        names = []
        angular.forEach metrics, (metric, index) =>
          names.push metric.id

        if names.length > 0
          @getMetrics(jobid, nodeid, names).then (values) =>
            if jobid == @observer.jobid && nodeid == @observer.nodeid
              @observer.callback(values) if @observer.callback


  , flinkConfig["refresh-interval"]

  @registerObserver = (jobid, nodeid, callback) ->
    @observer.jobid = jobid
    @observer.nodeid = nodeid
    @observer.callback = callback

  @unRegisterObserver = ->
    @observer = {
      jobid: null
      nodeid: null
      callback: null
    }

  @setupMetrics = (jobid, vertices) ->
    @setupLS()

    @watched[jobid] = []
    angular.forEach vertices, (v, k) =>
      @watched[jobid].push(v.id) if v.id

  @getWindow = ->
    100

  @setupLS = ->
    if !sessionStorage.flinkMetrics?
      @saveSetup()

    @metrics = JSON.parse(sessionStorage.flinkMetrics)

  @saveSetup = ->
    sessionStorage.flinkMetrics = JSON.stringify(@metrics)

  @saveValue = (jobid, nodeid, value) ->
    unless @values[jobid]?
      @values[jobid] = {}

    unless @values[jobid][nodeid]?
      @values[jobid][nodeid] = []

    @values[jobid][nodeid].push(value)

    if @values[jobid][nodeid].length > @getWindow()
      @values[jobid][nodeid].shift()

  @getValues = (jobid, nodeid, metricid) ->
    return [] unless @values[jobid]?
    return [] unless @values[jobid][nodeid]?

    results = []
    angular.forEach @values[jobid][nodeid], (v, k) =>
      if v.values[metricid]?
        results.push {
          x: v.timestamp
          y: v.values[metricid]
        }

    results

  @setupLSFor = (jobid, nodeid) ->
    if !@metrics[jobid]?
      @metrics[jobid] = {}

    if !@metrics[jobid][nodeid]?
      @metrics[jobid][nodeid] = []

  @addMetric = (jobid, nodeid, metricid) ->
    @setupLSFor(jobid, nodeid)

    @metrics[jobid][nodeid].push({id: metricid, size: 'small', view: 'chart'})

    @saveSetup()

  @removeMetric = (jobid, nodeid, metric) =>
    if @metrics[jobid][nodeid]?
      i = @metrics[jobid][nodeid].indexOf(metric)
      i = _.findIndex(@metrics[jobid][nodeid], { id: metric }) if i == -1

      @metrics[jobid][nodeid].splice(i, 1) if i != -1

      @saveSetup()

  @setMetricSize = (jobid, nodeid, metric, size) =>
    if @metrics[jobid][nodeid]?
      i = @metrics[jobid][nodeid].indexOf(metric.id)
      i = _.findIndex(@metrics[jobid][nodeid], { id: metric.id }) if i == -1

      @metrics[jobid][nodeid][i] = { id: metric.id, size: size, view: metric.view } if i != -1

      @saveSetup()

  @setMetricView = (jobid, nodeid, metric, view) =>
    if @metrics[jobid][nodeid]?
      i = @metrics[jobid][nodeid].indexOf(metric.id)
      i = _.findIndex(@metrics[jobid][nodeid], { id: metric.id }) if i == -1

      @metrics[jobid][nodeid][i] = { id: metric.id, size: metric.size, view: view } if i != -1

      @saveSetup()

  @orderMetrics = (jobid, nodeid, item, index) ->
    @setupLSFor(jobid, nodeid)

    angular.forEach @metrics[jobid][nodeid], (v, k) =>
      if v.id == item.id
        @metrics[jobid][nodeid].splice(k, 1)
        if k < index
          index = index - 1

    @metrics[jobid][nodeid].splice(index, 0, item)

    @saveSetup()

  @getMetricsSetup = (jobid, nodeid) =>
    {
      names: _.map(@metrics[jobid][nodeid], (value) =>
        if _.isString(value) then { id: value, size: "small", view: "chart" } else value
      )
    }

  @getAvailableMetrics = (jobid, nodeid) =>
    @setupLSFor(jobid, nodeid)

    deferred = $q.defer()

    $http.get flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics"
    .success (data) =>
      results = []
      angular.forEach data, (v, k) =>
        i = @metrics[jobid][nodeid].indexOf(v.id)
        i = _.findIndex(@metrics[jobid][nodeid], { id: v.id }) if i == -1

        if i == -1
          results.push(v)

      deferred.resolve(results)

    deferred.promise

  @getAllAvailableMetrics = (jobid, nodeid) =>
    deferred = $q.defer()

    $http.get flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics"
    .success (data) =>
      deferred.resolve(data)

    deferred.promise

  @getMetrics = (jobid, nodeid, metricIds) ->
    deferred = $q.defer()

    ids = metricIds.join(",")

    $http.get flinkConfig.jobServer + "jobs/" + jobid + "/vertices/" + nodeid + "/metrics?get=" + ids
    .success (data) =>
      result = {}
      angular.forEach data, (v, k) ->
        result[v.id] = parseInt(v.value)

      newValue = {
        timestamp: Date.now()
        values: result
      }
      @saveValue(jobid, nodeid, newValue)
      deferred.resolve(newValue)

    deferred.promise


  # Asynchronously requests the watermark metrics for the given nodes. The
  # returned object has the following structure:
  #
  # {
  #    "<nodeId>": {
  #          "lowWatermark": <lowWatermark>
  #          "watermarks": {
  #               0: <watermark for subtask 0>
  #               ...
  #               n: <watermark for subtask n>
  #            }
  #       }
  # }
  #
  # If no watermark is available, lowWatermark will be NaN and
  # the watermarks will be empty.
  @getWatermarks = (jid, nodes) ->
    # Requests the watermarks for a single vertex. Triggers a request
    # to the Metrics service.
    requestWatermarkForNode = (node) =>
      deferred = $q.defer()

      # Request metrics for each subtask
      metricIds = (i + ".currentLowWatermark" for i in [0..node.parallelism - 1])
      @getMetrics(jid, node.id, metricIds).then (metrics) ->
        minValue = NaN
        watermarks = {}

        for key, value of metrics.values
          subtaskIndex = key.replace('.currentLowWatermark', '')
          watermarks[subtaskIndex] = value

          if (isNaN(minValue) || value < minValue)
            minValue = value

        if (!isNaN(minValue) && minValue > watermarksConfig.noWatermark)
          lowWatermark = minValue
        else
          # NaN indicates no watermark available
          lowWatermark = NaN

        deferred.resolve({"lowWatermark": lowWatermark, "watermarks": watermarks})

      deferred.promise

    deferred = $q.defer()
    watermarks = {}

    # Request watermarks for each node and update watermarks
    len = nodes.length
    angular.forEach nodes, (node, index) =>
      pr = requestWatermarkForNode(node).then (data) ->
        watermarks[node.id] = data

      promises.push(pr)

    $q.all(promises).then () =>
      deferred.resolve(watermarks)

    deferred.promise

  @getGlobalOverview = (jid, nodes) ->
    deferred = $q.defer()

    promises = []

    getSourcesAndSinks = () =>
      predecessors = []
      sources = []
      sinks = []

      angular.forEach(nodes, (node) ->
        if !node.inputs
          sources.push(node.id)
        else
          predecessors = predecessors.concat(_.map(node.inputs, (input) -> input.id))
      )

      angular.forEach(nodes, (node) ->
        if !_.contains(predecessors, node.id)
          sinks.push(node.id)
      )

      [sources, sinks]

    [sources, sinks] = getSourcesAndSinks()

    incoming = 0
    outgoing = 0

    angular.forEach nodes, (node) =>
      metricIds = (i + ".numBytesOutPerSecond" for i in [0..node.parallelism - 1]).concat (i + ".numBytesInPerSecond" for i in [0..node.parallelism - 1])
      pr = @getMetrics(jid, node.id, metricIds).then (metrics) ->
        angular.forEach(_.keys(metrics.values), (key) =>
          if key.indexOf("numBytesOutPerSecond") != -1 && _.contains(sources, node.id)
            incoming += metrics.values[key]
          else if key.indexOf("numBytesInPerSecond") != -1 && _.contains(sinks, node.id)
            outgoing += metrics.values[key]
        )

      promises.push(pr)

    $q.all(promises).then () =>
      deferred.resolve({
        incoming: incoming,
        outgoing: outgoing,
      })

    deferred.promise

  @setupLS()

  @
