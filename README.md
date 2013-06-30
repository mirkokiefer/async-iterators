#async-iterators
Utility functions for async iterators in Node.js.

An async iterator is an object with a `next(cb)` method.
Invoking the method will return the next item of an underlying data source.

This library gives you some useful functions like `forEach` and `map` for iterators:

``` js
var iterators = require('async-iterators')

iterators.forEach(someIterator, function(err, data) {
  console.log(data)
}, function() {
  console.log('end')
})
```

Some libraries using the async iterator pattern:

- [stream-iterator](https://github.com/mirkokiefer/stream-iterator) - wrap any stream into an async iterator
- [node-leveldown](https://github.com/rvagg/node-leveldown#iteratornextcallback) - allows you to iterate over entries in LevelDB

##License
MIT