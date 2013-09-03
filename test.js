
var assert = require('assert')
var iterators = require('./index')


var numbers = []
for (var i = 1; i < 100; i++) {
  numbers.push(i)
}
var doubleFn = function(each) { return each * 2 }
var numbersDoubled = numbers.map(doubleFn)
var evenFn = function(each) { return (each % 2) == 0 }
var evenNumbers = numbers.filter(evenFn)

var createMockAsyncIterator = function() {
  var index = -1
  var next = function(cb) {
    setTimeout(function() {
      index++
      if (!numbers[index]) return cb(null, undefined)
      cb(null, numbers[index])
    }, 1)
  }
  return {next: next}
}

var runForEachIteratorTest = function(iterator, cb) {
  var index = 0
  iterators.forEach(iterator, function(err, each) {
    assert.equal(each, numbers[index])
    index++
  }, function() {
    assert.equal(index, numbers.length)
    cb()
  })
}

describe('async-iterators', function() {
  it('should run forEach on an iterator', function(done) {
    var iterator = createMockAsyncIterator()
    runForEachIteratorTest(iterator, done)
  })
  it('should run forEachAsync on an iterator', function(done) {
    var iterator = createMockAsyncIterator()
    var index = 0
    iterators.forEachAsync(iterator, function(err, each, cb) {
      assert.equal(each, numbers[index])
      index++
      cb()
    }, function() {
      assert.equal(index, numbers.length)
      done()
    })
  })
  it('should pipe an iterator to an array', function(done) {
    var iterator = createMockAsyncIterator()
    iterators.toArray(iterator, function(err, res) {
      assert.deepEqual(res, numbers)
      done()
    })
  })
  it('should create a map iterator and pipe to array', function(done) {
    var iterator = createMockAsyncIterator()
    var doublingIterator = iterators.map(iterator, function(err, each) {
      return doubleFn(each)
    })
    iterators.toArray(doublingIterator, function(err, res) {
      assert.deepEqual(res, numbersDoubled)
      done()
    })
  })
  it('should create an asyncMap iterator', function(done) {
    var iterator = createMockAsyncIterator()
    var doublingIterator = iterators.mapAsync(iterator, function(err, each, cb) {
      cb(null, doubleFn(each))
    })
    iterators.toArray(doublingIterator, function(err, res) {
      assert.deepEqual(res, numbersDoubled)
      done()
    })
  })
  it('should create a filter iterator', function(done) {
    var iterator = createMockAsyncIterator()
    var filterIterator = iterators.filter(iterator, function(err, each) {
      return evenFn(each)
    })
    iterators.toArray(filterIterator, function(err, res) {
      assert.deepEqual(res, evenNumbers)
      done()
    })
  })
  it('should create an async filter iterator', function(done) {
    var iterator = createMockAsyncIterator()
    var filterIterator = iterators.filterAsync(iterator, function(err, each, cb) {
      cb(null, evenFn(each))
    })
    iterators.toArray(filterIterator, function(err, res) {
      assert.deepEqual(res, evenNumbers)
      done()
    })
  })
  it('should create a buffering iterator', function(done) {
    var iterator = createMockAsyncIterator()
    var bufferIterator = iterators.buffer(iterator, 10)
    var bufferFillRatio = 0
    var slowMapIterator = iterators.mapAsync(bufferIterator, function(err, res, cb) {
      setTimeout(function() {
        bufferFillRatio += bufferIterator.bufferFillRatio() / numbers.length
        cb(null, res)
      }, 2)
    })
    iterators.toArray(slowMapIterator, function(err, res) {
      assert.deepEqual(res, numbers)
      console.log(bufferFillRatio)
      assert.ok(bufferFillRatio > 0.5)
      done()
    })
  })
  it('should create an array iterator', function(done) {
    var arrayIterator = iterators.fromArray(numbers)
    iterators.toArray(arrayIterator, function(err, res) {
      assert.deepEqual(res, numbers)
      done()
    })
  })
  it('should create a range iterator', function(done) {
    var iterator = createMockAsyncIterator()
    var rangeIterator = iterators.range(iterator, {from: 10, to: 19})
    iterators.toArray(rangeIterator, function(err, res) {
      assert.deepEqual(res, numbers.slice(10, 20))
      done()
    })
  })
  it('should create a range iterator with no end', function(done) {
    var iterator = createMockAsyncIterator()
    var rangeIterator = iterators.range(iterator, {from: 90})
    iterators.toArray(rangeIterator, function(err, res) {
      assert.deepEqual(res, numbers.slice(90))
      done()
    })
  })
  it('should create a range iterator with no start', function(done) {
    var iterator = createMockAsyncIterator()
    var rangeIterator = iterators.range(iterator, {to: 19})
    iterators.toArray(rangeIterator, function(err, res) {
      assert.deepEqual(res, numbers.slice(0, 20))
      done()
    })
  })
})
