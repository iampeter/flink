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

.service 'MainService', ($http, flinkConfig, $q) ->
  @loadConfig = ->
    deferred = $q.defer()

    $http.get flinkConfig.jobServer + "config"
    .success (data, status, headers, config) ->
      deferred.resolve(data)

    deferred.promise


  @

.service 'BytesService', () ->
  @humanize = (amount) ->
    return null if typeof amount is "undefined" or amount is null

    result = (v, u) ->
      [v, u]

    units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"]
    converter = (value, power) ->
      base = Math.pow(1024, power)
      if value < base
        return result((value / base).toFixed(2), units[power])
      else if value < base * 1000
        return result((value / base).toPrecision(3), units[power])
      else
        return converter(value, power + 1)

    if amount < 1000 then result(amount, "B") else converter(amount, 1)

  @
