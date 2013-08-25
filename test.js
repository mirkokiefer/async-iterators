
var assert = require('assert')
var iterators = require('./index')

var data = [1, 2, 3, 4, 5]

var createMockAsyncIterator = function() {
  var index = -1
  var next = function(cb) {
    setTimeout(function() {
      index++
      if (!data[index]) return cb(null, undefined)
      cb(null, {data: data[index], index: index})
    }, 1)
  }
  return {next: next}
}

var runForEachIteratorTest = function(iterator, cb) {
  var index = 0
  iterators.forEach(iterator, function(err, each) {
    assert.equal(each.data, data[index])
    assert.equal(each.index, index)
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
    iterators.forEachAsync(iterator, function(err, each, cb) {
      assert.equal(each.data, data[index])
      assert.equal(each.index, index)
      index++
      cb()
    }, function() {
      assert.equal(index, 5)
      done()
    })
  })
  it('should run map', function(done) {
    var index = 0
    var iterator = createMockAsyncIterator()
    iterators.map(iterator, function(err, each) {
      assert.equal(each.index, index)
      index++
      return each.data * 2
    }, function(err, res) {
      res.forEach(function(each, i) {
        assert.equal(each, data[i] * 2)
      })
      done()
    })
  })
  it('should run mapAsync', function(done) {
    var index = 0
    var iterator = createMockAsyncIterator()
    iterators.mapAsync(iterator, function(err, each, cb) {
      assert.equal(each.index, index)
      index++
      cb(null, each.data * 2)
    }, function(err, res) {
      res.forEach(function(each, i) {
        assert.equal(each, data[i] * 2)
      })
      done()
    })
  })
})
