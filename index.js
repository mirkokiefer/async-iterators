
var forEach = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err, undefined)
    fn(err, res)
    forEach(iterator, fn, cb)
  })
}

var forEachAsync = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err, undefined)
    fn(err, res, function() {
      forEachAsync(iterator, fn, cb)      
    })
  })
}

var map = function(iterator, fn, cb) {
  var result = []
  forEach(iterator, function(err, res) {
    result.push(fn(err, res))
  }, function(err) {
    cb(err, result)
  })
}

var mapAsync = function(iterator, fn, cb) {
  var result = []
  forEachAsync(iterator, function(err, res, cb) {
    fn(err, res, function(err, mapRes) {
      result.push(mapRes)
      cb()
    })
  }, function(err) {
    cb(err, result)
  })
}

var toArray = function(iterator, cb) {
  var array = []
  forEach(iterator, function(err, each) {
    array.push(each)
  }, function() {
    cb(null, array)
  })
}

module.exports = {
  forEach: forEach,
  forEachAsync: forEachAsync,
  map: map,
  mapAsync: mapAsync,
  toArray: toArray
}