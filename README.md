#async-iterators
[![Build Status](https://travis-ci.org/mirkokiefer/async-iterators.png?branch=master)](https://travis-ci.org/mirkokiefer/async-iterators)

[![NPM](https://nodei.co/npm/async-iterators.png)](https://nodei.co/npm/async-iterators/)

Utility functions for async iterators in Node.js.

An async iterator is an object with a `next(cb)` method.
Invoking the method should return the next item of an underlying data source.

This library gives you some useful abstract iterators and utility functions.

An example with a pointless iterator that asynchronously returns the numbers from 1 to 100:

``` js
var iterators = require('async-iterators')

function createExampleIterator = function() {
  var i = 0
  return {
    next: function(cb) {
      i++
      if (i == 100) return cb(null, undefined)
      cb(null, i)
    }
  }
}

var myIterator = createExampleIterator()

// wrap myIterator with a map iterator that doubles all results
var doublingIterator = iterators.map(iterator, function(err, each) {
  return each * 2
})

// pipe the iterator to an array
iterators.toArray(doublingIterator, function(err, res) {
  console.log(res)
})
```

##Documentation
###Abstract Iterators
- [map](#map) / [mapAsync](#mapAsync)
- [filter](#filter) / [filterAsync](#filterAsync)

###Utilities
- [forEach](#forEach)
- [toArray](#toArray)

##Abstract Iterators

<a name="map" />
### map(iterator, mapFn)

``` js
var mapIterator = iterators.map(someNumberIterator, function(err, each) {
  return each * 2
})

// pipe the iterator to an array:
iterators.toArray(mapIterator, function(err, res) {
  console.log(res)
})
```

<a name="mapAsync" />
### mapAsync(iterator, mapFn)

``` js
var mapIterator = iterators.map(someNumberIterator, function(err, each, cb) {
  cb(null, each * 2)
})
```

<a name="filter" />
### filter(iterator, filterFn)

``` js
var evenNumbersIterator = iterators.filter(someNumberIterator, function(err, each) {
  return (each % 2) == 0
})
```

<a name="filterAsync" />
### filterAsync(iterator, filterFn)

``` js
var evenNumbersIterator = iterators.filter(someNumberIterator, function(err, each, cb) {
  cb(null, (each % 2) == 0)
})
```

##Utilities

<a name="forEach" />
### forEach(iterator, fn, cb)

``` js
iterators.forEach(someIterator, function(err, data) {
  console.log(data)
}, function() {
  console.log('end')
})
```

<a name="toArray" />
### toArray(iterator, cb)

``` js
iterators.toArray(someIterator, function(err, array) {
  console.log(array)
})
```

##Other libraries

Some libraries using the async iterator pattern:

- [stream-iterator](https://github.com/mirkokiefer/stream-iterator) - wrap any stream into an async iterator
- [node-leveldown](https://github.com/rvagg/node-leveldown#iteratornextcallback) - allows you to iterate over entries in LevelDB

##Contributors
This project was created by Mirko Kiefer ([@mirkokiefer](https://github.com/mirkokiefer)).
