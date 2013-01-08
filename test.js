
var assert = require('assert')
var iterators = require('./index')
var stream = require('stream')

var data = [1, 2, 3, 4, 5]

var createMockAsyncIterator = function() {
  var index = -1
  var next = function(cb) {
    setTimeout(function() {
      index++
      cb(null, data[index])
    }, 1)
  }
  return {next: next}
}

var createMockStream = function() {
  var mockStream = stream.Readable({objectMode: true, highWaterMark: 2})
  var index = 0

  mockStream._read = function() {
    mockStream.push(data[index])
    index++
    if (index == 5) mockStream.push(null)
  }

  return mockStream
}

var runForEachIteratorTest = function(iterator, cb) {
  var index = 0
  iterators.forEach(iterator, function(err, res) {
    assert.equal(res, data[index])
    index++
  }, function() {
    assert.equal(index, 5)
    cb()
  })
}

describe('async-iterators', function() {
  it('should run forEach', function(done) {
    var iterator = createMockAsyncIterator()
    runForEachIteratorTest(iterator, done)
  })
  it('should run forEachAsync', function(done) {
    var iterator = createMockAsyncIterator()
    var index = 0
    iterators.forEachAsync(iterator, function(err, res, cb) {
      assert.equal(res, data[index])
      index++
      cb()
    }, function() {
      assert.equal(index, 5)
      done()
    })
  })
  it('should run map', function(done) {
    var iterator = createMockAsyncIterator()
    iterators.map(iterator, function(err, res) {
      return res * 2
    }, function(err, res) {
      res.forEach(function(each, i) {
        assert.equal(each, data[i] * 2)
      })
      done()
    })
  })
  it('should run mapAsync', function(done) {
    var iterator = createMockAsyncIterator()
    iterators.mapAsync(iterator, function(err, res, cb) {
      cb(null, res * 2)
    }, function(err, res) {
      res.forEach(function(each, i) {
        assert.equal(each, data[i] * 2)
      })
      done()
    })
  })
  it('should transform a stream into an iterator', function(done) {
    var mockStream = createMockStream()
    var mockStreamIterator = iterators.createStreamIterator(mockStream)
    runForEachIteratorTest(mockStreamIterator, done)
  })
})
