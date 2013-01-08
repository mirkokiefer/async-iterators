
var createStreamIterator = function(readable) {
  var isReadable = true
  var hasEnded = false

  readable.on('readable', function() {
    isReadable = true
  })
  readable.on('end', function() {
    hasEnded = true
  })

  var next = function(cb) {
    if (hasEnded) {
      return cb(null, undefined)
    }
    if (isReadable) {
      var res = readable.read()
      if (res === null) {
        isReadable = false
        return next(cb)
      }
      cb(null, res)
    } else {
      var onEnd = function() { next(cb) }
      readable.once('readable', function() {
        readable.removeListener('end', onEnd)
        next(cb)
      })
      readable.once('end', onEnd)
    }
  }

  return {next: next}
}

var forEach = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err)
    fn(err, res)
    forEach(iterator, fn, cb)
  })
}

var forEachAsync = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err)
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

module.exports = {
  createStreamIterator: createStreamIterator,
  forEach: forEach,
  forEachAsync: forEachAsync,
  map: map,
  mapAsync: mapAsync
}