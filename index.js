
var forEach = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err)
    fn.apply(this, arguments)
    forEach(iterator, fn, cb)
  })
}

var forEachAsync = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err)
    var args = Array.prototype.slice.call(arguments)
    args.push(function() {
      forEachAsync(iterator, fn, cb)      
    })
    fn.apply(this, args)
  })
}

var map = function(iterator, fn, cb) {
  var result = []
  forEach(iterator, function(err, res) {
    result.push(fn.apply(this, arguments))
  }, function(err) {
    cb(err, result)
  })
}

var mapAsync = function(iterator, fn, cb) {
  var result = []
  forEachAsync(iterator, function(err, res) {
    var cb = arguments[arguments.length-1]
    arguments[arguments.length-1] = function(err, mapRes) {
      result.push(mapRes)
      cb()
    }
    fn.apply(this, arguments)
  }, function(err) {
    cb(err, result)
  })
}

module.exports = {
  forEach: forEach,
  forEachAsync: forEachAsync,
  map: map,
  mapAsync: mapAsync
}