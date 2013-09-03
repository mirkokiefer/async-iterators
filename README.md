#async-iterators
[![Build Status](https://travis-ci.org/mirkokiefer/async-iterators.png?branch=master)](https://travis-ci.org/mirkokiefer/async-iterators)

[![NPM](https://nodei.co/npm/async-iterators.png)](https://nodei.co/npm/async-iterators/)

Useful abstractions and utility functions for async iterators in Node.js.

An async iterator is an object with a `next(cb)` method.
Invoking the method should return the next item of an underlying data source.
The callback should be a function of type `function(err, value)`.
If the iterator has no more data to read, it will call the callback with `value == undefined`.

Async iterators can easily be created from Node.js [Readable Streams](http://nodejs.org/api/stream.html#stream_class_stream_readable) by using [stream-iterator](https://github.com/mirkokiefer/stream-iterator).

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
###Iterators
- [map](#map) / [mapAsync](#mapAsync)
- [filter](#filter) / [filterAsync](#filterAsync)
- [range](#range)
- [buffer](#buffer)
- [fromArray](#fromArray)

###Utilities
- [forEach](#forEach)
- [toArray](#toArray)

##Abstract Iterators

<a name="map" />
### map(iterator, mapFn)
Create an iterator that applies a map function to transform each value of the source iterator.

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
Create an iterator that filters the values of the source iterator using a filter function.

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

<a name="range" />
### range(iterator, range)
Creates an iterator that only iteratores over the specified range.

`range` is specified as `{from: startIndex, to: endIndex}` where `from` and `to` are both inclusive.

``` js
var rangeIterator = iterators.range(iterator, {from: 10, to: 19})
```

<a name="buffer" />
### buffer(iterator, bufferSize)
Creates an iterator with an internal buffer that is always filled until `bufferSize`.
The buffer can abviously only grow if the buffer iterator is read slower than the underlying iterator source can return data.

The current buffer fill ratio can be inspected at any time using `bufferFillRatio()` which returns a number between 0..1.

The buffer size can be changed using `setBufferSize(bufferSize)`.

``` js
var bufferedIterator = iterators.buffer(someIterator, 10)

// inspect buffer size
console.log(bufferedIterator.bufferFillRatio())

// change the buffer size later
bufferedIterator.setBufferSize(100)
```

<a name="fromArray" />
### fromArray(array)
Creates an iterator from an array.

``` js
var arrayIterator = iterators.fromArray(numbers)
```

##Utilities

<a name="forEach" />
### forEach(iterator, fn, cb)
Reads the source iterator until the end and invokes `fn` for each value of the iterator.

``` js
iterators.forEach(someIterator, function(err, data) {
  console.log(data)
}, function() {
  console.log('end')
})
```

<a name="forEachAsync" />
### forEachAsync(iterator, fn, cb)
Reads the source iterator until the end and invokes `fn` for each value of the iterator.
Only once the callback is invoked the next value is read from the source iterator.

``` js
iterators.forEachAsync(someIterator, function(err, data, cb) {
  console.log(data)
  setTimeout(cb, 100)
}, function() {
  console.log('end')
})
```

<a name="toArray" />
### toArray(iterator, cb)
Reads the source iterator until the end and writes the values to an array.

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
