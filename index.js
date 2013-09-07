
var EventEmitter = require('events').EventEmitter

var iterators = {}

iterators.forEach = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err, undefined)
    fn(err, res)
    iterators.forEach(iterator, fn, cb)
  })
}

iterators.forEachAsync = function(iterator, fn, cb) {
  iterator.next(function(err, res) {
    if (res === undefined) return cb(err, undefined)
    fn(err, res, function() {
      iterators.forEachAsync(iterator, fn, cb)      
    })
  })
}

iterators.map = function(iterator, fn) {
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

iterators.mapAsync = function(iterator, fn) {
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

iterators.filter = function(iterator, fn) {
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

iterators.filterAsync = function(iterator, fn) {
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

iterators.buffer = function(iterator, size) {
  var buffer = []
  var bufferingInProgress = false
  var hasEnded = false
  var bufferEvents = new EventEmitter()

  var readBuffer = function(cb) {
    if (buffer.length) {
      cb(null, buffer.shift())
    } else {
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
      buffer.push(res)
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

iterators.fromArray = function(array, cb) {
  var i = 0
  return {
    next: function(cb) {
      if (i == array.length) return cb(null, undefined)
      var value = array[i]
      i++
      cb(null, value)
    }
  }
}

iterators.fromReadableStream = function(readable) {
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

iterators.toArray = function(iterator, cb) {
  var array = []
  iterators.forEach(iterator, function(err, each) {
    array.push(each)
  }, function() {
    cb(null, array)
  })
}

iterators.range = function(iterator, opts) {
  var from = opts.from
  var to = opts.to
  var pos = -1
  var next = function(cb) {
    iterator.next(function(err, value) {
      pos++
      if (pos < from) return next(cb)
      if (pos > to) return cb(null, undefined)
      cb(err, value)
    })
  }
  return {next: next}
}

iterators.toWritableStream = function(iterator, writeStream, encoding, cb) {
  write(cb);
  function write(cb) {
    iterator.next(function(err, res) {
      if (res === undefined) return writeStream.write('', encoding, cb)
      if (writeStream.write(res, encoding)) {
        write(cb)
      } else {
        writeStream.once('drain', function() { write(cb) })
      }
    })
  }
}

module.exports = iterators
