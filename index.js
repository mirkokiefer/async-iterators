
var EventEmitter = require('events').EventEmitter

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

var buffer = function(iterator, size) {
  var buffer = []
  var bufferingInProgress = false
  var hasEnded = false
  var bufferEvents = new EventEmitter()
  var popBuffer = function() {
    return buffer.shift()
  }
  var pushBuffer = function(data) {
    buffer.push(data)
  }
  var readBuffer = function(cb) {
    if (buffer.length) {
      var value = popBuffer()
      cb(null, value)
    } else {
      if (!bufferingInProgress) fillBuffer(cb)
      bufferEvents.once('data', function() {
        readBuffer(cb)
      })
    }
    if (!bufferingInProgress && !hasEnded && buffer.length < size) {
      fillBuffer()
    }
  }
  var fillBuffer = function(cb) {
    bufferingInProgress = true
    if ((buffer.length >= size) || hasEnded) {
      bufferingInProgress = false
      return
    }
    iterator.next(function(err, res) {
      if (res === undefined) hasEnded = true
      pushBuffer(res)
      bufferEvents.emit('data')
      fillBuffer(cb)
    })
  }

  var publicObj = {
    bufferFillRatio: function() { return buffer.length / size },
    next: function(cb) {
      readBuffer(function(err, res) {
        cb(err, res)
      })
    }
  }
  return publicObj
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
  buffer: buffer,
  toArray: toArray
}