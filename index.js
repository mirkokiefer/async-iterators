
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

var map = function(iterator, fn) {
  return {
    next: function(cb) {
      iterator.next(function(err, res) {
        if ((res === undefined) || err) return cb(err, undefined)
        var mappedRes = fn(err, res)
        cb(err, mappedRes)
      })
    }
  }
}

var mapAsync = function(iterator, fn) {
  return {
    next: function(cb) {
      iterator.next(function(err, res) {
        if ((res === undefined) || err) return cb(err, undefined)
        fn(err, res, function(err, mappedRes) {
          cb(err, mappedRes)          
        })
      })
    }
  }
}

var filter = function(iterator, fn) {
  var next = function(cb) {
    iterator.next(function(err, res) {
      if (res === undefined) return cb(err, undefined)
      if (fn(err, res)) {
        cb(null, res)
      } else {
        next(cb)
      }
    })
  }
  return {
    next: next
  }
}

var filterAsync = function(iterator, fn) {
  var next = function(cb) {
    iterator.next(function(err, res) {
      if (res === undefined) return cb(err, undefined)
      fn(err, res, function(err, passedFilter) {
        if (passedFilter)  {
          cb(null, res)
        } else {
          next(cb)
        }
      })
    })
  }
  return {
    next: next
  }
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
  filter: filter,
  filterAsync: filterAsync,
  toArray: toArray
}